import { AuthorResource, AuthorsResource } from "../../types/Resources";
import { ThreadPageResource } from "../../types/Resources";
import { Post } from "../post/PostModel";
import { Thread } from "../thread/ThreadModel";
import { User } from "../user/UserModel";
import { ThreadPage } from "./ThreadPageModel";

/**
 * Retrieves a thread page by its unique ID.
 * 
 * @param id - The unique identifier of the thread page to retrieve.
 * @returns A promise that resolves to a ThreadPageResource object.
 * @throws Error if the thread page with the provided ID is not found.
 */
export async function getThreadPage(id: string): Promise<ThreadPageResource> {
    const threadPage = await ThreadPage.findById(id).exec();
    if (!threadPage) {
        throw new Error("Page not found.");
    }
    const threadPageResource = { id: threadPage.id, posts: threadPage.posts, createdAt: threadPage.createdAt };
    return threadPageResource;
}

/**
 * Retrieves authors of posts on a specific thread page.
 * 
 * @param id - The unique identifier of the thread page to retrieve authors from.
 * @returns A promise that resolves to an AuthorsResource object containing author details.
 * @throws Error if the thread page with the provided ID is not found or if an author associated with a post is not found.
 */
export async function getThreadPageAuthors(id: string): Promise<AuthorsResource> {
    const threadPage = await ThreadPage.findById(id).exec();
    if (!threadPage) {
        throw new Error("Page not found.");
    }
    let arr = new Array<AuthorResource>();
    const map = new Map<string, boolean>();

    for (const post of threadPage.posts) {
        const authorID = String(post.author);
        const author = await User.findById(authorID);
        if (!author) {
            throw new Error("Author not found.");
        }
        if (map.get(author.id)) {
            continue;
        }
        arr.push({ id: author.id, name: author.name, admin: author.admin ?? false, mod: author.mod ?? false, createdAt: author.createdAt!, avatar: author.avatar! });
        map.set(author.id, true);
    }
    return { authors: arr };
}

/**
 * Creates a new thread page.
 * 
 * @param threadPageResource - The details of the thread page to be created.
 * @returns A promise that resolves to the created ThreadPageResource object.
 */
export async function createThreadPage(threadPageResource: ThreadPageResource): Promise<ThreadPageResource> {
    const threadPage = await ThreadPage.create({
        posts: threadPageResource.posts
    });
    return { id: threadPage.id, posts: threadPage.posts, createdAt: threadPage.createdAt };
}

/**
 * Updates a thread page with the provided ThreadPageResource data.
 * 
 * @param threadPageResource - The resource containing the updated data for the thread page.
 * @returns A Promise that resolves to a resource of the updated thread page.
 * @throws Error if the page ID is missing in the provided resource or if no page is found with the given ID.
 */
export async function updateThreadPage(threadPageResource: ThreadPageResource): Promise<ThreadPageResource> {
    if (!threadPageResource.id) {
        throw new Error("Page ID missing, cannot update.");
    }
    const threadPage = await ThreadPage.findById(threadPageResource.id).exec();
    if (!threadPage) {
        throw new Error(`No Page with ID ${threadPageResource.id} found, cannot update.`);
    }
    if (threadPageResource.posts) {
        threadPage.posts.length = 0;
        for (let i = 0; i < threadPageResource.posts.length; i++) {
            threadPage.posts.push(threadPageResource.posts[i]);
        }
    }
    const savedPage = await threadPage.save();
    return { id: savedPage.id, posts: savedPage.posts };
}

/**
 * Adds a new post to a thread page.
 * 
 * @param content - The content of the post.
 * @param authorID - The ID of the author of the post.
 * @param threadPageID - The ID of the thread page where the post will be added.
 * @param threadID - The ID of the thread to which the thread page belongs.
 * @returns A Promise that resolves to a resource of the updated thread page containing the new post.
 * @throws Error if content is not defined, authorID is not defined, threadPageID is not defined,
 * thread page is not found, or the author is not found.
 */
export async function addPost(content: string, authorID: string, threadPageID: string, threadID: string): Promise<ThreadPageResource> {
    if (!content) {
        throw new Error("Content not defined.");
    }
    if (!authorID) {
        throw new Error("AuthorID not defined.");
    }
    if (!threadPageID) {
        throw new Error("ThreadPageID not defined.");
    }

    let threadPage = await ThreadPage.findById(threadPageID).exec();
    if (!threadPage) {
        throw new Error(`No page with ID ${threadPageID} found.`);
    }

    const author = await User.findById(authorID).exec();
    if (!author) {
        throw new Error("Author not found.");
    }

    if (threadPage.posts.length == 10) {
        return await addPostNewPage(authorID, content, threadID);
    }
    threadPage.posts.push(new Post({ content: content, author: author.id }));
    const savedPage = await threadPage.save();

    const thread = await Thread.findById(threadID).exec();
    if (!thread) {
        throw new Error("Thread not found.");
    }
    thread.numPosts = (thread?.pages.length - 1) * 10 + savedPage.posts.length;
    await thread.save();
    return { id: savedPage.id, posts: savedPage.posts };
}

/**
 * Adds a new post to a new thread page and associates it with the specified thread.
 * 
 * @param author - The ID of the author of the post.
 * @param content - The content of the post.
 * @param threadID  -The ID of the thread to which the new thread page will be associated.
 * @returns A Promise that resolves to a resource of the new thread page containing the added post.
 * @throws Error if author is not defined, content is not defined,
 * or if no thread is found with the specified threadID.
 */
export async function addPostNewPage(author: string, content: string, threadID: string): Promise<ThreadPageResource> {
    if (!author) {
        throw new Error("Author not defined.");
    }
    if (!content) {
        throw new Error("Content not defined.");
    }

    const threadPage = await ThreadPage.create({
        posts: [new Post({ author: author, content: content })]
    });

    const thread = await Thread.findById(threadID).exec();
    if (!thread) {
        throw new Error(`No thread with ID ${threadID} found.`);
    }
    thread.pages.push(threadPage.id);
    thread.numPosts = (thread?.pages.length - 1) * 10 + threadPage.posts.length;
    await thread.save();
    return { id: threadPage.id, posts: threadPage.posts, createdAt: threadPage.createdAt };
}

/**
 * Edits a specific post in a thread page.
 * 
 * @param content - The updated content for the post.
 * @param authorID - The ID of the author of the post.
 * @param threadPageID - The ID of the thread page containing the post to be edited.
 * @param postNum - The index number of the post to be edited within the thread page.
 * @param postNum - The information for the post if it's updated or not.
 * @returns A Promise that resolves to a resource of the updated thread page containing the edited post.
 * @throws Error if content is not defined, authorID is not defined, threadPageID is not defined,
 * postNum is not defined or invalid, thread page is not found, post doesn't exist, or the post is deleted.
 */
export async function editPost(content: string, authorID: string, threadPageID: string, postNum: number, modified: "m" | "d" | ""): Promise<ThreadPageResource> {
    if (!content) {
        throw new Error("Content not defined.");
    }
    if (!authorID) {
        throw new Error("Author not defined.");
    }
    if (!threadPageID) {
        throw new Error("ThreadPageID not defined.");
    }
    if (!!postNum === false && postNum !== 0) {
        throw new Error("PostNum not defined.");
    }

    const threadPage = await ThreadPage.findById(threadPageID).exec();
    if (!threadPage) {
        throw new Error(`No page with ID ${threadPageID} found.`);
    }
    if (!threadPage.posts[postNum]) {
        throw new Error("Post doesn't exist.");
    }
    if (threadPage.posts[postNum].modified && threadPage.posts[postNum].modified === "d") {
        throw new Error("Cannot edit deleted post.");
    }
    threadPage.posts[postNum].content = content;
    threadPage.posts[postNum].modified = modified;
    const savedPage = await threadPage.save();
    return { id: savedPage.id, posts: savedPage.posts };
}

/**
 * Deletes a thread page by its unique ID.
 * 
 * @param id - The unique identifier of the thread page to be deleted.
 * @returns A promise that resolves when the thread page is successfully deleted.
 * @throws Error if the thread page with the provided ID is not found.
 */
export async function deleteThreadPage(id: string): Promise<void> {
    const threadPage = await ThreadPage.findById(id).exec();
    if (!threadPage) {
        throw new Error(`No Page with ID ${id} found, cannot delete.`)
    }
    await ThreadPage.findByIdAndDelete(id).exec();
}
