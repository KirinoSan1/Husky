import { Types } from "mongoose";
import { SubForumResource, ThreadResource } from "../../types/Resources";
import { SubForum } from "./SubForumModel";
import { Thread } from "../thread/ThreadModel";
import { User } from "../user/UserModel";

export async function getSubForum(name: string): Promise<SubForumResource> {
    const subForum = await SubForum.find({ name: name }).exec()
    return subForum[0].toObject() // 0, because it can only exist one Subforum with that name.
}

export async function getAllThreadsForSubForum(subForumName: string, count?: number): Promise<(ThreadResource & {creatorName: string})[]> {
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

export async function getLatestThreadsFromSubForums(threadCount?: number, subForumCount?: number): Promise<ThreadResource[]> {
    const threadsFromSubForums: ThreadResource[] = [];
    const subForumNames: string[] = [];

    const allSubForums = await SubForum.find({}, 'name');
    const randomSubForumIndices = getRandomIndices(allSubForums.length, subForumCount || 5);

    for (const index of randomSubForumIndices) {
        subForumNames.push(allSubForums[index].name);
    }

    for (const subForumName of subForumNames) {
        const subforum = await SubForum.findOne({ name: subForumName }).exec();

        if (!subforum) {
            throw new Error(`Subforum with name ${subForumName} not found.`);
        }

        const threads = subforum.threads.slice();
        const randomThreadIndices = getRandomIndices(threads.length, threadCount || 5);

        for (const index of randomThreadIndices) {
            const threadId = threads[index];
            const thread = await Thread.findById(threadId).exec();

            if (thread) {
                threadsFromSubForums.push({
                    id: thread.id,
                    title: thread.title,
                    creator: thread.creator.toString(),
                    subForum: thread.subForum,
                    numPosts: thread.numPosts,
                    pages: thread.pages,
                    createdAt: thread.createdAt.toString()
                });
            }
        }
    }
    return threadsFromSubForums.sort((a, b) => new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime());
}

function getRandomIndices(maxLength: number, count: number): number[] {
    const indices: number[] = [];
    for (let i = 0; i < count; i++) {
        const randomIndex = Math.floor(Math.random() * maxLength);
        if (!indices.includes(randomIndex)) {
            indices.push(randomIndex);
        }
    }
    return indices;
}

export async function createSubForum(subForumResource: SubForumResource): Promise<SubForumResource> {
    const subforum = await SubForum.create({
        name: subForumResource.name,
        description: subForumResource.description,
        threads: subForumResource.threads
    });
    await subforum.save()
    return {
        id: subforum.id, name: subforum.name, description: subforum.description,
        threads: subforum.threads
    }
}

export async function updateSubForum(subForumResource: SubForumResource): Promise<SubForumResource> {
    const subforum = await SubForum.findById(subForumResource.id).exec();
    if (!subforum) {
        throw new Error(`The Subforum with the id ${subForumResource.id} does not exist.`)
    }
    subforum.name = subForumResource.name;
    //[id, id , id ] [id, id ]
    subforum.threads = new Types.DocumentArray<Types.ObjectId>(subForumResource.threads)
    if (subForumResource.description) {
        subforum.description = subForumResource.description;
    }
    const result = await subforum.save();
    return result.toObject();
}

export async function deleteSubForum(id: string): Promise<void> {
    const subForum = await SubForum.findById(id).exec();
    if (!subForum) {
        throw new Error(`Subforum with ID ${id} not found`);
    }
    await SubForum.findByIdAndDelete(id).exec();
}
