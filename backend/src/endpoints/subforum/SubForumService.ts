import { Types } from "mongoose";
import { SubForumResource, ThreadResource } from "../../types/Resources";
import { SubForum } from "./SubForumModel";
import { Thread } from "../thread/ThreadModel";
import { User } from "../user/UserModel";

/**
 * Retrieves a specific subforum by its name.
 * 
 * @param name - The name of the subforum to retrieve.
 * @returns A promise resolving to the subforum resource object.
 */
export async function getSubForum(name: string): Promise<SubForumResource> {
    const subForum = await SubForum.findOne({ name: name }).exec();

    if (!subForum) {
        throw new Error(`Subforum with name ${name} not found.`);
    }

    return subForum;
}

/**
 * Retrieves all subforums.
 * 
 * @returns A promise resolving to an array of subforum resource objects.
 */
export async function getAllSubForums(): Promise<SubForumResource[]> {
    const allSubForums = await SubForum.find({}, ["name", "description"]).exec();
    return allSubForums.map(subforum => subforum.toObject());
}

/**
 * Retrieves all threads for a specific subforum, optionally limited by count.
 * 
 * @param subForumName - The name of the subforum to retrieve threads from.
 * @param count Optional - The maximum number of threads to retrieve.
 * @returns A promise resolving to an array of threads for the specified subforum.
 * @throws Error if the subforum with the provided name is not found.
 */
export async function getAllThreadsForSubForum(subForumName: string, count?: number): Promise<(ThreadResource & { creatorName: string })[]> {
    const subforum = await SubForum.findOne({ name: subForumName }).exec();

    if (!subforum) {
        throw new Error(`Subforum with name ${subForumName} not found.`);
    }

    let threads: Types.ObjectId[] = subforum.threads.slice(); // copy Array, to prevent side effects

    // Retrieve the thread objects based on the thread IDs from the subforum and sort them in descending order of creation date
    const threadObjects = await Thread.find({ _id: { $in: threads } }).sort({ createdAt: -1 }).exec();

    if (count && count > 0) {
        threadObjects.splice(count);
    }

    const threadArr: (ThreadResource & { creatorName: string })[] = [];

    for (const thread of threadObjects) {
        const userName = (await User.findById(thread.creator).exec())?.name;
        threadArr.push({
            id: thread.id,
            title: thread.title,
            creator: thread.creator.toString(),
            subForum: thread.subForum,
            numPosts: thread.numPosts,
            pages: thread.pages,
            creatorName: userName!
        });
    }
    return threadArr;
}

/**
 * Fetches the latest threads from specified sub-forums.
 *
 * @param threadCount - The number of threads to retrieve (default: 5).
 * @param subForumCount - The number of sub-forums to consider (default: 5).
 * @returns An array of ThreadResource objects representing the latest threads.
 */
export async function getLatestThreadsFromSubForums(threadCount: number, subForumCount: number): Promise<ThreadResource[]> {
    const subForums: string[] = (await SubForum.find({}, 'name').limit(subForumCount).exec()).map(subforum => subforum.name);
    const threadsFromSubForums: ThreadResource[] = [];

    for (const subForum of subForums) {
        const threads = await Thread.find({ subForum: subForum }).sort({ createdAt: -1 }).limit(threadCount).exec();

        threads.forEach(thread => threadsFromSubForums.push({
            id: thread.id,
            title: thread.title,
            creator: thread.creator.toString(),
            subForum: thread.subForum,
            numPosts: thread.numPosts,
            pages: thread.pages,
            createdAt: thread.createdAt.toString()
        }));
    }

    return threadsFromSubForums;
}

/**
 * Creates a new subforum based on the provided subforum resource.
 * 
 * @param subForumResource - The resource containing data to create the subforum.
 * @returns A promise resolving to the created subforum resource object.
 */
export async function createSubForum(subForumResource: SubForumResource): Promise<SubForumResource> {
    const subforum = await SubForum.create({
        name: subForumResource.name,
        description: subForumResource.description,
        threads: subForumResource.threads
    });
    await subforum.save();
    return {
        id: subforum.id, name: subforum.name, description: subforum.description, threads: subforum.threads
    };
}

/**
 * Updates an existing subforum based on the provided subforum resource.
 * 
 * @param subForumResource - The resource containing updated data for the subforum.
 * @returns A promise resolving to the updated subforum resource object.
 * @throws Error if the subforum with the provided ID is not found.
 */
export async function updateSubForum(subForumResource: SubForumResource): Promise<SubForumResource> {
    const subforum = await SubForum.findById(subForumResource.id).exec();

    if (!subforum) {
        throw new Error(`The Subforum with the ID ${subForumResource.id} does not exist.`);
    }

    subforum.name = subForumResource.name;
    subforum.threads = new Types.DocumentArray<Types.ObjectId>(subForumResource.threads);
    if (subForumResource.description) {
        subforum.description = subForumResource.description;
    }

    const result = await subforum.save();
    return result.toObject();
}

/**
 * Deletes a subforum by its ID.
 * 
 * @param id - The ID of the subforum to delete.
 * @returns A promise resolving once the subforum is deleted.
 * @throws Error if the subforum with the provided ID is not found.
 */
export async function deleteSubForum(id: string): Promise<void> {
    const subForum = await SubForum.findById(id).exec();

    if (!subForum) {
        throw new Error(`Subforum with ID ${id} not found.`);
    }

    await SubForum.findByIdAndDelete(id).exec();
}
