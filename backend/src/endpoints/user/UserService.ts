import { Types } from "mongoose";
import { User } from "./UserModel";
import { Post } from "../post/PostModel";
import { ThreadPage } from "../threadpage/ThreadPageModel";
import { ThreadResource, UserResource } from "../../types//Resources";
import { Thread } from "../thread/ThreadModel";

/**
 * Retrieves user information by their ID, excluding the password.
 * 
 * @param id - The unique identifier of the user to retrieve.
 * @returns A promise that resolves to a UserResource object containing user details excluding the password.
 * @throws Error if the user with the provided ID is not found.
 */
export async function getUser(id: string): Promise<UserResource> {
    const user = await User.findById(id).exec();
    if (!user) {
        throw new Error(`User with ID ${id} not found.`);
    }
    const userResource: UserResource = { id: user.id, name: user.name, email: user.email, admin: user.admin, mod: user.mod, avatar: user.avatar, votedPosts: Array.from(user.votedPosts, ([postID, vote]) => { return { postID: postID, vote: vote }; }) };
    return userResource;
}

/**
 * Asynchronously fetches the avatar of a user by their ID.
 * 
 * @param userId - The ID of the user to retrieve the avatar for.
 * @returns A Promise that resolves to an object containing the avatar URL.
 * @throws Error if the user with the given ID is not found.
 */
export async function getUsersAvatar(userId: string): Promise<{ avatar: string }> {
    const user = await User.findById(userId, "avatar").exec();
    if (!user) {
        throw new Error(`User with ID ${userId} not found.`);
    }
    return { avatar: user.avatar ?? "" };
}

/**
 * Retrieves all threads created by a specific user.
 * 
 * @param userId - The unique identifier of the user whose threads are being fetched.
 * @param count - Optional. The maximum number of threads to retrieve (default: all threads).
 * @returns A promise that resolves to an array of threads created by the specified user.
 * @throws Error if the user with the provided ID is not found.
 */
export async function getAllThreadsForUser(userId: string, count?: number): Promise<(ThreadResource & { creatorName: string })[]> {
    const user = await User.findById(userId, ["name", "avatar"]).exec();

    if (!user) {
        throw new Error(`User with ID ${userId} not found.`);
    }

    let threadsQuery = Thread.find({ creator: new Types.ObjectId(userId) }).sort({ createdAt: -1 });

    if (count && count > 0) {
        threadsQuery = threadsQuery.limit(count);
    }

    const threads = await threadsQuery.exec();
    const threadArr: (ThreadResource & { creatorName: string, creatorAvatar?: string })[] = [];

    for (const thread of threads) {
        threadArr.push({
            id: thread.id,
            title: thread.title,
            creator: thread.creator.toString(),
            creatorName: user.name,
            creatorAvatar: user.avatar,
            subForum: thread.subForum,
            numPosts: thread.numPosts,
            pages: thread.pages
        });
    }

    return threadArr;
}

/**
 * Creates a new user, converting the email address to lowercase.
 * Note: The password is not returned in the created user resource.
 * 
 * @param userResource - The user resource object containing user details for creation.
 * @returns A promise that resolves to a UserResource object for the created user, excluding the password.
 */
export async function createUser(userResource: UserResource): Promise<UserResource> {
    const user = await User.create({
        name: userResource.name,
        email: userResource.email.toLowerCase(),
        password: userResource.password,
        admin: false,
        mod: false
    });
    return { id: user.id, name: user.name, email: user.email, admin: user.admin, mod: user.mod, avatar: user.avatar, votedPosts: Array.from(user.votedPosts, ([postID, vote]) => { return { postID: postID, vote: vote }; }) };
}

/**
 * Updates user information based on the provided UserResource object.
 * The email address, if provided, will be converted to lowercase.
 * Note: Admins can update user details, including setting a new password without knowing the old one.
 * 
 * @param userResource - The UserResource object containing updated user details.
 * @returns A promise that resolves to a UserResource object with the updated user information.
 * @throws Error if the user ID is missing or if no user is found with the provided ID.
 */
export async function updateUser(userResource: UserResource): Promise<UserResource> {
    if (!userResource.id) {
        throw new Error("User ID missing, cannot update.");
    }
    const user = await User.findById(userResource.id).exec();
    if (!user) {
        throw new Error(`No user with ID ${userResource.id} found, cannot update.`);
    }
    if (userResource.name) user.name = userResource.name;
    if (userResource.email) user.email = userResource.email.toLowerCase();
    if (typeof userResource.admin === 'boolean') user.admin = userResource.admin;
    if (userResource.password) user.password = userResource.password;
    if (userResource.mod) user.mod = userResource.mod;
    if (userResource.avatar) user.avatar = userResource.avatar;

    const savedUser = await user.save();
    return { id: savedUser.id, name: savedUser.name, email: savedUser.email, admin: savedUser.admin, mod: savedUser.mod, avatar: savedUser.avatar, votedPosts: Array.from(savedUser.votedPosts, ([postID, vote]) => { return { postID: postID, vote: vote }; }) };
}

/**
 * Deletes a user along with associated threads, thread pages, and posts by the provided ID.
 * 
 * @param id - The unique identifier of the user to be deleted.
 * @returns A promise that resolves when the user and associated data are successfully deleted.
 * @throws Error if no ID is provided, if the user cannot be found, or if deletion encounters issues.
 */
export async function deleteUser(id: string): Promise<void> {
    if (!id) {
        throw new Error("No ID given, cannot delete user.");
    }
    const res = await User.deleteOne({ _id: new Types.ObjectId(id) }).exec();
    if (res.deletedCount !== 1) {
        throw new Error(`No user with ID ${id} deleted, probably ID not valid.`);
    }
    await Thread.deleteMany({ creator: new Types.ObjectId(id) }).exec();
    await ThreadPage.deleteMany({ creator: new Types.ObjectId(id) }).exec();
    await Post.deleteMany({ creator: new Types.ObjectId(id) }).exec();
}

/* istanbul ignore next */
export async function votePost(postID: string, userID: string, threadPageID: string, postNum: number, vote: boolean, remove: boolean): Promise<{votedPosts: Array<{ postID: string, vote: boolean }>, upvotes: number, downvotes: number}> {
    if (!postID) {
        throw new Error("postID not defined");
    }
    if (!userID) {
        throw new Error("userID not defined");
    }
    if (!threadPageID) {
        throw new Error("threadPageID not defined");
    }
    if (postNum === undefined && (postNum < 0 || postNum > 10)) {
        throw new Error("postNum has invalid value");
    }
    if (vote === undefined) {
        throw new Error("vote not defined");
    }
    if (remove === undefined) {
        throw new Error("remote not defined");
    }
    const user = await User.findById(userID).exec();
    if (!user) {
        throw new Error("user not found");
    }
    const threadPage = await ThreadPage.findById(threadPageID).exec();
    if (!threadPage) {
        throw new Error("threadPage not found");
    }
    if (postNum >= threadPage.posts.length) {
        throw new Error("post doesn't exist");
    }
    if (threadPage.posts[postNum].id !== postID) {
        throw new Error("post ids do not match");
    }
    if (remove) { // remove vote
        const post = user.votedPosts.get(postID);
        if (post === undefined) { // vote doesn't exist
            throw new Error("vote for post not found");
        }
        user.votedPosts.delete(postID);
        if (post) { // remove upvote
            threadPage.posts[postNum].upvotes!--;
        } else { // remove downvote
            threadPage.posts[postNum].downvotes!--;
        }
    } else { // add vote
        const post = user.votedPosts.get(postID);
        if (post !== undefined) { // post has been voted before
            if (post === false && vote === true) { // upvote post which has been downvoted before
                user.votedPosts.set(postID, vote);
                threadPage.posts[postNum].downvotes!--;
                threadPage.posts[postNum].upvotes!++;
            } else if (post === true && vote === false) { // downvote post which has been upvoted before
                user.votedPosts.set(postID, vote);
                threadPage.posts[postNum].upvotes!--;
                threadPage.posts[postNum].downvotes!++;
            } else { // trying to upvote post which has been upvoted before or to downvote post which has been downvoted before
                throw new Error("cannot set vote twice");
            }
        } else { // post has not been voted before
            user.votedPosts.set(postID, vote);
            if (vote) { // upvote post
                threadPage.posts[postNum].upvotes!++;
            } else { // downvote post
                threadPage.posts[postNum].downvotes!++;
            }
        }
    }
    const savedUser = await user.save();
    const savedThreadPage = await threadPage.save();
    return {votedPosts: Array.from(savedUser.votedPosts, ([postID, vote]) => { return { postID: postID, vote: vote }; }), upvotes: savedThreadPage.posts[postNum].upvotes!, downvotes: savedThreadPage.posts[postNum].downvotes!};
}