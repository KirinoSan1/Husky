import { Types } from "mongoose";
import { PostResource } from "../../types/Resources";
import { Post } from "./PostModel";
import { ThreadPage } from "../threadpage/ThreadPageModel";

/**
 * Retrieves a post by its ID.
 * 
 * @param id - The ID of the post to retrieve.
 * @returns The retrieved post.
 * @throws Error if the post is not found.
 */
export async function getPost(id: string): Promise<PostResource> {
    const post = await Post.findById(id).exec();
    if (!post) {
        throw new Error(`Post with ID ${id} not found.`);
    }
    return {
        id: post.id, content: post.content, author: post.author.toString(), upvotes: post.upvotes,
        downvotes: post.downvotes, modified: post.modified, createdAt: post.createdAt
    };
}

/**
 * Creates a new post.
 * 
 * @param postResource - The post resource containing post details.
 * @returns The created post.
 */
export async function createPost(postResource: PostResource): Promise<PostResource> {
    const post = await Post.create({
        content: postResource.content,
        author: postResource.author,
        upvotes: postResource.upvotes,
        downvotes: postResource.downvotes
    });

    return {
        id: post.id, content: post.content, author: post.author.toString(), upvotes: post.upvotes,
        downvotes: post.downvotes, modified: post.modified, createdAt: post.createdAt
    };
}

/**
 * Updates an existing post.
 * 
 * @param postResource - The updated post resource.
 * @returns The updated post.
 * @throws Error if the post ID is missing or if the post is not found.
 */
export async function updatePost(postResource: PostResource): Promise<PostResource> {
    if (!postResource.id) {
        throw new Error("Post ID missing, cannot update.");
    }
    const post = await Post.findById(postResource.id).exec();
    if (!post) {
        throw new Error(`Post with ID ${postResource.id} not found.`);
    }
    if (postResource.content) post.content = postResource.content;
    if (postResource.author) post.author = new Types.ObjectId(postResource.author);
    if (postResource.upvotes) post.upvotes = postResource.upvotes;
    if (postResource.downvotes) post.downvotes = postResource.downvotes;
    await post.save();

    return {
        id: post.id, content: post.content, author: post.author.toString(), upvotes: post.upvotes,
        downvotes: post.downvotes, modified: post.modified, createdAt: post.createdAt
    };
}

/**
 * Deletes a post by ID.
 * @param id - The ID of the post to delete.
 * @throws Error if the post does not exist.
 */
export async function deletePost(id: string): Promise<void> {
    const res = await Post.findById(id).exec();
    if (!res) {
        throw new Error("The Post does not exist.");
    }
    res.content = "This Post has been deleted.";
    res.save();
}

/**
 * Upvotes a post by incrementing its upvotes count
 * 
 * @param threadpageid - The ID of the thread page containing the post.
 * @param index - The index of the post within the thread page.
 * @throws Error if the thread page or post is not found.
 */
export async function upvotePost(threadpageid: string, index: number): Promise<void> {
    const threadPage = await ThreadPage.findById(threadpageid).exec();
    if (!threadPage) {
        throw new Error("ThreadPage not found.");
    }
    if (!threadPage.posts[index]) {
        throw new Error("Post not found.");
    }
    threadPage.posts[index].upvotes! += 1;
    await threadPage.save();
}

/**
 * Downvotes a post by decrementing its downvotes count.
 * 
 * @param threadpageid - The ID of the thread page containing the post.
 * @param index - The index of the post within the thread page.
 * @throws Error if the thread page or post is not found.
 */
export async function downvotePost(threadpageid: string, index: number): Promise<void> {
    const threadPage = await ThreadPage.findById(threadpageid).exec();
    if (!threadPage) {
        throw new Error("ThreadPage not found.");
    }
    if (!threadPage.posts[index]) {
        throw new Error("Post not found.");
    }
    threadPage.posts[index].downvotes! -= 1;
    await threadPage.save();
}
