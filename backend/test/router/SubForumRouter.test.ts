import dotenv from "dotenv";
import { LoginResource, SubForumResource, UserResource } from "../../src/types/Resources";
import TestDB from "../TestDB";
import { User } from "../../src/endpoints/user/UserModel";
import { createUser } from "../../src/endpoints/user/UserService";
import supertest from "supertest";
import app from "../../src/testIndex";
import { Post } from "../../src/endpoints/post/PostModel";
import { ThreadPage } from "../../src/endpoints/threadpage/ThreadPageModel";
import { Thread } from "../../src/endpoints/thread/ThreadModel";
import { SubForum } from "../../src/endpoints/subforum/SubForumModel";
import mongoose, { Mongoose, Types } from "mongoose";

dotenv.config();
let token: string
let john: UserResource
let idjohn: string
let tokenB: string
let umut: UserResource
let idumut: string
let subForum: SubForumResource
const NON_EXISTING_ID = "635d2e796ea2e8c9bde5787c";

beforeAll(async () => { await TestDB.connect(); })
beforeEach(async () => {
    User.syncIndexes();
    john = await User.create({ name: "Johnathan", email: "johnathan@jonathan.de", password: "123asdf!ABCD", admin: true})
    idjohn = john.id!

    const request = supertest(app);
    const loginData = { email: "johnathan@jonathan.de", password: "123asdf!ABCD" };
    const response = await request.post(`/api/login`).send(loginData)
    const loginResource = response.body as LoginResource;
    token = loginResource.access_token;
    expect(token).toBeDefined();

    umut = await createUser({ name: "Umi", email: "umi@jonatahan.de", password: "123asdf!ABCDs", admin: false })
    idumut = umut.id!

    const post = await Post.create({
        content: "Test.",
        author: john.id,
        createdAt: new Date()
    });
    const post2 = await Post.create({
        content: "Test.",
        author: john.id,
        createdAt: new Date()
    });
    let postid = post.id
    let post2id = post2.id
    const threadpage = await ThreadPage.create({ postid, post2id })
    const thread = await Thread.create({
        creator: john.id!,
        title: "Thread",
        subForum: "Testing",
        pages: [threadpage.id!],
        numPosts: 2,
    });

    subForum = await SubForum.create({
        name: "Umut",
        threads: [thread.id]
    })

    const request2 = supertest(app);
    const loginData2 = { email: "umi@jonatahan.de", password: "123asdf!ABCDs" };
    const response2 = await request2.post(`/api/login`).send(loginData2)
    const loginResource2 = response2.body as LoginResource;
    tokenB = loginResource2.access_token;
    expect(tokenB).toBeDefined();
})
afterEach(async () => { await TestDB.clear(); })
afterAll(async () => {
    await TestDB.close()
})

test("Subforum GET, positive test", async () => {
    const request = supertest(app);
    const response = await request.get(`/api/subforum/${subForum.name}`)
    expect(response.statusCode).toBe(200);
    const postRes = response.body as SubForumResource;
    expect(postRes.name).toEqual(subForum.name);
});

test("Subforum GET, negative test ", async () => {
    const request = supertest(app);
    const response = await request.get(`/api/subforum/${subForum}`)
    expect(response.statusCode).toBe(400);
})

test("Subforum GET, negative test ", async () => {
    const request = supertest(app);
    const response = await request.get(`/api/subforum/${john}`)
    expect(response.statusCode).toBe(400);
})

test("Subforum GET, threads for a subforum with a limit", async () => {
    const request = supertest(app);
    const response = await request.get(`/api/subforum/${subForum.name}/threads`).set("Authorization", `Bearer ${token}`);
    
    expect(response.statusCode).toBe(200);
    const threads = response.body as typeof Thread[];    
    expect(Array.isArray(threads)).toBe(true);
});

// --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

test("Subforum POST,positive Test", async () => {
    const request = supertest(app);
    const newSubForum: SubForumResource = { name: "Neuer Umut", threads: []};
    const response = await request.post(`/api/subforum`).send(newSubForum).set("Authorization", `Bearer ${token}`);
    const subForumModel = await SubForum.findOne({ id: newSubForum.id }).exec();
    expect(subForumModel).toBeDefined();
    expect(response.statusCode).toBe(201);
});

test("Subforum POST, 403 error", async () => {
    const request = supertest(app);
    const newSubForum: SubForumResource = { name: "Neuer Umut", threads: []};
    const response = await request.post(`/api/subforum`).send(newSubForum).set("Authorization", `Bearer ${tokenB}`);
    expect(response.statusCode).toBe(403);
});

test("Subforum POST, negative test", async () => {
    const request = supertest(app);
    const response = await request.post(`/api/subforum/`).send(token).set("Authorization", `Bearer ${token}`);
    expect(response.statusCode).toBe(400);
})

test("Subforum PUT, positive test", async () => {
    const request = supertest(app);

    let subForum2 = await SubForum.create({
        name: "Umut der neue",
        threads: []
    })

    const newsubForum: SubForumResource = {
        id: subForum2.id,
        name: "Neuer Umut",
        description: "test",
        threads: []
    };
    const response = await request.put(`/api/subforum/${subForum2.name}`).send(newsubForum).set("Authorization", `Bearer ${token}`)
    expect(response.statusCode).toBe(200);
    const subForumResponse = response.body as SubForumResource;
    expect(subForumResponse).toBeDefined();
    expect(subForumResponse.name).toEqual("Neuer Umut");
    expect(subForumResponse.threads).toEqual([]);
});

test("Subforum PUT, 403 error", async () => {
    const request = supertest(app);

    let subForum2 = await SubForum.create({
        name: "Umut der neue",
        threads: []
    })

    const newsubForum: SubForumResource = {
        id: subForum2.id,
        name: "Neuer Umut",
        description: "test",
        threads: []
    };
    const response = await request.put(`/api/subforum/${subForum2.name}`).send(newsubForum).set("Authorization", `Bearer ${tokenB}`)
    expect(response.statusCode).toBe(403);
});

test("Subforum PUT, negative test", async () => {
    const request = supertest(app);
    const response = await request.put(`/api/subforum/${john}`).send(token).set("Authorization", `Bearer ${token}`);
    expect(response.statusCode).toBe(400);
})

test("Subforum PUT, negative test for service error", async () => {
    const request = supertest(app);
    const newsubForum: SubForumResource = {
        id: NON_EXISTING_ID,
        name: "Neuer Umut",
        description: "test",
        threads: []
    };
    const response = await request.put(`/api/subforum/${subForum.name}`).send(newsubForum).set("Authorization", `Bearer ${token}`);
    expect(response.statusCode).toBe(400);
})

test("Subforum DELETE, positive test", async () => {
    const request = supertest(app);
    const toBeDeletedSubForum = await SubForum.create ({
        id: subForum.id,
        name: "Neuer Umut",
        description: "test",
        threads: []
    });
    const response = await request
        .delete(`/api/subforum/${toBeDeletedSubForum.id}`)
        .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(204);
});

test("Subforum DELETE, 403 error", async () => {
    const request = supertest(app);
    const toBeDeletedSubForum = await SubForum.create ({
        id: subForum.id,
        name: "Neuer Umut",
        description: "test",
        threads: []
    });
    const response = await request
        .delete(`/api/subforum/${toBeDeletedSubForum.id}`)
        .set("Authorization", `Bearer ${tokenB}`);

    expect(response.status).toBe(403);
});

test("Subforum DELETE, negative test no authorization", async () => {
    const request = supertest(app);
    const toBeDeletedSubForum = await SubForum.create ({
        id: subForum.id,
        name: "Neuer Umut",
        description: "test",
        threads: []
    });
    const response = await request
        .delete(`/api/subforum/${toBeDeletedSubForum.id}`)

    expect(response.status).toBe(401);
});

test("Subforum DELETE, negative test fake id", async () => {
    const request = supertest(app);
    const response = await request
        .delete(`/api/subforum/${NON_EXISTING_ID}`)
        .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(400);
});

test("Subforum DELETE, negative test validation error", async () => {
    const request = supertest(app);
    const response = await request
        .delete(`/api/subforum/${token}`)
        .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(400);
});