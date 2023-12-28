import dotenv from "dotenv";
dotenv.config();

import TestDB from "../TestDB";
import supertest from "supertest";
import app from "../../src/testIndex";
import mongoose from "mongoose";
import { User } from "../../src/endpoints/user/UserModel";
import { createThreadPage } from "../../src/endpoints/threadpage/ThreadPageService";
import * as createThreadPage2 from "../../src/endpoints/threadpage/ThreadPageService"
import { LoginResource, ThreadPageResource, UserResource } from "../../src/types/Resources";
import { Post } from "../../src/endpoints/post/PostModel";
import { ThreadPage } from "../../src/endpoints/threadpage/ThreadPageModel";
import { Thread } from "../../src/endpoints/thread/ThreadModel";

let userJohn: UserResource;
let userUmut: UserResource;
let idJohn: string;
let idUmut: string;

let threadPage: ThreadPageResource;
let threadPageID: string;
let postID: string;
let postID2: string;

let token: string;
let tokenB: string;

beforeAll(async () => { await TestDB.connect(); });
beforeEach(async () => {
    User.syncIndexes();
    userJohn = await User.create({ name: "Johnathan", email: "johnathan@jonathan.de", password: "123asdf!ABCD", admin: true, verified: true });
    idJohn = userJohn.id!;

    // Login for token access
    const request = supertest(app);
    const loginData = { email: "johnathan@jonathan.de", password: "123asdf!ABCD" };
    const response = await request.post(`/api/login`).send(loginData);
    const loginResource = response.body as LoginResource;
    token = loginResource.access_token;
    expect(token).toBeDefined();

    userUmut = await User.create({ name: "Umi", email: "umi@jonatahan.de", password: "123asdf!ABCDs", admin: false, verified: true });
    idUmut = userUmut.id!;

    const request2 = supertest(app);
    const loginData2 = { email: "umi@jonatahan.de", password: "123asdf!ABCDs" };
    const response2 = await request2.post(`/api/login`).send(loginData2);
    const loginResource2 = response2.body as LoginResource;
    tokenB = loginResource2.access_token;
    expect(tokenB).toBeDefined();

    let post = await Post.create({ content: "This is an Example.", author: idUmut, modified: "", createdAt: new Date() });
    postID = post.id!;

    let post2 = await Post.create({ content: "This is the other Example.", author: idJohn, modified: "", createdAt: new Date() });
    postID2 = post.id!;

    threadPage = await createThreadPage({ id: idUmut, posts: [post, post2] });
    threadPageID = threadPage.id!;
});
afterEach(async () => { await TestDB.clear(); });
afterAll(async () => { await TestDB.close() });

// ---------------------------------------------------------- GET Tests --------------------------------------------------------------

test("ThreadPage GET, positive test", async () => {
    const request = supertest(app);
    const response = await request.get(`/api/threadpage/${threadPageID}`).send(userJohn);

    expect(response.statusCode).toBe(200);

    const usersRes = response.body as ThreadPageResource;
    expect(usersRes.posts[0].content).toEqual(threadPage.posts[0].content);
}, 10000);

test("ThreadPage GET, negative test", async () => {
    const request = supertest(app);
    const response = await request.get(`/api/threadpage/test`);

    expect(response.statusCode).toBe(400);
}, 10000);

test("ThreadPage GET, negative test 2", async () => {
    const request = supertest(app);
    const response = await request.get(`/api/threadpage/${new mongoose.Types.ObjectId}`);

    expect(response.statusCode).toBe(400);
}, 10000);

test("ThreadPage GET authors, for ThreadPage with valid ID", async () => {
    const request = supertest(app);
    const response = await request.get(`/api/threadpage/authors/${threadPageID}`).set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(200);
});

test("ThreadPage GET authors, for ThreadPage with invalid ID", async () => {
    const invalidThreadPageID = "invalidID";
    const request = supertest(app);
    const response = await request.get(`/api/threadpage/authors/${invalidThreadPageID}`).set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(400);
    expect(response.body.errors).toBeDefined();
});

test("ThreadPage GET authors, for ThreadPage with invalid ID 2", async () => {
    const request = supertest(app);
    const response = await request.get(`/api/threadpage/authors/${new mongoose.Types.ObjectId}`).set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(400);
});

// ---------------------------------------------------------- POST Tests --------------------------------------------------------------

test("ThreadPage POST, positive test", async () => {
    const request = supertest(app);
    const newThreadPage: ThreadPageResource = { posts: threadPage.posts };
    const response = await request.post(`/api/threadpage`).send(newThreadPage).set("Authorization", `Bearer ${token}`);
    const searchedThreadPage = await ThreadPage.findOne({ id: threadPageID }).exec();

    expect(searchedThreadPage).toBeDefined();
    expect(response.statusCode).toBe(201);
});

test("ThreadPage POST, negative test with validation 400", async () => {
    const request = supertest(app);
    const newThreadPage = "test";
    const response = await request.post(`/api/threadpage`).send(newThreadPage).set("Authorization", `Bearer ${token}`);

    expect(response.statusCode).toBe(400);
});

test("ThreadPage POST, negative test with validation 400 2", async () => {
    const request = supertest(app);
    const response = await request.post(`/api/threadpage/`).set("Authorization", `Bearer ${token}`);

    expect(response.statusCode).toBe(400);
});

test("ThreadPage POST, negative test with too many posts in request", async () => {
    const tooManyPosts = new Array(11).fill({});
    const requestBody = { posts: tooManyPosts };

    const request = supertest(app);
    const response = await request.post('/api/threadpage').send(requestBody).set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(400);
});

test("ThreadPage POST, catch error", async () => {
    const newThreadPage: ThreadPageResource = { posts: threadPage.posts };

    jest.spyOn(createThreadPage2, 'createThreadPage').mockImplementationOnce(() => {
        throw new Error("threadPageRouter");
    });
    const request = supertest(app);
    const response = await request.post('/api/threadpage').send(newThreadPage).set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(400);
});

// ---------------------------------------------------------- PUT Tests --------------------------------------------------------------

test("ThreadPage PUT, positive test", async () => {
    const request = supertest(app);
    const newThreadPage: ThreadPageResource = { posts: threadPage.posts };
    const response = await request.put(`/api/threadpage/${threadPageID}`).send(newThreadPage).set("Authorization", `Bearer ${token}`);

    expect(response.statusCode).toBe(200);
    const tPresponse = response.body as ThreadPageResource;

    expect(tPresponse.posts[0].content).toStrictEqual(threadPage.posts[0].content);
});

test("ThreadPage PUT, positive test 2", async () => {
    const request = supertest(app);
    const newThreadPage: ThreadPageResource = { posts: [] };
    const response = await request.put(`/api/threadpage/${threadPageID}`).send(newThreadPage).set("Authorization", `Bearer ${token}`);

    expect(response.statusCode).toBe(400);
});

test("ThreadPage PUT, negative test with validation 400", async () => {
    const request = supertest(app);
    const newThreadPage: ThreadPageResource = { posts: [] };
    const response = await request.put(`/api/threadpage/test`).send(newThreadPage).set("Authorization", `Bearer ${token}`);

    expect(response.statusCode).toBe(400);
});

test("ThreadPage PUT, negative test with service error", async () => {
    const request = supertest(app);
    const newThreadPage: ThreadPageResource = { posts: threadPage.posts };
    const invalidID = new mongoose.Types.ObjectId();
    const response = await request.put(`/api/threadpage/${invalidID.toString()}`).send(newThreadPage).set("Authorization", `Bearer ${token}`);

    expect(response.statusCode).toBe(400);
});

// ---------------------------------------------------------- PATCH Tests --------------------------------------------------------------

test("ThreadPage PATCH add, should successfully add a post", async () => {
    const thread = await Thread.create({
        creator: idUmut,
        title: "Thread",
        subForum: "Testing",
        pages: [threadPageID],
        numPosts: 2,
        createdAt: Date.now()
    });
    const content = "New post content";

    const reqBody = { author: idUmut, content, threadID: thread.id };
    const request = supertest(app);
    const response = await request.patch(`/api/threadpage/${threadPageID}/add`).send(reqBody).set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body).toBeDefined();
});

test("ThreadPage PATCH add, should handle missing required fields in request", async () => {
    const invalidReqBody = {};

    const request = supertest(app);
    const response = await request.patch('/api/threadpage/invalidId/add').send(invalidReqBody).set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(400);
    expect(response.body.errors).toBeDefined();
});

test("ThreadPage PATCH add, with invalid ID", async () => {
    const thread = await Thread.create({
        creator: idUmut,
        title: "Thread",
        subForum: "Testing",
        pages: [threadPageID],
        numPosts: 2,
        createdAt: Date.now()
    });
    const content = "New post content";

    const reqBody = { author: idUmut, content, threadID: thread.id };
    const request = supertest(app);
    const response = await request.patch(`/api/threadpage/${new mongoose.Types.ObjectId}/add`).send(reqBody).set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(400); // Catch-error
});

test("ThreadPage PATCH edit, should successfully edit a post", async () => {
    const thread = await Thread.create({
        creator: idUmut,
        title: "Thread",
        subForum: "Testing",
        pages: [threadPageID],
        numPosts: 2,
        createdAt: Date.now()
    });
    const content = "New post content";

    const reqBody = { author: idUmut, content, postNum: 0, modified: "d" };
    const request = supertest(app);
    const response = await request.patch(`/api/threadpage/${threadPageID}/edit`).send(reqBody).set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body).toBeDefined();
});

test("ThreadPage PATCH edit, should successfully edit a post with undefined modified value", async () => {
    const thread = await Thread.create({
        creator: idUmut,
        title: "Thread",
        subForum: "Testing",
        pages: [threadPageID],
        numPosts: 2,
        createdAt: Date.now()
    });
    const content = "New post content";

    const reqBody = { author: idUmut, content, postNum: 0, modified: undefined };
    const request = supertest(app);
    const response = await request.patch(`/api/threadpage/${threadPageID}/edit`).send(reqBody).set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body).toBeDefined();
});

test("ThreadPage PATCH edit, should handle missing required fields in request", async () => {
    const invalidReqBody = {};

    const request = supertest(app);
    const response = await request.patch('/api/threadpage/invalidId/edit').send(invalidReqBody).set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(400);
    expect(response.body.errors).toBeDefined();
});

test("ThreadPage PATCH edit, with invalid ID", async () => {
    const thread = await Thread.create({
        creator: idUmut,
        title: "Thread",
        subForum: "Testing",
        pages: [threadPageID],
        numPosts: 2,
        createdAt: Date.now()
    });
    const content = "New post content";

    const reqBody = { author: idUmut, content, postNum: thread.numPosts };
    const request = supertest(app);
    const response = await request.patch(`/api/threadpage/${new mongoose.Types.ObjectId}/edit`).send(reqBody).set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(400); // Catch-error
});

// ---------------------------------------------------------- DELETE Tests --------------------------------------------------------------

test("ThreadPage DELETE, positive test", async () => {
    const request = supertest(app);

    const post1 = await Post.create({ content: "Test.", author: userJohn.id, createdAt: new Date() });
    const post2 = await Post.create({ content: "Test2.", author: userJohn.id, createdAt: new Date() });

    const threadPage = await ThreadPage.create({ posts: [post1, post2], createdAt: new Date() });
    const response = await request.delete(`/api/threadpage/${threadPage.id}`).set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(204);
});

test("ThreadPage DELETE, with validation error", async () => {
    const request = supertest(app);

    const threadPage = await ThreadPage.create({ posts: [], createdAt: new Date() });
    const response = await request.delete(`/api/threadpage/test`).set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(400);
});

test("ThreadPage DELETE, service error (fake id)", async () => {
    const invalidID = new mongoose.Types.ObjectId();
    const request = supertest(app);
    const response = await request.delete(`/api/threadpage/${invalidID.toString()}`).set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(400);
});
