import dotenv from "dotenv";
import { LoginResource, PostResource, ThreadPageResource, UserResource } from "../../src/types/Resources";
import TestDB from "../TestDB";
import { User } from "../../src/endpoints/user/UserModel";
import { createUser } from "../../src/endpoints/user/UserService";
import supertest from "supertest";
import app from "../../src/testIndex";
import mongoose from "mongoose";
import { createThreadPage } from "../../src/endpoints/threadpage/ThreadPageService";
import { Post } from "../../src/endpoints/post/PostModel";
import { ThreadPage } from "../../src/endpoints/threadpage/ThreadPageModel";

dotenv.config();
let token: string
let john: UserResource
let idjohn: string

let tokenB: string
let umut: UserResource
let idumut: string

let threadPage: ThreadPageResource
let threadPageID: string

let postID: string

beforeAll(async () => { await TestDB.connect(); })
beforeEach(async () => {
    // create a use and login
    User.syncIndexes();
    john = await createUser({ name: "Johnathan", email: "johnathan@jonathan.de", password: "123asdf!ABCD", admin: true })
    idjohn = john.id!

    // Login um Token zu erhalten
    const request = supertest(app);
    const loginData = { email: "johnathan@jonathan.de", password: "123asdf!ABCD" };
    const response = await request.post(`/api/login`).send(loginData)
    const loginResource = response.body as LoginResource;
    token = loginResource.access_token;
    expect(token).toBeDefined();

    umut = await createUser({ name: "Umi", email: "umi@jonatahan.de", password: "123asdf!ABCDs", admin: false })
    idumut = umut.id!

    let post = await Post.create({
        content: "This is an Example.",
        author: idumut
    })
    postID = post.id!;

    threadPage = await createThreadPage({
        id: idumut,
        posts: [post]
    })
    threadPageID = threadPage.id!;

    // Login um Token zu erhalten
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
//GET tests
test("ThreadPage GET, positive test", async () => {
    const request = supertest(app);
    const response = await request.get(`/api/threadpage/${threadPageID}`).send(john);
    expect(response.statusCode).toBe(200);

    const usersRes = response.body as ThreadPageResource;
    expect(usersRes.posts[0].content).toEqual(threadPage.posts[0].content);
}, 10000);

test("ThreadPage GET, negative test", async () => {
    const request = supertest(app);
    const response = await request.get(`/api/threadpage/test`);
    expect(response.statusCode).toBe(400);
}, 10000);

test("ThreadPage GET, negative test", async () => {
    const request = supertest(app);
    const response = await request.get(`/api/threadpage/${new mongoose.Types.ObjectId}`);
    expect(response.statusCode).toBe(400);
}, 10000);

//POST tests
test("ThreadPage POST,positive Test", async () => {
    const request = supertest(app);
    const newThreadPage: ThreadPageResource = { posts: threadPage.posts };
    const response = await request.post(`/api/threadpage`).send(newThreadPage).set("Authorization", `Bearer ${token}`);
    const searchedThreadPage = await ThreadPage.findOne({ id: threadPageID }).exec();
    expect(searchedThreadPage).toBeDefined();
    expect(response.statusCode).toBe(201);
});

/**
 * Frage für das nächste Team meeting: createThreadPage wirft keine Fehler, wie kann man den catch im router testen?
 */
test("ThreadPage POST, negative Test validation 400", async () => {
    const request = supertest(app);
    const newThreadPage = "test"
    const response = await request.post(`/api/threadpage`).send(newThreadPage).set("Authorization", `Bearer ${token}`);
    expect(response.statusCode).toBe(400);
});

//PUT tests
test("ThreadPage PUT, positive test", async () => {
    const request = supertest(app);
    const newThreadPage: ThreadPageResource = { posts: threadPage.posts };
    const response = await request.put(`/api/threadpage/${threadPageID}`).send(newThreadPage).set("Authorization", `Bearer ${token}`);
    expect(response.statusCode).toBe(200);
    const tPresponse = response.body as ThreadPageResource;
    expect(tPresponse.posts[0].content).toStrictEqual(threadPage.posts[0].content);
});

test("ThreadPage PUT, positive test", async () => {
    const request = supertest(app);
    const newThreadPage: ThreadPageResource = { posts: [] };
    const response = await request.put(`/api/threadpage/${threadPageID}`).send(newThreadPage).set("Authorization", `Bearer ${token}`);
    expect(response.statusCode).toBe(400);
});

test("ThreadPage PUT, negative Test validation 400", async () => {
    const request = supertest(app);
    const newThreadPage: ThreadPageResource = { posts: [] };
    const response = await request.put(`/api/threadpage/test`).send(newThreadPage).set("Authorization", `Bearer ${token}`);
    expect(response.statusCode).toBe(400);
});

test("ThreadPage PUT, negative Test service error", async () => {
    const request = supertest(app);
    const newThreadPage: ThreadPageResource = { posts: threadPage.posts};
    const fakeID = new mongoose.Types.ObjectId();
    const response = await request.put(`/api/threadpage/${fakeID.toString()}`).send(newThreadPage).set("Authorization", `Bearer ${token}`);
    expect(response.statusCode).toBe(400);
});

//DELETE tests
test("ThreadPage DELETE, positive test", async () => {
    const request = supertest(app);

    //create Posts
    const posta = await Post.create({
        content: "Test.",
        author: john.id,
        createdAt: new Date()
    });

    const postb = await Post.create({
        content: "Test2.",
        author: john.id,
        createdAt: new Date()
    });

    //create ThreadPage
    const threadPage = await ThreadPage.create({
        posts: [posta, postb],
        createdAt: new Date()
    });
    const response = await request.delete(`/api/threadpage/${threadPage.id}`).set("Authorization", `Bearer ${token}`);
    expect(response.status).toBe(204);
});

test("ThreadPage DELETE, validation error", async () => {
    const request = supertest(app);

    //create ThreadPage
    const threadPage = await ThreadPage.create({
        posts: [],
        createdAt: new Date()
    });
    const response = await request.delete(`/api/threadpage/test`).set("Authorization", `Bearer ${token}`);
    expect(response.status).toBe(400);
});

test("ThreadPage DELETE, service error (fake id)", async () => {
    const request = supertest(app);

    //create ThreadPage
    const fakeID = new mongoose.Types.ObjectId();
    const response = await request.delete(`/api/threadpage/${fakeID.toString()}`).set("Authorization", `Bearer ${token}`);
    expect(response.status).toBe(400);
});