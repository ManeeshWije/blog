import { PoolClient } from "pg";
import { Document } from "./index";
import pool from "./dbConfig";

export const connect = async (): Promise<PoolClient> => {
    try {
        const client = await pool.connect();
        return client;
    } catch (error) {
        throw new Error(error as string);
    }
};

export const create = async (client: PoolClient, document: Document): Promise<Document> => {
    try {
        const query = `
            INSERT INTO blogs(id, filename, title, author, content, views, created_at)
            VALUES($1, $2, $3, $4, $5, $6, $7) RETURNING *
        `;
        const values = [
            document.id,
            document.filename,
            document.title,
            document.author,
            document.content,
            document.views,
            document.created_at,
        ];
        const res = await client.query(query, values);
        return res.rows[0];
    } catch (error) {
        throw new Error(error as string);
    }
};

export const getAll = async (client: PoolClient): Promise<Document[]> => {
    try {
        const query = `
            SELECT * FROM blogs
        `;
        const res = await client.query(query);
        return res.rows;
    } catch (error) {
        throw new Error(error as string);
    }
};

export const getOne = async (client: PoolClient, id: string): Promise<Document> => {
    try {
        const query = `
            SELECT * FROM blogs WHERE id = $1
        `;
        const values = [id];
        const res = await client.query(query, values);
        return res.rows[0];
    } catch (error) {
        throw new Error(error as string);
    }
};

export const updateViews = async (client: PoolClient, id: string): Promise<Document> => {
    try {
        const query = `
            UPDATE blogs
            SET views = views + 1
            WHERE id = $1
            RETURNING *
        `;
        const values = [id];
        const res = await client.query(query, values);
        return res.rows[0];
    } catch (error) {
        throw new Error(error as string);
    }
};

export const updatePostContent = async (client: PoolClient, id: string, content: string): Promise<Document> => {
    try {
        const query = `
            UPDATE blogs
            SET content = $1
            WHERE id = $2
            RETURNING *
        `;
        const values = [content, id];
        const res = await client.query(query, values);
        return res.rows[0];
    } catch (error) {
        throw new Error(error as string);
    }
};

export const deleteOne = async (client: PoolClient, id: string): Promise<Document> => {
    try {
        const query = `
            DELETE FROM blogs
            WHERE id = $1
            RETURNING *
        `;
        const values = [id];
        const res = await client.query(query, values);
        return res.rows[0];
    } catch (error) {
        throw new Error(error as string);
    }
};

export const searchPosts = async (client: PoolClient, searchText: string): Promise<Document[]> => {
    try {
        const query = `
            SELECT * FROM blogs
            WHERE blogs.title ILIKE $1
        `;
        const values = [`%${searchText}%`];
        const res = await client.query(query, values);
        return res.rows;
    } catch (error) {
        throw new Error(error as string);
    }
};
