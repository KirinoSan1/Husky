import { Thread } from "./ThreadModel";
import { ThreadPage } from "../threadpage/ThreadPageModel";
import { User } from "../user/UserModel";
import { ThreadResource } from "../../types/Resources";
import { SubForum } from "../subforum/SubForumModel";

/**
 * Retrieves a specific thread identified by its unique ID.
 * 
 * @param id - The unique identifier of the thread to retrieve.
 * @returns A promise that resolves to a ThreadResource object representing the thread details.
 * @throws Error if no thread is found with the provided ID or if the creator associated with the thread is not found.
 */
export async function getThread(id: string): Promise<ThreadResource> {
    const thread = await Thread.findById(id).exec();
    if (!thread) {
        throw new Error(`Thread with ID ${id} not found.`)
    }
    const creator = await User.findById(thread.creator).exec();
    if (!creator) {
        throw new Error(`Creator not found.`);
    }

    return {
        id: thread.id, title: thread.title, creator: thread.creator.toString(),
        subForum: thread.subForum, numPosts: thread.numPosts, pages: thread.pages, createdAt: thread.createdAt.toString()
    };
}

/**
 * Retrieves threads with titles matching the provided string (case-insensitive).
 * 
 * @param title - The string to search for in thread titles.
 * @returns A promise that resolves to an array of ThreadResource objects matching the title search.
 */
export async function getThreadtitle(title: string): Promise<ThreadResource[]> {
    const regex = new RegExp(title, 'i');
    const threads = await Thread.find({ title: regex }).exec();
    const threadResources = threads.map(thread => ({
        id: thread.id,
        title: thread.title,
        creator: thread.creator.toString(),
        subForum: thread.subForum,
        numPosts: thread.numPosts,
        pages: thread.pages,
        createdAt: thread.createdAt.toString()
    }));

    return threadResources;
}

/**
 * Creates a new thread based on the provided ThreadResource object.
 * 
 * @param threadResource - The details of the thread to be created.
 * @returns A promise that resolves to the created ThreadResource object.
 */
/* istanbul ignore next */
export async function createThread(threadResource: ThreadResource): Promise<ThreadResource> {
    const thread = await Thread.create({
        title: threadResource.title,
        creator: threadResource.creator,
        subForum: threadResource.subForum,
        pages: threadResource.pages,
        numPosts: threadResource.numPosts,
        createdAt: Date.now()
    });

    const creator = await User.findById(thread.creator).exec();

    if (!creator) {
        throw new Error(`Creator with ID ${thread.creator} not found.`)
    }

    const subForum = await SubForum.findOne({ name: thread.subForum }, "_id").exec();

    if (!subForum) {
        throw new Error(`Subforum with name ${thread.subForum} not found.`);
    }

    await subForum.updateOne({ $push: { threads: thread.id }});
    await thread.save();

    return {
        id: thread.id, title: thread.title, creator: thread.creator.toString(),
        subForum: thread.subForum, numPosts: thread.numPosts, pages: thread.pages, createdAt: thread.createdAt.toString()
    };
}

/**
 * Updates the data of an existing thread.
 * Only the 'title' and 'subForum' fields can be modified.
 * 
 * @param threadResource - The updated details of the thread.
 * @returns A promise that resolves to the updated ThreadResource object.
 */
export async function updateThread(threadResource: ThreadResource): Promise<ThreadResource> {
    const thread = await Thread.findById(threadResource.id).exec();
    if (!thread) {
        throw new Error(`Thread with ID ${threadResource.id} not found.`);
    }
    if (threadResource.title) {
        thread.title = threadResource.title;
    }
    if (threadResource.subForum) {
        thread.subForum = threadResource.subForum;
    }
    await thread.save();

    return { id: thread.id, title: thread.title, subForum: thread.subForum, creator: thread.creator.toString(), pages: thread.pages };
}

/**
 * Deletes a thread and its associated thread pages based on the provided ID.
 * 
 * @param id - The unique identifier of the thread to be deleted.
 * @returns A promise that resolves when the thread and associated pages are successfully deleted.
 */
export async function deleteThread(id: string): Promise<void> {
    const thread = await Thread.findById(id).exec();
    if (!thread) {
        throw new Error(`Thread with ID ${id} not found.`);
    }
    await ThreadPage.deleteMany({ thread: thread.id });
    await Thread.findByIdAndDelete(id);
}
