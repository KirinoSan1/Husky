import { ThreadResource } from "../../Resources";
import { Thread } from "./ThreadModel";
import { ThreadPage } from "../threadpage/ThreadPageModel";
import { User } from "../user/UserModel";

/**
 * Helper function for the createdAt-field
 */
export function dateToString(date: Date) {
    return `${date.getDate()}.${date.getMonth() + 1}.${date.getFullYear()}`;
}

/**
 * Returns the thread with the specified ID.
 * Throws an error if no thread is found.
 */
export async function getThread(id: string): Promise<ThreadResource> {
    const thread = await Thread.findById(id).populate("creator").exec();
    if (!thread) {
        throw new Error(`Thread with ID ${id} not found`)
    }

    const creator = await User.findById(thread.creator).exec();
    if (!creator) {
        throw new Error(`Creator not found`);
    }

    return { id: thread.id, title: thread.title, creator: thread.creator.id.toString(), creatorName: creator.name, 
        subForum: thread.subForum, numPosts: thread.numPosts, pages: thread.pages, createdAt: dateToString(thread.createdAt!) };
}

/**
 * Create the Thread.
 */
export async function createThread(threadResource: ThreadResource): Promise<ThreadResource> {
    const thread = new Thread({ 
        title: threadResource.title, 
        creator: threadResource.creator,
        subForum: threadResource.subForum 
    });

    const creator = await User.findById(thread.creator).exec();
    if (!creator) {
        throw new Error(`Creator not found`);
    }

    await thread.save();
    return { id: thread.id, title: thread.title, creator: thread.creator.id.toString(), creatorName: creator.name, 
        subForum: thread.subForum, numPosts: thread.numPosts, pages: thread.pages, createdAt: dateToString(thread.createdAt!) };
}

/**
 * Changes the data of a Thread.
 * Currently, only the following data can be modified: title and subForum.
 * If other data is modified, it will be ignored.
 */
export async function updateThread(threadResource: ThreadResource): Promise<ThreadResource> {
    const thread = await Thread.findById(threadResource.id).exec();
    if (!thread) {
        throw new Error(`Thread with ID ${threadResource.id} not found`);
    }
    if (threadResource.title) {
        thread.title = threadResource.title;
    }
    if (threadResource.subForum) {
        thread.subForum = threadResource.subForum;
    }
    await thread.save();

    return { id: thread.id, title: thread.title, subForum: thread.subForum, creator: thread.creator.id.toString() };
}

/**
 * When deleting, the Thread is identified by its ID.
 * If no Thread is found (or for any other reason cannot be deleted), an error is thrown.
 * When the Thread is deleted, all associated ThreadPages must also be deleted.
 */
export async function deleteThread(id: string): Promise<void> {
    const thread = await Thread.findById(id).exec();
    if (!thread) {
        throw new Error(`Thread with ID ${id} not found`);
    }
    await ThreadPage.deleteMany({ thread: thread.id });
    await Thread.findByIdAndDelete(id);
}
