import { Elysia, t } from "elysia";
import { cors } from "@elysiajs/cors";
import { html } from "@elysiajs/html";
import { staticPlugin } from "@elysiajs/static";
import { Logestic } from "logestic";

import { marked, Token } from "marked";
import { markedHighlight } from "marked-highlight";
import hljs from "highlight.js";
import DOMPurify from "isomorphic-dompurify";

import path from "node:path";
import { readdir } from "node:fs/promises";

import Handlebars from "handlebars";

import { connect } from "./db";
import { createPost, deletePost, getAllPosts, getPost, updatePost, searchForPost } from "./handler";

export interface Document {
    id: string;
    filename: string;
    title: string;
    author: string;
    content: string;
    created_at: string;
    views: number;
}

const views = path.resolve(__dirname, "views");

const base = Handlebars.compile(await Bun.file(`${views}/index.hbs`).text());
const partialArticles = Handlebars.compile(await Bun.file(`${views}/partials/articles.hbs`).text());

// Register partials
const registerPartials = async () => {
    const partialsDir = path.join(views, "/partials");
    const partialFiles = await readdir(partialsDir);

    partialFiles.forEach(async (partialFile) => {
        const partialName = partialFile.replace(".hbs", "");
        const partialPath = path.join(partialsDir, partialFile);
        const partialContent = await Bun.file(partialPath).text();
        Handlebars.registerPartial(partialName, partialContent);
    });
};

await registerPartials();

const client = await connect();

let currentTitle: string | null = null;

// Need this to capture the first h1 in the file and use it as the title
const walkTokens = async (token: Token) => {
    if (token.type === "heading" && token.depth === 1) {
        currentTitle = token.text;
    }
};

// This is just some marked config stuff
marked
    .use({ gfm: true })
    .use(
        markedHighlight({
            langPrefix: "hljs language-",
            highlight(code, lang, _) {
                const language = hljs.getLanguage(lang) ? lang : "plaintext";
                return hljs.highlight(code, { language }).value;
            },
        }),
    )
    .use({ walkTokens, async: true });

const insertFiles = async () => {
    const dir = path.resolve(__dirname, "./markdown");
    const files = await readdir(dir);
    const articles = await getAllPosts(client);

    let filesToDelete = articles.filter((article) => !files.includes(article.filename));

    for (const file of filesToDelete) {
        try {
            await deletePost(client, file.id);
        } catch (error) {
            throw new Error(error as string);
        }
    }

    for (const file of files) {
        const content = await Bun.file(`${dir}/${file}`).text();
        // Reset title string
        currentTitle = null;
        // This will assign currentTitle
        const postContent = DOMPurify.sanitize(await marked.parse(content));
        // Then use it or fallback to Untitled
        const title = currentTitle || "Untitled";

        const existingDocument = articles.find((doc) => doc.title === title);

        // if not exist, create a new document and insert
        // otherwise, update documents with new content
        if (!existingDocument) {
            const document: Document = {
                id: crypto.randomUUID(),
                filename: file,
                title: title,
                author: "Maneesh Wijewardhana",
                content: postContent,
                created_at: new Date().toISOString(),
                views: 0,
            };

            console.log(`INFO: inserting new post ${document.title}`);
            try {
                await createPost(client, document);
            } catch (error) {
                throw new Error(error as string);
            }
        } else {
            console.log(`INFO: updating contents for ${existingDocument.title}`);
            try {
                await updatePost(client, existingDocument.id, postContent);
            } catch (error) {
                throw new Error(error as string);
            }
        }
    }
};

await insertFiles();

const logging = new Logestic().use(["method", "path", "ip", "body", "query", "referer", "userAgent"]).format({
    onSuccess({ method, path, ip, body, query, referer, userAgent }) {
        return `${method} ${path} was called by ip ${ip} and handled without server error. BODY: ${body} - QUERY: ${query} - REFERER: ${referer} - USERAGENT: ${userAgent}`;
    },
    onFailure({ request, error, code }) {
        return `Oops, ${error} was thrown with code: ${code} on request: ${request}`;
    },
});

const app = new Elysia()
    .use(html())
    .use(cors())
    .use(staticPlugin())
    .use(logging)
    .get("/", async () => {
        const articles = await getAllPosts(client);
        articles.sort((a, b) => b.views - a.views);
        return base({ articles });
    })
    .get(
        "/articles/:id",
        async ({ params: { id } }) => {
            const article = await getPost(client, id);
            return base({
                title: article.title,
                views: article.views,
                author: article.author,
                date: new Date(article.created_at).toLocaleDateString(),
                content: article.content,
            });
        },
        {
            params: t.Object({
                id: t.String(),
            }),
        },
    )
    .post(
        "/search",
        async ({ body }) => {
            const articles = await searchForPost(client, body.search);
            return partialArticles({ articles });
        },
        {
            body: t.Object({
                search: t.String(),
            }),
        },
    )
    .listen(8080);

console.log(`🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`);
