import { Types } from "mongoose"
import { User } from "./UserModel";
import { Post } from "../post/PostModel";
import { ThreadPage } from "../threadpage/ThreadPageModel";
import { ThreadResource, UserResource } from "../../types//Resources";
import { Thread } from "../thread/ThreadModel";

/**
 * The password may not be returned.
 */
export async function getUser(id: string): Promise<UserResource> {
    const user = await User.findById(id).exec();
    if (!user) {
        throw new Error(" User not found");
    }
    const userResource: UserResource = { id: user.id, name: user.name, email: user.email, admin: user.admin, mod: user.mod, avatar: user.avatar };
    return userResource;
}

export async function getUsersAvatar(userId: string): Promise<{ avatar: string }> {
    const user = await User.findById(userId, "avatar").exec();

    if (!user) {
        throw new Error(`User with ID ${userId} not found.`);
    }

    return { avatar: user.avatar ?? "" };
}

export async function getAllThreadsForUser(userId: string, count?: number): Promise<(ThreadResource & { creatorName: string })[]> {
    const user = await User.findById(userId).exec();
    if (!user) {
        throw new Error(`User with ID ${userId} not found.`);
    }
    let threadsQuery = Thread.find({ creator: new Types.ObjectId(userId) }).sort({ createdAt: -1 });
    if (count && count > 0) {
        threadsQuery = threadsQuery.limit(count);
    }
    const threads = await threadsQuery.exec();
    const threadArr: (ThreadResource & { creatorName: string })[] = [];
    for (const thread of threads) {
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
 * Creates a user. The email address is converted to lowercase letters.
 * The password may not be returned.
 */
export async function createUser(userResource: UserResource): Promise<UserResource> {
    const user = await User.create({
        name: userResource.name,
        email: userResource.email.toLowerCase(),
        password: userResource.password,
        admin: false,
        mod: false
    });
    return { id: user.id, name: user.name, email: user.email, admin: user.admin, mod: user.mod, avatar: user.avatar }
}

/**
 * Updated a user. The email address, if provided, will be converted to lowercase.
 * When updating, the user is identified via the ID.
 * The admin can easily set a new password without knowing the old one.
 */
export async function updateUser(userResource: UserResource): Promise<UserResource> {
    if (!userResource.id) {
        throw new Error("User id missing, cannot update");
    }
    const user = await User.findById(userResource.id).exec();
    if (!user) {
        throw new Error(`No user with id ${userResource.id} found, cannot update`);
    }
    if (userResource.name) user.name = userResource.name;
    if (userResource.email) user.email = userResource.email.toLowerCase();
    if (typeof userResource.admin === 'boolean') user.admin = userResource.admin;
    if (userResource.password) user.password = userResource.password;
    if (userResource.mod) user.mod = userResource.mod;
    if (userResource.avatar) user.avatar = userResource.avatar;

    const savedUser = await user.save();
    return { id: savedUser.id, name: savedUser.name, email: savedUser.email, admin: savedUser.admin, mod: savedUser.mod, avatar: savedUser.avatar }
}

/**
 * When deleting, the user is identified via the ID.
 * If user was not found (or cannot be deleted for other reasons) an error is thrown.
 * If the user is deleted, all associated Threads, Threadpages and Posts must also be deleted.
 */
export async function deleteUser(id: string): Promise<void> {
    if (!id) {
        throw new Error("No id given, cannot delete user.")
    }
    const res = await User.deleteOne({ _id: new Types.ObjectId(id) }).exec();
    if (res.deletedCount !== 1) {
        throw new Error(`No user with id ${id} deleted, probably id not valid`);
    }
    await Thread.deleteMany({ creator: new Types.ObjectId(id) }).exec()
    await ThreadPage.deleteMany({ creator: new Types.ObjectId(id) }).exec()
    await Post.deleteMany({ creator: new Types.ObjectId(id) }).exec()
}