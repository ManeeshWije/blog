import { PoolClient } from "pg";
import { create, deleteOne, getAll, getOne, updatePostContent, updateViews, searchPosts } from "./db";
import { Document } from ".";

export const getAllPosts = async (client: PoolClient) => {
    try {
        return await getAll(client);
    } catch (error) {
        throw new Error(error as string);
    }
};

export const getPost = async (client: PoolClient, id: string) => {
    try {
        const article = await getOne(client, id);
        try {
            await updateViews(client, id);
        } catch (error) {
            throw new Error(error as string);
        }
        return article;
    } catch (error) {
        throw new Error(error as string);
    }
};

export const createPost = async (client: PoolClient, document: Document) => {
    try {
        return await create(client, document);
    } catch (error) {
        throw new Error(error as string);
    }
};

export const updatePost = async (client: PoolClient, id: string, postContent: string) => {
    try {
        const updatedPost = await updatePostContent(client, id, postContent);
        return updatedPost;
    } catch (error) {
        throw new Error(error as string);
    }
};

export const deletePost = async (client: PoolClient, id: string) => {
    try {
        return await deleteOne(client, id);
    } catch (error) {
        throw new Error(error as string);
    }
};

export const searchForPost = async (client: PoolClient, searchText: string) => {
    try {
        const posts = await searchPosts(client, searchText);
        return posts;
    } catch (error) {
        throw new Error(error as string);
    }
};
