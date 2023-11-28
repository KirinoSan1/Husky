import mongoose from "mongoose"
import DB from "../TestDB";
import { getThread, createThread, updateThread, deleteThread } from "../../src/endpoints/thread/ThreadService";
import { Thread } from "../../src/endpoints/thread/ThreadModel";
import { ThreadPage } from "../../src/endpoints/threadpage/ThreadPageModel";
import { IUser, User } from "../../src/endpoints/user/UserModel"

let jinxData: IUser = { email: "Jinx@gmail.com", name: "Jinx", password: "123", admin: false }
let idJinx: string

beforeAll(async () => await DB.connect())
beforeEach(async () => {
    await User.syncIndexes()
    const jinx = await User.create(jinxData)
    idJinx = jinx.id;
})
afterEach(async () => await DB.clear())
afterAll(async () => await DB.close())

// ------------------------------------------------------------ getThread -------------------------------------------------------------------

test("Returns thread with specified ID", async () => {
    const thread = new Thread({ title: "Jinxs Store", creator: idJinx, subForum: "computer science", numPosts: 3 });
    await thread.save();

    const liste = await getThread(thread.id);

    expect(liste.title).toBe("Jinxs Store");
    expect(liste.creator).toBe(idJinx.toString());
    expect(liste.subForum).toBe("computer science");
    expect(liste.numPosts).toBe(3);
})

test("Error when no thread with specified ID is found", async () => {
    const invalidUserId =  new mongoose.Types.ObjectId();
    await expect(getThread(invalidUserId.toString())).rejects.toThrow(`Thread with ID ${invalidUserId} not found`);
})

test("Error when the creator is not found", async () => {
    const thread = new Thread({ title: "Jinxs Store", creator: idJinx, subForum: "computer science", numPosts: 3 });
    await thread.save();

    // Deletes the creator from the database to simulate an error scenario
    await User.findByIdAndDelete(idJinx).exec();
    await expect(getThread(thread.id)).rejects.toThrow(`Creator not found`);
})

// ----------------------------------------------------------- createThread ----------------------------------------------------------------

test("Creates a new Thread and returns it", async () => {
    const thread = { title: "Jinxs Store", creator: idJinx, subForum: "computer science" };

    const res = await createThread(thread);

    expect(res.title).toEqual(thread.title);
    expect(res.subForum).toEqual(thread.subForum);
    expect(res.numPosts).toEqual(0);

    const threadCreated = await Thread.findById(res.id).exec();
    
    expect(threadCreated?.title).toEqual(thread.title);
    expect(threadCreated?.subForum).toEqual(thread.subForum);
    expect(threadCreated?.creator.toString()).toEqual(thread.creator);
})

test("Error when User not found", async () => {
    const thread = new Thread({ title: "Jinxs Store", creator: idJinx, subForum: "computer science" });
    await thread.save();

    await User.findByIdAndDelete(idJinx).exec();
    await expect(createThread(thread.id)).rejects.toThrow(`Creator not found`);
})

// ----------------------------------------------------------- updateThread ----------------------------------------------------------------

test("Updates Data of the Thread", async () => {
    // Create Thread
    const thread = new Thread({ title: "Jinxs Store", creator: idJinx, subForum: "computer science" });
    await thread.save();

    // Update Thread
    const updatedThread = { id: thread.id, title: "Pauders Store", creator: idJinx, subForum: "german" };
    const res = await updateThread(updatedThread);

    // Check, if Thread was updated
    const findThread = await Thread.findById(thread.id).exec();
    expect(findThread?.title).toEqual(updatedThread.title);
    expect(findThread?.subForum).toEqual(updatedThread.subForum);
    expect(findThread?.creator.toString()).toEqual(updatedThread.creator);

    // Check, if updated Thread is returned
    expect(res.title).toEqual(updatedThread.title);
    expect(res.subForum).toEqual(updatedThread.subForum);
})

test("Throws Error when invalid Data accures", async () => {
    const invalidUserId =  new mongoose.Types.ObjectId();
    await expect(updateThread({ id: invalidUserId.toString(), title: "invalidStore", creator: "invalidCreator", subForum: "invalidSubForum" })).rejects.toThrow(`Thread with ID ${invalidUserId} not found`);
})

// ----------------------------------------------------------- deleteThread ----------------------------------------------------------------

test("Deletes the Thread with all of its posts", async () => {
    const thread = new Thread({ title: "Jinxs Store", creator: idJinx, subForum: "computer science" });
    await thread.save();

    const posts = [
        new ThreadPage({ content: "Help me with Java", author: "Mikasa", upvotes: "13", downvotes: "2" }),
        new ThreadPage({ content: "Help me with C", author: "Eren", upvotes: "23", downvotes: "12" }),
    ];    
    await ThreadPage.insertMany(posts);

    // Deletes Thread
    await deleteThread(thread.id);

    // Check, if deleted
    const deletedThread = await Thread.findById(thread.id).exec();
    expect(deletedThread).toBeNull();

    // Check, if posts are also deleted
    const deletedPosts = await ThreadPage.find({ thread: thread.id }).exec();
    expect(deletedPosts).toHaveLength(0);
});

test("Throws an Error, when Thread not found", async () => {
    // Hacky solution, we create a new ObjectId that doesn't exist in the system and pass it to the function    
    const invalidId = new mongoose.Types.ObjectId();
    await expect(deleteThread(invalidId.toString())).rejects.toThrow("Thread with ID " + invalidId + " not found");
});
