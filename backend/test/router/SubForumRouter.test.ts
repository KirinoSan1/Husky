import dotenv from "dotenv";
dotenv.config();

import supertest from "supertest";
import app from "../../src/testIndex";
import TestDB from "../TestDB";
import mongoose from "mongoose";
import * as threadService from "../../src/endpoints/subforum/SubForumService"
import { LoginResource, SubForumResource, ThreadResource, UserResource } from "../../src/types/Resources";
import { User } from "../../src/endpoints/user/UserModel";
import { Post } from "../../src/endpoints/post/PostModel";
import { ThreadPage } from "../../src/endpoints/threadpage/ThreadPageModel";
import { IThread, Thread } from "../../src/endpoints/thread/ThreadModel";
import { SubForum } from "../../src/endpoints/subforum/SubForumModel";

let userJohn: UserResource;
let userUmut: UserResource;
let idjohn: string;
let idumut: string;

let subForum: SubForumResource;

let token: string;
let tokenB: string;
const NON_EXISTING_ID = "635d2e796ea2e8c9bde5787c";

beforeAll(async () => { await TestDB.connect(); });
beforeEach(async () => {
    User.syncIndexes();
    userJohn = await User.create({ name: "Johnathan", email: "johnathan@jonathan.de", password: "123asdf!ABCD", admin: true, verified: true });
    idjohn = userJohn.id!

    userUmut = await User.create({ name: "Umi", email: "umi@jonatahan.de", password: "123asdf!ABCDs", admin: false, verified: true });
    idumut = userUmut.id!;

    // Login for token access
    const request = supertest(app);
    const loginData = { email: "johnathan@jonathan.de", password: "123asdf!ABCD" };
    const response = await request.post(`/api/login`).send(loginData);
    const loginResource = response.body as LoginResource;
    token = loginResource.access_token;
    expect(token).toBeDefined();

    const request2 = supertest(app);
    const loginData2 = { email: "umi@jonatahan.de", password: "123asdf!ABCDs" };
    const response2 = await request2.post(`/api/login`).send(loginData2);
    const loginResource2 = response2.body as LoginResource;
    tokenB = loginResource2.access_token;
    expect(tokenB).toBeDefined();

    const post = await Post.create({ content: "Test.", author: userJohn.id, createdAt: new Date() });
    const post2 = await Post.create({ content: "Test.", author: userJohn.id, createdAt: new Date() });
    let postid = post.id;
    let post2id = post2.id;

    const threadpage = await ThreadPage.create({ postid, post2id });
    const thread = await Thread.create({
        creator: userJohn.id!,
        title: "Thread",
        subForum: "Testing",
        pages: [threadpage.id!],
        numPosts: 2
    });
    subForum = await SubForum.create({ name: "Umut", threads: [thread.id] });
});
afterEach(async () => { await TestDB.clear(); })
afterAll(async () => { await TestDB.close() });

// ---------------------------------------------------------- GET Tests --------------------------------------------------------------

test("Subforum GET, positive test", async () => {
    const request = supertest(app);
    const response = await request.get(`/api/subforum/${subForum.name}`);

    expect(response.statusCode).toBe(200);
    const postRes = response.body as SubForumResource;

    expect(postRes.name).toEqual(subForum.name);
});

test("Subforum GET, negative test for service error", async () => {
    const request = supertest(app);
    const newsubForum: SubForumResource = { id: NON_EXISTING_ID, name: mongoose.Types.ObjectId.toString(), description: "test", threads: [] };
    const response = await request.get(`/api/subforum/${newsubForum.name}`).send(newsubForum).set("Authorization", `Bearer ${token}`);

    expect(response.statusCode).toBe(400);
});

test("Subforum GET, negative test", async () => {
    const request = supertest(app);
    const response = await request.get(`/api/subforum/${subForum}`)
    expect(response.statusCode).toBe(400);
});

test("Subforum GET, negative test 2", async () => {
    const invalidName = new mongoose.Types.ObjectId;
    const request = supertest(app);
    const response = await request.get(`/api/subforum/${invalidName}`);

    expect(response.statusCode).toBe(400);
});

test("Subforum GET all subforums, positive test", async () => {
    const request = supertest(app);
    const response = await request.get(`/api/subforum`);

    expect(response.statusCode).toBe(200);
    const subForums = response.body;

    expect(Array.isArray(subForums)).toBe(true);
});

test("Subforum GET all subforums, negative test", async () => {
    const request = supertest(app);
    jest.spyOn(threadService, "getAllSubForums").mockImplementationOnce(() => {
        throw new Error("Simulated error in getAllSubForums");
    });
    const response = await request.get(`/api/subforum`);

    expect(response.statusCode).toBe(400);
});

// ---------------------------------------------------------- POST Tests --------------------------------------------------------------

test("Subforum POST, positive Test", async () => {
    const request = supertest(app);
    const newSubForum: SubForumResource = { name: "Neuer Umut", threads: [] };
    const response = await request.post(`/api/subforum`).send(newSubForum).set("Authorization", `Bearer ${token}`);
    const subForumModel = await SubForum.findOne({ id: newSubForum.id }).exec();

    expect(subForumModel).toBeDefined();
    expect(response.statusCode).toBe(201);
});

test("Subforum POST, negative test with code 403", async () => {
    const request = supertest(app);
    const newSubForum: SubForumResource = { name: "Neuer Umut", threads: [] };
    const response = await request.post(`/api/subforum`).send(newSubForum).set("Authorization", `Bearer ${tokenB}`);

    expect(response.statusCode).toBe(403);
});

test("Subforum POST, negative test with false path", async () => {
    const request = supertest(app);
    const response = await request.post(`/api/subforum/`).send(token).set("Authorization", `Bearer ${token}`);

    expect(response.statusCode).toBe(400);
});

test("Subforum POST, negative test with false path 2", async () => {
    jest.spyOn(SubForum, 'create').mockImplementationOnce(() => {
        throw new Error('Subforum creation failed');
    });
    const response = await supertest(app).post('/api/subforum').set('Authorization', `Bearer ${token}`).send({ name: 'New Subforum' });

    expect(response.statusCode).toBe(400);
});

test("Subforum POST threads, positive test", async () => {
    const request = supertest(app);
    const subForumNames = [subForum.name];
    const threadCount = 5;

    const response = await request.post(`/api/subforum/threads`).send({ subForumNames, threadCount });

    expect(response.statusCode).toBe(200);
    const threads = response.body as ThreadResource[];

    expect(Array.isArray(threads)).toBe(true);
    expect(threads.length).toBeLessThanOrEqual(threadCount);
});

test("Subforum POST threads, return threads for a subforum with a limit", async () => {
    const request = supertest(app);
    const response = await request.post(`/api/subforum/${subForum.name}/threads`).set("Authorization", `Bearer ${token}`);

    expect(response.statusCode).toBe(200);
    const threads = response.body as typeof Thread[];

    expect(Array.isArray(threads)).toBe(true);
});

test("Subforum POST threads, count is not falsy", async () => {
    const newUser = await User.create({ name: "testUser45", email: "testUser45@some-host.de", password: "123asdf!ABCD", admin: false, verified: true });
    const testingSubforum = await SubForum.create({ name: 'Testing Subforum' });
    const countValue = 5; // Simulate a non-falsy count value

    // Create threads for the user
    for (let i = 0; i < countValue; i++) {
        const threadData: IThread = {
            title: `Thread ${i + 1}`,
            creator: newUser.id,
            subForum: testingSubforum.id,
            pages: [],
            createdAt: new Date()
        };
        await Thread.create(threadData);
    }
    const request = supertest(app);
    const response = await request.post(`/api/subforum/${testingSubforum.name}/threads?count=${countValue}`).set("Authorization", `Bearer ${token}`);

    expect(response.statusCode).toBe(200);

    const subForumThreads = response.body;
    expect(Array.isArray(subForumThreads)).toBe(true);
});

test("Subforum POST threads, negative test with invalid path", async () => {
    const request = supertest(app);
    const response = await request.post(`/api/subforum/test/threads`).set("Authorization", `Bearer ${tokenB}`);

    expect(response.statusCode).toBe(400);
});

test("Subforum POST threads, negative test with invalid ID", async () => {
    const request = supertest(app);
    const response = await request.post(`/api/subforum/${new mongoose.Types.ObjectId}/threads`).set("Authorization", `Bearer ${tokenB}`);

    expect(response.statusCode).toBe(400);
});

test("Subforum POST threads, threadCount and subForumCount are invalid", async () => {
    const request = supertest(app);
    const response = await request.post('/api/subforum/threads').send({ threadCount: 'invalid', subForumCount: 'invalid' });

    expect(response.status).toBe(400);
    expect(response.body.errors).toBeDefined();
    expect(response.body.errors.length).toBeGreaterThan(0);
});

test("Subforum POST threads, catch error", async () => {
    jest.spyOn(threadService, 'getLatestThreadsFromSubForums').mockImplementationOnce(() => {
        throw new Error("Simulated error in getLatestThreadsFromSubForums");
    });
    const request = supertest(app);
    const response = await request.post('/api/subforum/threads').send({ threadCount: 5, subForumCount: 10 });

    expect(response.status).toBe(400);
});

test("Subforum POST threads, threadCount is undefined", async () => {
    const request = supertest(app);
    const response = await request.post('/api/subforum/threads').send({ threadCount: undefined });

    expect(response.status).toBe(200);
});

// ---------------------------------------------------------- PUT Tests --------------------------------------------------------------

test("Subforum PUT, positive test", async () => {
    const request = supertest(app);
    let createdSubForum = await SubForum.create({ name: "Umut der neue", threads: [] });

    const newsubForum: SubForumResource = { id: createdSubForum.id, name: "Neuer Umut", description: "test", threads: [] };
    const response = await request.put(`/api/subforum/${createdSubForum.name}`).send(newsubForum).set("Authorization", `Bearer ${token}`);

    expect(response.statusCode).toBe(200);
    const subForumResponse = response.body as SubForumResource;

    expect(subForumResponse).toBeDefined();
    expect(subForumResponse.name).toEqual("Neuer Umut");
    expect(subForumResponse.threads).toEqual([]);
});

test("Subforum PUT, negative test with code 403", async () => {
    const request = supertest(app);
    let createdSubForum = await SubForum.create({ name: "Umut der neue", threads: [] });

    const newsubForum: SubForumResource = { id: createdSubForum.id, name: "Neuer Umut", description: "test", threads: [] };
    const response = await request.put(`/api/subforum/${createdSubForum.name}`).send(newsubForum).set("Authorization", `Bearer ${tokenB}`);

    expect(response.statusCode).toBe(403);
});

test("Subforum PUT, negative test with false path", async () => {
    const request = supertest(app);
    const response = await request.put(`/api/subforum/abc`).send(token).set("Authorization", `Bearer ${token}`);

    expect(response.statusCode).toBe(400);
});

test("Subforum PUT, negative test for service error", async () => {
    const request = supertest(app);
    const newsubForum: SubForumResource = { id: NON_EXISTING_ID, name: "Neuer Umut", description: "test", threads: [] };
    const response = await request.put(`/api/subforum/${subForum.name}`).send(newsubForum).set("Authorization", `Bearer ${token}`);

    expect(response.statusCode).toBe(400);
});

// ---------------------------------------------------------- DELETE Tests --------------------------------------------------------------

test("Subforum DELETE, positive test", async () => {
    const request = supertest(app);
    const toBeDeletedSubForum = await SubForum.create({ id: subForum.id, name: "Neuer Umut", description: "test", threads: [] });
    const response = await request.delete(`/api/subforum/${toBeDeletedSubForum.id}`).set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(204);
});

test("Subforum DELETE, negative test with code 403", async () => {
    const request = supertest(app);
    const toBeDeletedSubForum = await SubForum.create({ id: subForum.id, name: "Neuer Umut", description: "test", threads: [] });
    const response = await request.delete(`/api/subforum/${toBeDeletedSubForum.id}`).set("Authorization", `Bearer ${tokenB}`);

    expect(response.status).toBe(403);
});

test("Subforum DELETE, negative test without authorization", async () => {
    const request = supertest(app);
    const toBeDeletedSubForum = await SubForum.create({ id: subForum.id, name: "Neuer Umut", description: "test", threads: [] });
    const response = await request.delete(`/api/subforum/${toBeDeletedSubForum.id}`);

    expect(response.status).toBe(401);
});

test("Subforum DELETE, negative test with invalid ID", async () => {
    const request = supertest(app);
    const response = await request.delete(`/api/subforum/${NON_EXISTING_ID}`).set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(400);
});

test("Subforum DELETE, negative test with validation error", async () => {
    const request = supertest(app);
    const response = await request.delete(`/api/subforum/${token}`).set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(400);
});
