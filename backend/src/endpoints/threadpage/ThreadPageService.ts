import { AuthorResource, AuthorsResource } from "../../types/Resources";
import { ThreadPageResource } from "../../types/Resources";
import { Post } from "../post/PostModel";
import { Thread } from "../thread/ThreadModel";
import { User } from "../user/UserModel";
import { ThreadPage } from "./ThreadPageModel";

export async function getThreadPage(id: string): Promise<ThreadPageResource> {
    const threadPage = await ThreadPage.findById(id).exec();
    if (!threadPage) {
        throw new Error("Page not found")
    }
    const threadPageResource = { id: threadPage.id, posts: threadPage.posts, createdAt: threadPage.createdAt }
    return threadPageResource;
}

export async function getThreadPageAuthors(id: string): Promise<AuthorsResource> {
    const threadPage = await ThreadPage.findById(id).exec();
    if (!threadPage) {
        throw new Error("Page not found");
    }
    let arr = new Array<AuthorResource>();
    const map = new Map<string, boolean>();
    for (const post of threadPage.posts) {
        const authorID = String(post.author);
        const author = await User.findById(authorID);
        if (!author)
            throw new Error("Author not found");
        if (map.get(author.id))
            continue;
        arr.push({ id: author.id, name: author.name, admin: author.admin ?? false, mod: author.mod ?? false, createdAt: author.createdAt! });
        map.set(author.id, true);
    }
    return { authors: arr };
}

export async function createThreadPage(threadPageResource: ThreadPageResource): Promise<ThreadPageResource> {
    const threadPage = await ThreadPage.create({
        posts: threadPageResource.posts
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
        for (let i = 0; i < threadPageResource.posts.length; i++) {
            threadPage.posts.push(threadPageResource.posts[i])
        }
    }

    const savedPage = await threadPage.save();
    return { id: savedPage.id, posts: savedPage.posts }
}

export async function addPost(content: string, authorID: string, threadPageID: string, threadID: string): Promise<ThreadPageResource> {
    if (!content)
        throw new Error("content not defined");
    if (!authorID)
        throw new Error("authorID not defined");
    if (!threadPageID)
        throw new Error("threadPageID not defined");

    let threadPage = await ThreadPage.findById(threadPageID).exec();
    if (!threadPage)
        throw new Error(`no page with ID ${threadPageID} found`);

    const author = await User.findById(authorID).exec();
    if (!author)
        throw new Error("author not found");

    if (threadPage.posts.length == 10)
        return await addPostNewPage(authorID, content, threadID);

    threadPage.posts.push(new Post({ content: content, author: author.id }));
    const savedPage = await threadPage.save();
    return { id: savedPage.id, posts: savedPage.posts };
}

export async function addPostNewPage(author: string, content: string, threadID: string): Promise<ThreadPageResource> {
    if (!author)
        throw new Error("author not defined");
    if (!content)
        throw new Error("content not defined");
    const threadPage = await ThreadPage.create({
        posts: [new Post({ author: author, content: content })]
    });
    const thread = await Thread.findById(threadID).exec();
    if (!thread)
        throw new Error(`no thread with ${threadID} found`);
    thread.pages.push(threadPage.id);
    await thread.save();
    return { id: threadPage.id, posts: threadPage.posts, createdAt: threadPage.createdAt };
}

export async function editPost(content: string, authorID: string, threadPageID: string, postNum: number): Promise<ThreadPageResource> {
    if (!content)
        throw new Error("content not defined");
    if (!authorID)
        throw new Error("author not defined");
    if (!threadPageID)
        throw new Error("threadPageID not defined");
    if (!postNum)
        throw new Error("postNum not defined");

    const threadPage = await ThreadPage.findById(threadPageID).exec();
    if (!threadPage)
        throw new Error(`no page with ID ${threadPageID} found`);
    if (!threadPage.posts[postNum])
        throw new Error("post doesn't exist");
    if (threadPage.posts[postNum].modified && threadPage.posts[postNum].modified === "d")
        throw new Error("cannot edit deleted post");

    threadPage.posts[postNum].content = content;
    threadPage.posts[postNum].modified = "m";
    const savedPage = await threadPage.save();
    return { id: savedPage.id, posts: savedPage.posts };
}

export async function deleteThreadPage(id: string): Promise<void> {
    const threadPage = await ThreadPage.findById(id).exec()
    if (!threadPage) {
        throw new Error(`No Page with id ${id} found, cannot delete`)
    }
    await ThreadPage.findByIdAndDelete(id).exec()
}