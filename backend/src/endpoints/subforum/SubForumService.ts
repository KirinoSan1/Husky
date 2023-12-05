import { Types } from "mongoose";
import { SubForumResource } from "../../types/Resources";
import { deleteThread } from "../thread/ThreadService";
import { SubForum } from "./SubForumModel";
import { Thread } from "../thread/ThreadModel";



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

export async function getSubForum(name: string): Promise<SubForumResource> {
    /**
     * The reason why only 0 is because it can only exist one Subforum with that name.
     */
    const subForum =  await SubForum.find({ name: name }).exec()
    console.log(subForum)
    return subForum[0].toObject()
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
