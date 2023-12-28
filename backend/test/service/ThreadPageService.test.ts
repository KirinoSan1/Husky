import TestDB from "../TestDB";
import mongoose, { Types } from "mongoose";
import { IUser, User } from "../../src/endpoints/user/UserModel";
import { Post } from "../../src/endpoints/post/PostModel";
import { ThreadPage } from "../../src/endpoints/threadpage/ThreadPageModel";
import { addPost, addPostNewPage, createThreadPage, deleteThreadPage, editPost, getThreadPage, getThreadPageAuthors, updateThreadPage } from "../../src/endpoints/threadpage/ThreadPageService";
import { ThreadPageResource } from "../../src/types/Resources";
import { Thread } from "../../src/endpoints/thread/ThreadModel";

let userUmut: IUser & { _id: Types.ObjectId; }
let userMoe: IUser & { _id: Types.ObjectId; }

beforeAll(async () => { await TestDB.connect(); });
beforeEach(async () => {
    userUmut = await User.create({
        email: "umutcandin@gmx.de",
        name: "Umut Can Aydin",
        password: "umut21",
        admin: false,
        verified: true
    });
    userMoe = await User.create({
        email: "moe@gmail.com",
        name: "Moe Penaldo",
        password: "moe123",
        admin: false,
        verified: true
    });
});
afterEach(async () => { await TestDB.clear(); });
afterAll(async () => { await TestDB.close(); });

// ------------------------------------------------------------ getThreadPage -------------------------------------------------------------------

test("GET ThreadPage", async () => {
    const post = await Post.create({ content: "Test.", author: userUmut, createdAt: new Date() });
    const post2 = await Post.create({ content: "Test2.", author: userMoe, createdAt: new Date() });

    // Create ThreadPages
    const threadPage = await ThreadPage.create({
        posts: [post, post2],
        createdAt: new Date()
    });
    const tpLoaded = await getThreadPage(threadPage.id);

    expect(tpLoaded.id).toEqual(threadPage.id);
    expect(tpLoaded.posts[0].author).toEqual(threadPage.posts[0].author);
    expect(tpLoaded.createdAt).toEqual(threadPage.createdAt);
});

test("GET ThreadPage negative", async () => {
    const invalidID = new mongoose.Types.ObjectId();
    await expect(getThreadPage(invalidID.toString())).rejects.toThrow("Page not found.");
});

// -------------------------------------------------------- getThreadPageAuthors -------------------------------------------------------------------

test("GET ThreadPageAuthors", async () => {
    const post1 = await Post.create({ content: "Test.", author: userUmut });
    const post2 = await Post.create({ content: "Test2.", author: userMoe });

    // Create ThreadPages
    const threadPage = await ThreadPage.create({
        posts: [post1, post2],
        createdAt: new Date()
    });
    const authors = await getThreadPageAuthors(threadPage.id);

    expect(authors.authors.length).toBe(2);
    expect(authors.authors[0].id).toEqual(userUmut._id.toString());
    expect(authors.authors[0].name).toEqual(userUmut.name);
    expect(authors.authors[1].id).toEqual(userMoe._id.toString());
    expect(authors.authors[1].name).toEqual(userMoe.name);
});

test("GET ThreadPageAuthors 2", async () => {
    const threadPage = await ThreadPage.create({
        posts: [],
        createdAt: new Date()
    });
    const authors = await getThreadPageAuthors(threadPage.id);

    expect(authors.authors.length).toBe(0);
});

test("GET ThreadPageAuthors - test for case when author admin and mod field are null or undefined", async () => {
    const user = await User.create({
        id: new mongoose.Types.ObjectId(),
        email: "uniqueemail@example.com",
        name: "Unique Author",
        password: "uniquepass",
        admin: null,
        mod: null,
        createdAt: new Date()
    });

    const post1 = await Post.create({ content: "Test.", author: user });

    const threadPage = await ThreadPage.create({
        posts: [post1],
        createdAt: new Date(),
    });

    const authors = await getThreadPageAuthors(threadPage.id);

    expect(authors.authors.length).toBe(1);
    expect(authors.authors[0].id).toEqual(user._id.toString());
    expect(authors.authors[0].name).toEqual(user.name);
});

test("GET ThreadPageAuthors negative", async () => {
    const invalidID = new mongoose.Types.ObjectId();
    await expect(getThreadPageAuthors(invalidID.toString())).rejects.toThrow("Page not found.");
});

test("GET ThreadPageAuthors negative, invalid Author", async () => {
    const post1 = await Post.create({ content: "Test.", author: new mongoose.Types.ObjectId() });

    const threadPage = await ThreadPage.create({
        posts: [post1],
        createdAt: new Date()
    });

    await expect(getThreadPageAuthors(threadPage.id)).rejects.toThrow("Author not found.");
});

test("GET ThreadPageAuthors negative, skip duplicate Authors", async () => {
    const post1 = await Post.create({ content: "Test.", author: userUmut });
    const post2 = await Post.create({ content: "Test2.", author: userUmut });

    const threadPage = await ThreadPage.create({
        posts: [post1, post2],
        createdAt: new Date()
    });

    const authors = await getThreadPageAuthors(threadPage.id);

    expect(authors.authors.length).toBe(1);
    expect(authors.authors[0].id).toEqual(userUmut._id.toString());
    expect(authors.authors[0].name).toEqual(userUmut.name);
});

// ------------------------------------------------------------ createThreadPage -------------------------------------------------------------------

test("POST ThreadPage", async () => {
    const post = await Post.create({ content: "Test.", author: userUmut, createdAt: new Date() });
    let tpResource = { posts: [post] } as ThreadPageResource;
    let result = await createThreadPage(tpResource);

    expect(result.id).toBeDefined();
    expect(result.posts[0].content).toEqual(tpResource.posts[0].content);
    expect(result.posts[0].author._id).toEqual(userUmut._id);
    expect(result.createdAt).toBeDefined();
});

test("POST, create a Thread and test some attributes", async () => {
    const post = await Post.create({ content: "Test.", author: userUmut, createdAt: new Date() });
    const post2 = await Post.create({ content: "Test2.", author: userMoe, createdAt: new Date() });

    // Create ThreadPages
    const threadPage = await ThreadPage.create({
        posts: [post, post2],
        createdAt: new Date()
    });

    let tpResource = { id: threadPage.id, posts: [] } as ThreadPageResource;
    let savedThreadPage = await updateThreadPage(tpResource);

    expect([]).toEqual(savedThreadPage.posts);
    expect([].length).toEqual(savedThreadPage.posts.length);

    tpResource = { id: threadPage.id, posts: [post2] } as ThreadPageResource;
    savedThreadPage = await updateThreadPage(tpResource);

    expect(post2.content).toEqual(savedThreadPage.posts[0].content);
    expect([post].length).toEqual(savedThreadPage.posts.length);
    expect((savedThreadPage.posts[0] as any).id).toBeDefined();

    tpResource = { id: threadPage.id, posts: [post, post2] } as ThreadPageResource;
    savedThreadPage = await updateThreadPage(tpResource);
    expect(post.content).toEqual(savedThreadPage.posts[0].content);
    expect(post2.content).toEqual(savedThreadPage.posts[1].content);
});

// ------------------------------------------------------------ updateThreadPage -------------------------------------------------------------------

test("PUT ThreadPage ID missing", async () => {
    let tpResource = { posts: [] } as ThreadPageResource;
    await expect(updateThreadPage(tpResource)).rejects.toThrow("Page ID missing, cannot update.");

    const invalidID = new mongoose.Types.ObjectId();
    tpResource = { id: invalidID.toString(), posts: [] } as ThreadPageResource;
    await expect(updateThreadPage(tpResource)).rejects.toThrow(`No Page with ID ${tpResource.id} found, cannot update.`);
});

// ------------------------------------------------------------ addPostInThreadPage -----------------------------------------------------------------

test("addPostInThreadPage - Should add a post to an existing thread page", async () => {
    const thread = await Thread.create({ title: "Jinxs Store", creator: userUmut, subForum: "computer science", numPosts: 10 });
    const content = 'This is a test post.';
    const threadID = thread.id;
    const post1 = await Post.create({ content: "Test.", author: userUmut });
    const post2 = await Post.create({ content: "Test2.", author: userUmut });

    const newThreadPage = await ThreadPage.create({
        posts: [post1, post2],
        createdAt: new Date()
    });

    const result: ThreadPageResource = await addPost(content, userUmut._id.toString(), newThreadPage.id, threadID);
    const threadPage = await ThreadPage.findById(newThreadPage.id).exec();

    expect(result.id).toEqual(newThreadPage.id);
    expect(threadPage?.posts.length).toBe(3);
    expect(threadPage?.posts[0].content).toEqual(post1.content);
    expect(threadPage?.posts[0].author.toString()).toEqual(userUmut._id.toString());
});

test("addPostInThreadPage - Should call addPostNewPage when maximum post limit is reached", async () => {
    const content = 'This is a test post.';
    const thread = await Thread.create({ title: "Jinxs Store", creator: userUmut, subForum: "computer science", numPosts: 10 });

    const threadPage = await ThreadPage.create({
        posts: Array.from({ length: 10 }, () => ({ content: 'Dummy post', author: userUmut })),
        createdAt: new Date(),
    });

    const result: ThreadPageResource = await addPost(content, userUmut._id.toString(), threadPage.id, thread.id);

    expect(result.id).toBeDefined();
    expect(result.posts.length).toBe(1);
});

test("addPostInThreadPage - Should throw an error when content is not defined", async () => {
    const authorID = 'dummyAuthorID';
    const threadID = 'dummyThreadID';
    const post1 = await Post.create({ content: "Test.", author: userUmut });
    const post2 = await Post.create({ content: "Test2.", author: userUmut });

    const newThreadPage = await ThreadPage.create({
        posts: [post1, post2],
        createdAt: new Date()
    });

    await expect(addPost('', authorID, newThreadPage.id, threadID)).rejects.toThrow('Content not defined.');
});

test("addPostInThreadPage - Should throw an error when authorID is not defined", async () => {
    const content = 'This is a test post';
    const threadID = 'dummyThreadID';
    const post1 = await Post.create({ content: "Test.", author: userUmut });
    const post2 = await Post.create({ content: "Test2.", author: userUmut });

    const newThreadPage = await ThreadPage.create({
        posts: [post1, post2],
        createdAt: new Date()
    });

    await expect(addPost(content, '', newThreadPage.id, threadID)).rejects.toThrow('AuthorID not defined.');
});

test("addPostInThreadPage - Should throw an error when threadPageID is not defined", async () => {
    const content = 'This is a test post';
    const authorID = 'dummyAuthorID';
    const threadID = 'dummyThreadID';

    await expect(addPost(content, authorID, '', threadID)).rejects.toThrow('ThreadPageID not defined.');
});

test("addPostInThreadPage - Should throw an error when no page is found with invalid threadPageID", async () => {
    const content = 'This is a test post.';
    const authorID = 'dummyAuthorID';
    const invalidThreadPageID = '123456789012345678901234';

    await expect(addPost(content, authorID, invalidThreadPageID, 'dummyThreadID')).rejects.toThrow(`No page with ID ${invalidThreadPageID} found.`);
});

test("addPostInThreadPage - Should throw an error when author is not found with invalid authorID", async () => {
    const content = 'This is a test post.';
    const invalidAuthorID = '123456789012345678901234';
    const post1 = await Post.create({ content: "Test.", author: userUmut });
    const post2 = await Post.create({ content: "Test2.", author: userUmut });

    const newThreadPage = await ThreadPage.create({
        posts: [post1, post2],
        createdAt: new Date()
    });

    await expect(addPost(content, invalidAuthorID, newThreadPage.id, 'dummyThreadID')).rejects.toThrow('Author not found.');
});

test("addPost - Should throw an error when thread is not found", async () => {
    const content = 'This is a test post.';
    const invalidThreadID = new mongoose.Types.ObjectId().toString();

    const post1 = await Post.create({ content: "Test.", author: userUmut });
    const post2 = await Post.create({ content: "Test2.", author: userUmut });
    const newThreadPage = await ThreadPage.create({
        posts: [post1, post2],
        createdAt: new Date()
    });

    await expect(addPost(content, userMoe._id.toString(), newThreadPage.id, invalidThreadID)).rejects.toThrow('Thread not found.');
});

// ----------------------------------------------------- addPostNewPageInThreadPage ----------------------------------------------------------------

test('addPostNewPageInThreadPage - Should throw an error if author is not defined', async () => {
    const content = 'This is a test post.';
    const threadID = 'dummyThreadID';

    await expect(addPostNewPage('', content, threadID)).rejects.toThrow('Author not defined.');
});

test('addPostNewPageInThreadPage - Should throw an error if content is not defined', async () => {
    const author = 'dummyAuthor';
    const threadID = 'dummyThreadID';

    await expect(addPostNewPage(author, '', threadID)).rejects.toThrow('Content not defined.');
});

test('addPostNewPageInThreadPage - Should throw an error if no thread is found with given threadID', async () => {
    const content = 'This is a test post.';
    const invalidThreadPageID = '123456789012345678901234';

    await expect(addPostNewPage(userUmut._id.toString(), content, invalidThreadPageID)).rejects.toThrow(`No thread with ID ${invalidThreadPageID} found.`);
});

// ---------------------------------------------------------- editPostInThreadPage -----------------------------------------------------------------

test('editPostInThreadPage - Should edit a post in a thread page successfully', async () => {
    const threadPage = await ThreadPage.create({
        posts: [{ content: 'Original post content', author: userUmut, modified: null }]
    });

    const content = 'Edited post content';
    const authorID = 'dummyAuthorID';
    const threadPageID = threadPage.id;
    const postNum = 0;
    const modified = "m";

    const result = await editPost(content, authorID, threadPageID, postNum, modified);

    expect(result.id).toEqual(threadPage.id);
    expect(result.posts[postNum].content).toEqual(content);
    expect(result.posts[postNum].modified).toEqual('m');
});

test('editPostInThreadPage - Should throw an error if content is not defined', async () => {
    const authorID = 'dummyAuthorID';
    const threadPageID = 'dummyThreadPageID';
    const postNum = 0;
    const modified = "";

    await expect(editPost('', authorID, threadPageID, postNum, modified)).rejects.toThrow('Content not defined.');
});

test('editPostInThreadPage - Should throw an error if authorID is not defined', async () => {
    const content = 'This is a test post.';
    const threadPageID = 'dummyThreadPageID';
    const postNum = 0;
    const modified = "";

    await expect(editPost(content, '', threadPageID, postNum, modified)).rejects.toThrow('Author not defined.');
});

test('editPostInThreadPage - Should throw an error if threadPageID is not defined', async () => {
    const content = 'This is a test post.';
    const postNum = 0;
    const modified = "";

    await expect(editPost(content, userUmut._id.toString(), '', postNum, modified)).rejects.toThrow('ThreadPageID not defined.');
});

test('editPostInThreadPage - Should throw an error if postNum is not defined', async () => {
    const content = 'This is a test post.';
    const authorID = 'dummyAuthorID';
    const threadPageID = 'dummyThreadPageID';
    const postNum: number = null as any;
    const modified = "";

    await expect(editPost(content, authorID, threadPageID, postNum, modified)).rejects.toThrow('PostNum not defined.');
});

test('editPostInThreadPage - Should throw an error if post does not exist with given postNum', async () => {
    const content = 'This is a test post.';
    const threadPage = await ThreadPage.create({ posts: [{ content: 'First post', author: userUmut }] });
    const threadPageID = threadPage.id;
    const postNum = 1;
    const modified = "";

    await expect(editPost(content, userUmut._id.toString(), threadPageID, postNum, modified)).rejects.toThrow('Post doesn\'t exist.');
});

test('editPostInThreadPage - Should throw an error if no page is found with given threadPageID', async () => {
    const content = 'This is a test post.';
    const authorID = 'dummyAuthorID';
    const threadPageID = '123456789012345678901234';
    const modified = "";

    await expect(editPost(content, authorID, threadPageID, 0, modified)).rejects.toThrow(`No page with ID ${threadPageID} found.`);
});

test('editPostInThreadPage - Should throw an error if trying to edit a deleted post', async () => {
    const content = 'This is a test post.';
    const postNum = 0;
    const modified = "";

    const threadPage = await ThreadPage.create({
        posts: [{ content: 'Deleted post', author: userUmut, modified: 'd' }],
    });

    await expect(editPost(content, userUmut._id.toString(), threadPage.id, postNum, modified)).rejects.toThrow('Cannot edit deleted post.');
});

// ------------------------------------------------------------ deleteThreadPage -------------------------------------------------------------------

test("DELETE ThreadPage with existing ThreadPage", async () => {
    const post = await Post.create({ content: "Test.", author: userUmut, createdAt: new Date() });
    const post2 = await Post.create({ content: "Test2.", author: userMoe, createdAt: new Date() });

    // Create ThreadPages
    const threadPage = await ThreadPage.create({
        posts: [post, post2],
        createdAt: new Date()
    });
    await deleteThreadPage(threadPage.id);
    const threadPageDeleted = await ThreadPage.findById(threadPage.id).exec();

    expect(threadPageDeleted).toBeNull();
});

test("DELETE Error when deleting a user with a missing ID", async () => {
    const invalidID = new mongoose.Types.ObjectId();
    await expect(deleteThreadPage(invalidID.toString())).rejects.toThrow(`No Page with ID ${invalidID.toString()} found, cannot delete.`);
});
