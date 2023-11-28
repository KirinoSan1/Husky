import dotenv from "dotenv";
dotenv.config();

import app from "../../src/testIndex";
import supertest from 'supertest';
import TestDB from "../TestDB";
import { IUser, User } from "../../src/endpoints/user/UserModel";
import { createThread } from "../../src/endpoints/thread/ThreadService";
import { Post } from "../../src/endpoints/post/PostModel";
import { LoginResource, ThreadResource } from "../../src/types/Resources";
import { Thread } from "../../src/endpoints/thread/ThreadModel";
import { Types } from "mongoose";
import { ObjectId } from 'mongodb';

let jinxData: IUser = { name: "John", email: "john@some-host.de", password: "123asdf!ABCD", admin: false }
let idJinx: string

let aquaData: IUser = { name: "Aqua", email: "aqua@some-host.de", password: "1234asdf!ABCD", admin: false }
let idAqua: string

let threadId: string
let postid: Types.ObjectId
let post2id: Types.ObjectId

let token: string
let token2: string
const NON_EXISTING_ID = "635d2e796ea2e8c9bde5787c";

beforeAll(async () => { await TestDB.connect(); })
beforeEach(async () => {
    await User.syncIndexes()
    const jinx = await User.create(jinxData)
    idJinx = jinx.id;

    const aqua = await User.create(aquaData)
    idAqua = aqua.id;

    // Login for access to token
    const request = supertest(app);
    const loginData = { email: "john@some-host.de", password: "123asdf!ABCD" };
    const response = await request.post(`/api/login`).send(loginData);
    const loginResource = response.body as LoginResource;
    token = loginResource.access_token;
    expect(token).toBeDefined();

    // Login2 for access to token
    const request2 = supertest(app);
    const loginData2 = { email: "aqua@some-host.de", password: "1234asdf!ABCD" };
    const response2 = await request2.post(`/api/login`).send(loginData2);
    const loginResource2 = response2.body as LoginResource;
    token2 = loginResource2.access_token;
    expect(token2).toBeDefined();


    const post = await Post.create({
        content: "Test.",
        author: jinx.id,
        createdAt: new Date()
    });

    const post2 = await Post.create({
        content: "Test.",
        author: jinx.id,
        createdAt: new Date()
    });
    postid = post.id
    post2id = post2.id

    const thread = await Thread.create({
        creator: jinx._id,
        title: "Thread",
        subForum: "Testing",
        pages: [post.id, post2.id],
        numPosts: 2,
        createdAt: Date.now()
    });
    threadId = thread.id!;
})
afterEach(async () => { await TestDB.clear(); })
afterAll(async () => { await TestDB.close(); })

// ---------------------------------------------------------- GET Tests --------------------------------------------------------------

test("Thread GET, Positive Test", async () => {
    const request = supertest(app);
    const sth = await createThread({ title: "Jinxs Store", creator: idJinx!, subForum: "computer science", numPosts: 3, pages: [postid, post2id] });
    const response = await request.get(`/api/thread/${sth.id}`);
    expect(response.status).toBe(200);
    expect(response.body.title).toBe("Jinxs Store");
});

test("Thread GET, Positiv Test with Authentication", async () => {
    const request = supertest(app);
    const sth = await createThread({ title: "Jinxs Store", creator: idJinx!, subForum: "computer science", numPosts: 3, pages: [postid, post2id] });
    const response = await request.get(`/api/thread/${sth.id}`).set("Authorization", `Bearer ${token}`);
    expect(response.status).toBe(200);
    expect(response.body.title).toBe("Jinxs Store");
});

test("Thread GET, Negative test with invalid ID", async () => {
    const request = supertest(app);
    const response = await request.get(`/api/thread/1678242`).set("Authorization", `Bearer ${token}`);
    expect(response.status).toBe(400);
});

test("Thread GET, Negative test with invalid ID 2", async () => {
    const request = supertest(app);
    const response = await request.get(`/api/thread/abc`).set("Authorization", `Bearer ${token}`);
    expect(response.status).toBe(400);
});

test("Thread GET, Negative test with invalid ID 3", async () => {
    const request = supertest(app);
    const response = await request.get(`/api/thread/${NON_EXISTING_ID}`).set("Authorization", `Bearer ${token}`);
    expect(response.status).toBe(404);
});

test("Thread GET negative test for 404", async () => {
    const request = supertest(app);
    const response = await request.get(`/api/`);
    expect(response.statusCode).toBe(404);
});

// ---------------------------------------------------------- POST Tests --------------------------------------------------------------

test("Thread POST, Positive Test with Authentication", async () => {
    const request = supertest(app);
    const response = await request.post("/api/thread").set("Authorization", `Bearer ${token}`).send({ title: "Caytlins Store", creator: idJinx, subForum: "computer science", numPosts: 3 });
    expect(response.status).toBe(201);
});

test("Thread POST, Negative Test", async () => {
    const request = supertest(app);
    const response = await request.post("/api/thread").send({ title: "Caytlins Store", creator: idJinx, subForum: "computer science", numPosts: 3 });
    expect(response.status).toBe(401);
});

test("Thread POST, Negative Test with invalid Request Body", async () => {
    const request = supertest(app);
    const response = await request.post(`/api/thread`).set("Authorization", `Bearer ${token}`).send({});
    expect(response.status).toBe(400);
});

test("Thread POST, Negative Test with Authentication", async () => {
    const thread: ThreadResource = { title: "Jinxs Store", creator: "idJinx", subForum: "computer science", numPosts: 3, pages: [postid, post2id] };
    const request = supertest(app);
    const response = await request.post("/api/thread").set("Authorization", `Bearer ${token}`).send(thread);
    expect(response.status).toBe(400);
});

// ---------------------------------------------------------- PUT Tests --------------------------------------------------------------

test("Thread PUT, Positive Test Authentication", async () => {
    const request = supertest(app);
    const response = await request.put(`/api/thread/${threadId}`).set("Authorization", `Bearer ${token}`).send({ title: "Neuer Store", creator: idJinx, subForum: "sports", numPosts: 2 });

    expect(response.status).toBe(200);
    expect(response.body.title).toBe("Neuer Store");
});

test("Thread PUT, Negative Test", async () => {
    const request = supertest(app);
    const response = await request.put(`/api/thread/${threadId}`).send({ title: "Neuer Store", creator: idJinx, subForum: "sports", numPosts: 2 });

    expect(response.status).toBe(401);
});

test("Thread PUT, Negative test with invalid ID", async () => {
    const request = supertest(app);
    const response = await request.put(`/api/thread/1678242`).set("Authorization", `Bearer ${token}`).send({});
    expect(response.status).toBe(400);
});

test("Thread PUT, Negative test for not Creator", async () => {
    const request = supertest(app);
    const response = await request.put(`/api/thread/${threadId}`).set("Authorization", `Bearer ${token2}`).send({ title: "Neuer Store", creator: idJinx, subForum: "sports", numPosts: 2 });
    expect(response.status).toBe(403);
    expect(response.body.message).toBe("You are not the Creator.");
});

test("Thread PUT, Negative test 400", async () => {
    const request = supertest(app);
    const update: ThreadResource = ({ id: threadId, creator: idJinx, title: "Thread", subForum: "Testing", pages: [postid, post2id], numPosts: 2 })
    const response = await request.put(`/api/thread/${update}`).send(update).set("Authorization", `Bearer ${token}`);

    expect(response.statusCode).toBe(400);
});

test("Thread PUT, should handle non-existent thread id in update request", async () => {
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

test("Thread DELETE, Positive Test Authentication", async () => {
    const request = supertest(app);
    const response = await request.delete(`/api/thread/${threadId}`).set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(204);
});

test("Thread DELETE, Negative Test", async () => {
    const request = supertest(app);
    const response = await request.delete(`/api/thread/${threadId}`);

    expect(response.status).toBe(401);
});

test("Thread DELETE, Negative test with invalid ID", async () => {
    const request = supertest(app);
    const response = await request.delete(`/api/thread/1234`).set("Authorization", `Bearer ${token}`);
    expect(response.status).toBe(400);
});

test("Thread DELETE, Negative test with invalid ID 2", async () => {
    const request = supertest(app);
    const response = await request.delete(`/api/thread/${NON_EXISTING_ID}`).set("Authorization", `Bearer ${token}`);
    expect(response.status).toBe(404);
});

test("Thread DELETE, Negative test for not Creator", async () => {
    const request = supertest(app);
    const response = await request.delete(`/api/thread/${threadId}`).set("Authorization", `Bearer ${token2}`);
    expect(response.status).toBe(403);
    expect(response.body.message).toBe("You are not the Creator.");
});