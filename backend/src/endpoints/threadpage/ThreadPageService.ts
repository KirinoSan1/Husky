import { ThreadPageResource } from "../../types/Resources";
import { Post } from "../post/PostModel";
import { ThreadPage } from "./ThreadPageModel";

export async function getThreadPage(id: string): Promise<ThreadPageResource> {
    const threadPage = await ThreadPage.findById(id).exec();
    if (!threadPage) {
        throw new Error(" Page not found")
    }
    const threadPageResource = { id: threadPage.id, posts: threadPage.posts, createdAt: threadPage.createdAt }
    return threadPageResource;
}

export async function createThreadPage(threadPageResource: ThreadPageResource): Promise<ThreadPageResource> {
    const threadPage = await ThreadPage.create({
        posts: threadPageResource.posts,
        createdAt: threadPageResource.createdAt
    });
    return { id: threadPage.id, posts: threadPage.posts, createdAt: threadPage.createdAt }
}

export async function updateThreadPage(threadPageResource: ThreadPageResource): Promise<ThreadPageResource> {
    if (!threadPageResource.id) {
        throw new Error("Page id missing, cannot update");
    }
    const threadPage = await ThreadPage.findById(threadPageResource.id).exec();
    if (!threadPage) {
        throw new Error(`No Page with id ${threadPageResource.id} found, cannot update`);
    }
    if (threadPageResource.posts) {
        threadPage.posts.length = 0
        for(let i = 0; i < threadPageResource.posts.length; i++){
            threadPage.posts.push(threadPageResource.posts[i])
        }
    }

    const savedPage = await threadPage.save();
    return { id: savedPage.id, posts: savedPage.posts }
}

export async function deleteThreadPage(id: string): Promise<void> {
    const threadPage = await ThreadPage.findById(id).exec()
    if(!threadPage){
        throw new Error(`No Page with id ${id} found, cannot delete`)
    }
    await ThreadPage.findByIdAndDelete(id).exec()
}