import dotenv from "dotenv";
dotenv.config();

import app from "../../src/testIndex";
import supertest from 'supertest';
import TestDB from "../TestDB";
import { IUser, User } from "../../src/endpoints/user/UserModel";
import { createThread } from "../../src/endpoints/thread/ThreadService";
import { Post } from "../../src/endpoints/post/PostModel";
import { LoginResource, ThreadResource } from "../../src/types/Resources";
import * as ThreadService from "../../src/endpoints/thread/ThreadService";
import { IThread, Thread } from "../../src/endpoints/thread/ThreadModel";
import { Types } from "mongoose";
import { ObjectId } from 'mongodb';
import { SubForum } from "../../src/endpoints/subforum/SubForumModel";

let userJinx: IUser = { name: "John", email: "john@some-host.de", password: "123asdf!ABCD", admin: false, verified: true, votedPosts: new Map() };
let idJinx: string;

let userAqua: IUser = { name: "Aqua", email: "aqua@some-host.de", password: "1234asdf!ABCD", admin: false, verified: true, votedPosts: new Map() };
let idAqua: string;

let threadId: string;
let postid: Types.ObjectId;
let post2id: Types.ObjectId;

let token: string;
let token2: string;
const NON_EXISTING_ID = "635d2e796ea2e8c9bde5787c";

beforeAll(async () => { await TestDB.connect(); });
beforeEach(async () => {
    await User.syncIndexes()
    const jinx = await User.create(userJinx);
    idJinx = jinx.id;

    const aqua = await User.create(userAqua);
    idAqua = aqua.id;

    // Login for token access
    const request = supertest(app);
    const loginData = { email: "john@some-host.de", password: "123asdf!ABCD" };
    const response = await request.post(`/api/login`).send(loginData);
    const loginResource = response.body as LoginResource;
    token = loginResource.access_token;
    expect(token).toBeDefined();

    const request2 = supertest(app);
    const loginData2 = { email: "aqua@some-host.de", password: "1234asdf!ABCD" };
    const response2 = await request2.post(`/api/login`).send(loginData2);
    const loginResource2 = response2.body as LoginResource;
    token2 = loginResource2.access_token;
    expect(token2).toBeDefined();

    const scienceForum = await SubForum.create({
        name: "computer science",
        description: "geek stuff",
        threads: []
    });

    const post = await Post.create({ content: "Test.", author: jinx.id, createdAt: new Date() });
    const post2 = await Post.create({ content: "Test.", author: jinx.id, createdAt: new Date() });
    postid = post.id;
    post2id = post2.id;

    const thread = await Thread.create({
        creator: jinx._id,
        title: "Thread",
        subForum: "computer science",
        pages: [post.id, post2.id],
        numPosts: 2,
        createdAt: Date.now()
    });
    threadId = thread.id!;
});
afterEach(async () => { await TestDB.clear(); });
afterAll(async () => { await TestDB.close(); });

// ---------------------------------------------------------- GET Tests --------------------------------------------------------------

test("Thread GET, positive test", async () => {
    const request = supertest(app);
    const thread = await createThread({ title: "Jinxs Store", creator: idJinx!, subForum: "computer science", numPosts: 3, pages: [postid, post2id] });
    const response = await request.get(`/api/thread/${thread.id}`);

    expect(response.status).toBe(200);
    expect(response.body.title).toBe("Jinxs Store");
});

test("Thread GET, positive test with authentication", async () => {
    const request = supertest(app);
    const thread = await createThread({ title: "Jinxs Store", creator: idJinx!, subForum: "computer science", numPosts: 3, pages: [postid, post2id] });
    const response = await request.get(`/api/thread/${thread.id}`).set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.title).toBe("Jinxs Store");
});

test("Thread GET, negative test with invalid ID", async () => {
    const request = supertest(app);
    const response = await request.get(`/api/thread/1678242`).set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(400);
});

test("Thread GET, negative test with invalid ID 2", async () => {
    const request = supertest(app);
    const response = await request.get(`/api/thread/abc`).set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(400);
});

test("Thread GET, negative test with invalid ID 3", async () => {
    const request = supertest(app);
    const response = await request.get(`/api/thread/${NON_EXISTING_ID}`).set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(404);
});

test("Thread GET, negative test for code with 404", async () => {
    const request = supertest(app);
    const response = await request.get(`/api/`);

    expect(response.statusCode).toBe(404);
});

test("Thread GET title, positive test", async () => {
    const request = supertest(app);
    const thread = await createThread({ title: "Jinxs Store", creator: idJinx!, subForum: "computer science", numPosts: 3, pages: [postid, post2id] });
    const response = await request.get(`/api/thread/${thread.id}`);

    expect(response.status).toBe(200);
    expect(response.body.title).toBe("Jinxs Store");

    const searchResponse = await request.get(`/api/thread/find/jinx`);
    expect(searchResponse.status).toBe(200);
    expect(searchResponse.body[0].pages[0]).toEqual(thread.pages[0].toString());
});

test("Thread GET title, has more than one object", async () => {
    const request = supertest(app);
    const thread = await createThread({ title: "Jinxs Store", creator: idJinx!, subForum: "computer science", numPosts: 3, pages: [postid, post2id] });
    const thread2 = await createThread({ title: "Store", creator: idJinx!, subForum: "computer science", numPosts: 3, pages: [postid, post2id] });
    const response = await request.get(`/api/thread/${thread2.id}`);

    expect(response.status).toBe(200);
    expect(response.body.title).toBe("Store");

    const searchResponse = await request.get(`/api/thread//find/${"store"}`);

    expect(searchResponse.status).toBe(200);
    expect(searchResponse.body[0].title).toEqual(thread.title);
    expect(searchResponse.body[1].title).toEqual(thread2.title);
    expect(searchResponse.body[1].pages.length).toEqual(thread2.pages.length);
    expect(searchResponse.body[1].pages[0]).toEqual(thread2.pages[0].toString());
    expect(searchResponse.body[0].pages.length).toEqual(thread.pages.length);
    expect(searchResponse.body[0].pages[1]).toEqual(thread.pages[1].toString());
});

test("Thread GET title, negative test", async () => {
    const request = supertest(app);
    const thread = await createThread({ title: "Jinxs Store", creator: idJinx!, subForum: "computer science", numPosts: 3, pages: [postid, post2id] });
    const response = await request.get(`/api/thread/${thread.id}`);

    expect(response.status).toBe(200);
    expect(response.body.title).toBe("Jinxs Store");
    const randomNumber: number = 4;
    const searchResponse = await request.get(`/api/thread/find/${randomNumber}`);

    expect(searchResponse.status).toBe(400);
});

test("Thread GET title, error caught by catch block", async () => {
    const request = supertest(app);
    const invalidThreadId = "invalidThreadId";

    jest.spyOn(ThreadService, 'getThreadtitle').mockImplementation(() => {
        throw new Error("Invalid thread ID");
    });

    const response = await request.get(`/api/thread/find/${invalidThreadId}`);

    expect(response.status).toBe(405);
});

// ---------------------------------------------------------- POST Tests --------------------------------------------------------------

test("Thread POST, positive test with authentication", async () => {
    const request = supertest(app);
    const response = await request.post("/api/thread")
        .set("Authorization", `Bearer ${token}`)
        .send({ title: "Caytlins Store", creator: idJinx, subForum: "computer science", numPosts: 3 });

    expect(response.status).toBe(201);
});

test("Thread POST, with content and numPosts equals 1", async () => {
    const request = supertest(app);
    const response = await request.post('/api/thread')
        .set('Authorization', `Bearer ${token}`)
        .send({
            title: 'New Thread',
            creator: idJinx,
            subForum: 'computer science',
            numPosts: 1,
            content: 'This is a test content for the thread.',
            pages: []
        } as ThreadResource);

    expect(response.status).toBe(201);

    const createdThread = response.body as IThread;
    expect(createdThread).toBeDefined();
});

test("Thread POST, negative test", async () => {
    const request = supertest(app);
    const response = await request.post("/api/thread").send({ title: "Caytlins Store", creator: idJinx, subForum: "computer science", numPosts: 3 });

    expect(response.status).toBe(401);
});

test("Thread POST, negative test with invalid request body", async () => {
    const request = supertest(app);
    const response = await request.post(`/api/thread`).set("Authorization", `Bearer ${token}`).send({});

    expect(response.status).toBe(400);
});

test("Thread POST, negative test with authentication", async () => {
    const thread: ThreadResource = { title: "Jinxs Store", creator: "idJinx", subForum: "computer science", numPosts: 3, pages: [postid, post2id] };
    const request = supertest(app);
    const response = await request.post("/api/thread").set("Authorization", `Bearer ${token}`).send(thread);

    expect(response.status).toBe(400);
});

// ---------------------------------------------------------- PUT Tests --------------------------------------------------------------

test("Thread PUT, positive test authentication", async () => {
    const request = supertest(app);
    const response = await request.put(`/api/thread/${threadId}`)
        .set("Authorization", `Bearer ${token}`)
        .send({ title: "Neuer Store", creator: idJinx, subForum: "sports", numPosts: 2 });

    expect(response.status).toBe(200);
    expect(response.body.title).toBe("Neuer Store");
});

test("Thread PUT, negative test", async () => {
    const request = supertest(app);
    const response = await request.put(`/api/thread/${threadId}`).send({ title: "Neuer Store", creator: idJinx, subForum: "sports", numPosts: 2 });

    expect(response.status).toBe(401);
});

test("Thread PUT, negative test with invalid ID", async () => {
    const request = supertest(app);
    const response = await request.put(`/api/thread/1678242`).set("Authorization", `Bearer ${token}`).send({});

    expect(response.status).toBe(400);
});

test("Thread PUT, negative test for not being the creator of the thread", async () => {
    const request = supertest(app);
    const response = await request.put(`/api/thread/${threadId}`)
        .set("Authorization", `Bearer ${token2}`)
        .send({ title: "Neuer Store", creator: idJinx, subForum: "sports", numPosts: 2 });

    expect(response.status).toBe(403);
    expect(response.body.message).toBe("You are not the Creator.");
});

test("Thread PUT, negative test 400", async () => {
    const request = supertest(app);
    const update: ThreadResource = ({ id: threadId, creator: idJinx, title: "Thread", subForum: "Testing", pages: [postid, post2id], numPosts: 2 })
    const response = await request.put(`/api/thread/${update}`).send(update).set("Authorization", `Bearer ${token}`);

    expect(response.statusCode).toBe(400);
});

test("Thread PUT, should handle non-existent thread ID in update request", async () => {
    const request = supertest(app);

    const nonExistentThread = {
        title: "Aquas Store",
        creator: idAqua!,
        subForum: "english",
        pages: [postid]
    };

    // Check if postID is a valid MongoDB ObjectId
    expect(ObjectId.isValid(threadId)).toBe(true);

    const response = await request.put(`/api/thread/${NON_EXISTING_ID}`).set("Authorization", `Bearer ${token}`).send(nonExistentThread);
    expect(response.status).toBe(400); // update Error
});

// ---------------------------------------------------------- DELETE Tests --------------------------------------------------------------

test("Thread DELETE, positive test authentication", async () => {
    const request = supertest(app);
    const response = await request.delete(`/api/thread/${threadId}`).set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(204);
});

test("Thread DELETE, negative test", async () => {
    const request = supertest(app);
    const response = await request.delete(`/api/thread/${threadId}`);

    expect(response.status).toBe(401);
});

test("Thread DELETE, negative test with invalid ID", async () => {
    const request = supertest(app);
    const response = await request.delete(`/api/thread/1234`).set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(400);
});

test("Thread DELETE, negative test with invalid ID 2", async () => {
    const request = supertest(app);
    const response = await request.delete(`/api/thread/${NON_EXISTING_ID}`).set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(404);
});

test("Thread DELETE, negative test for not being the creator of the thread", async () => {
    const request = supertest(app);
    const response = await request.delete(`/api/thread/${threadId}`).set("Authorization", `Bearer ${token2}`);

    expect(response.status).toBe(403);
    expect(response.body.message).toBe("You are not the Creator.");
});
