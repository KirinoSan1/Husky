import { Types } from "mongoose";
import { PostResource } from "../../types/Resources";
import { Post } from "./PostModel";

export async function getPost(id: string): Promise<PostResource> {
    const post = await Post.findById(id).exec();
    if (!post) {
        throw new Error("Post not found.")
    }
    return { id: post.id, content: post.content, author: post.author.toString(), upvotes: post.upvotes, 
        downvotes: post.downvotes, createdAt: post.createdAt }
}

/**
 * Creates a post.
 */
export async function createPost(postResource: PostResource): Promise<PostResource> {

    const post = await Post.create({
        content: postResource.content,
        author: postResource.author
    });

    return {
        id: post.id,
        content: post.content, author: post.author.toString(), upvotes: post.upvotes,
        downvotes: post.downvotes, createdAt: post.createdAt
    }
}

export async function updatePost(postResource: PostResource): Promise<PostResource> {
    if (!postResource.id) {
        throw new Error("Post id missing, cannot update.");
    }
    const post = await Post.findById(postResource.id).exec();
    if (!post) {
        throw new Error(`No Post with the given id found, cannot update.`);
    }
    if (postResource.content) post.content = postResource.content;
    if (postResource.author) post.author = new Types.ObjectId(postResource.author);
    if (postResource.upvotes) post.upvotes = postResource.upvotes;
    if (postResource.downvotes) post.downvotes = postResource.downvotes;
    //Debug at this point to see if Id change 
    await post.save();

    return {
        id: post.id, content: post.content, author: post.author.toString(), upvotes: post.upvotes,
        downvotes: post.downvotes, createdAt: post.createdAt
    }
}



export async function deletePost(id: string): Promise<void> {
    //if u want to delete it you should see the Message <Post got deleted>
    const res = await Post.findById(id).exec();
    if (!res) {
        throw new Error("The Post does not exist.")
    }
    res.content = "This Post has been deleted."
    res.save()
}