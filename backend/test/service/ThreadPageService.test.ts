import mongoose, { Types } from "mongoose";
import { IUser, User } from "../../src/endpoints/user/UserModel";
import TestDB from "../TestDB";
import { IPost, Post } from "../../src/endpoints/post/PostModel";
import { ThreadPage } from "../../src/endpoints/threadpage/ThreadPageModel";
import { Thread } from "../../src/endpoints/thread/ThreadModel";
import { createThreadPage, deleteThreadPage, getThreadPage, updateThreadPage } from "../../src/endpoints/threadpage/ThreadPageService";
import { ThreadPageResource } from "../../src/types/Resources";

let umut: IUser & { _id: Types.ObjectId; }
let moe: IUser & { _id: Types.ObjectId; }

beforeAll(async () => {
    await TestDB.connect();
});

beforeEach(async () => {
    umut = await User.create({
        email: "umutcandin@gmx.de",
        name: "Umut Can Aydin",
        password: "umut21",
        admin: false
    });
    moe = await User.create({
        email: "ummutcandin@gmx.de",
        name: "Ummut Can Aydin",
        password: "ummut21",
        admin: false
    });
});

afterEach(async () => {
    await TestDB.clear();
});

afterAll(async () => {
    await TestDB.close();
});
//GET tests
// Create posts
test("GET ThreadPage", async () => {
    const post = await Post.create({
        content: "Test.",
        author: umut,
        createdAt: new Date()
    });

    const post2 = await Post.create({
        content: "Test2.",
        author: moe,
        createdAt: new Date()
    });

    // Create ThreadPages
    const threadPage = await ThreadPage.create({
        posts: [post, post2],
        createdAt: new Date()
    });
    const tpLoaded = await getThreadPage(threadPage.id)
    expect(tpLoaded.id).toEqual(threadPage.id)
    expect(tpLoaded.posts[0].author).toEqual(threadPage.posts[0].author)
    expect(tpLoaded.createdAt).toEqual(threadPage.createdAt)
});

test("GET ThreadPage negative", async () => {
    const fakeID = new mongoose.Types.ObjectId();
    await expect(getThreadPage(fakeID.toString())).rejects.toThrow("Page not found");

});

//POST tests
test("POST ThreadPage", async () => {
    // Create posts
    const post = await Post.create({
        content: "Test.",
        author: umut,
        createdAt: new Date()
    });
    let tpResource = { posts: [post] } as ThreadPageResource
    let result = await createThreadPage(tpResource)
    expect(result.id).toBeDefined()
    //console.log(result.id)
    expect(result.posts[0].content).toEqual(tpResource.posts[0].content)
    expect(result.posts[0].author._id).toEqual(umut._id)
    //console.log(result.posts[0].author.id)
    expect(result.createdAt).toBeDefined()
    //console.log(result.createdAt)
});

//UPDATE tests 
test("create a Thread and test some attributes", async () => {

    // Create posts
    const post = await Post.create({
        content: "Test.",
        author: umut,
        createdAt: new Date()
    });

    const post2 = await Post.create({
        content: "Test2.",
        author: moe,
        createdAt: new Date()
    });

    // Create ThreadPages
    const threadPage = await ThreadPage.create({
        posts: [post, post2],
        createdAt: new Date()
    });

    let tpResource = { id: threadPage.id, posts: [] } as ThreadPageResource
    let savedThreadPage = await updateThreadPage(tpResource)

    expect([]).toEqual(savedThreadPage.posts)
    expect([].length).toEqual(savedThreadPage.posts.length)

    tpResource = { id: threadPage.id, posts: [post2] } as ThreadPageResource
    savedThreadPage = await updateThreadPage(tpResource)

    expect(post2.content).toEqual(savedThreadPage.posts[0].content)
    expect([post].length).toEqual(savedThreadPage.posts.length)
    expect((savedThreadPage.posts[0] as any).id).toBeDefined()

    tpResource = { id: threadPage.id, posts: [post, post2] } as ThreadPageResource
    savedThreadPage = await updateThreadPage(tpResource)
    expect(post.content).toEqual(savedThreadPage.posts[0].content)
    expect(post2.content).toEqual(savedThreadPage.posts[1].content)

});

test("PUT ThreadPage both errors", async () => {
    //when id in resource is missing
    let tpResource = {posts: [] } as ThreadPageResource
    await expect(updateThreadPage(tpResource)).rejects.toThrow("Page id missing, cannot update")

    //when no ThreadPage with the given id exists
    const fakeID = new mongoose.Types.ObjectId();
    tpResource = {id: fakeID.toString(), posts: [] } as ThreadPageResource
    await expect(updateThreadPage(tpResource)).rejects.toThrow(`No Page with id ${tpResource.id} found, cannot update`)
});

//DELETE tests

test("DELETE ThreadPage positive withexisting ThreadPage", async () => {
    // Create posts
    const post = await Post.create({
        content: "Test.",
        author: umut,
        createdAt: new Date()
    });

    const post2 = await Post.create({
        content: "Test2.",
        author: moe,
        createdAt: new Date()
    });

    // Create ThreadPages
    const threadPage = await ThreadPage.create({
        posts: [post, post2],
        createdAt: new Date()
    });
    await deleteThreadPage(threadPage.id);
    const threadPageDeleted = await ThreadPage.findById(threadPage.id).exec();
    expect(threadPageDeleted).toBeNull();
});

test("Error when deleting a user with a missing id", async () => {
    const fakeID = new mongoose.Types.ObjectId();
    await expect(deleteThreadPage(fakeID.toString())).rejects.toThrow(`No Page with id ${fakeID.toString()} found, cannot delete`);
});