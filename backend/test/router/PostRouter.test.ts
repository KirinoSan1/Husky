import dotenv from "dotenv";
dotenv.config();

import app from "../../src/testIndex";
import supertest from "supertest";
import TestDB from "../TestDB";
import { IUser, User } from "../../src/endpoints/user/UserModel";
import { LoginResource, PostResource } from "../../src/types/Resources";
import { createPost } from "../../src/endpoints/post/PostService";
import { Post } from "../../src/endpoints/post/PostModel";
import { ObjectId } from 'mongodb';

let userJinx: IUser = { name: "John", email: "john@some-host.de", password: "123asdf!ABCD", admin: false, verified: true, votedPosts: new Map() };
let idJinx: string;

let userAqua: IUser = { name: "Aqua", email: "aqua@some-host.de", password: "1234asdf!ABCD", admin: false, verified: true, votedPosts: new Map() };
let idAqua: string;

let post: PostResource;
let postID: string;

let token: string;
let token2: string;
const NON_EXISTING_ID = "635d2e796ea2e8c9bde5787c";

beforeAll(async () => { await TestDB.connect(); });
beforeEach(async () => {
    User.syncIndexes();
    const jinx = await User.create(userJinx);
    idJinx = jinx.id;

    const aqua = await User.create(userAqua);
    idAqua = aqua.id;

    post = await createPost({ content: "This is an Example.", author: idAqua, modified: "" });
    postID = post.id!;

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
});
afterEach(async () => { await TestDB.clear(); });
afterAll(async () => { await TestDB.close() });

// ---------------------------------------------------------- GET Tests --------------------------------------------------------------

test("Post GET, positive test", async () => {
    const request = supertest(app);
    const response = await request.get(`/api/post/${post.id}`).set("Authorization", `Bearer ${token}`);

    expect(response.statusCode).toBe(200);
    const postRes = response.body as PostResource;

    /**
     * It's the same but Received is a String.
     * Expected: 2023-11-18T23:41:52.449Z
     * Received: "2023-11-18T23:41:52.449Z"
     * expect(postRes.createdAt).toEqual(post.createdAt);
     */
    expect(new Date(postRes.createdAt!)).toEqual(post.createdAt!);
    expect(postRes.author).toEqual(post.author);
    expect(postRes.id).toEqual(post.id);
    expect(postRes.content).toEqual(post.content);
    expect(postRes.upvotes).toEqual(post.upvotes);
    expect(postRes.downvotes).toEqual(post.downvotes);
});

test("Post GET, negative test without Header", async () => {
    const request = supertest(app);
    const response = await request.get(`/api/post/${post.id}`);

    expect(response.statusCode).toBe(401);
});

test("Post GET, negative test without real post", async () => {
    const request = supertest(app);
    const response = await request.get(`/api/post/${NON_EXISTING_ID}`).set("Authorization", `Bearer ${token}`);

    expect(response.statusCode).toBe(400);
});

test("Post GET, negative test without MongoID", async () => {
    const request = supertest(app);
    const response = await request.get(`/api/post/fakepost`).set("Authorization", `Bearer ${token}`);

    expect(response.statusCode).toBe(400);
});

// ---------------------------------------------------------- POST Tests --------------------------------------------------------------

test("Post POST, positive test", async () => {
    const request = supertest(app);
    const newpost: PostResource = { content: "This is a brand new Example.", author: idAqua, modified: "" };
    const response = await request.post(`/api/post`).send(newpost).set("Authorization", `Bearer ${token2}`);
    const postModel = await Post.findById(response.body.id).exec();

    expect(postModel).toBeDefined();
    expect(response.statusCode).toBe(201);

    const postRes = response.body as PostResource;
    expect(postRes.content).toBe("This is a brand new Example.");
    expect(postRes.author).toBe(idAqua);
});

test("Post POST, negative test", async () => {
    const request = supertest(app);
    const newpost: PostResource = { content: "This is a brand new Example.", author: "", modified: "" };
    const response = await request.post(`/api/post`).send(newpost).set("Authorization", `Bearer ${token2}`);
    const postModel = await Post.findById(response.body.id).exec();

    expect(postModel).toBeDefined();
    expect(response.statusCode).toBe(400);
});

test("Post POST, negative test with validation error", async () => {
    const request = supertest(app);
    const newpost = { content: "This is a brand new Example." };
    const response = await request.post(`/api/post`).send(newpost).set("Authorization", `Bearer ${token2}`);
    const postModel = await Post.findById(response.body.id).exec();

    expect(postModel).toBeDefined();
    expect(response.statusCode).toBe(400);
});

// ---------------------------------------------------------- PUT Tests --------------------------------------------------------------

test("Post PUT, positive test", async () => {
    const request = supertest(app);
    const newpost: PostResource = { content: "Updated.", author: idAqua, downvotes: 2, upvotes: 1, modified: "" };

    // Check if postID is a valid MongoDB ObjectId
    expect(ObjectId.isValid(postID)).toBe(true);
    const response = await request.put(`/api/post/${postID}`).set("Authorization", `Bearer ${token2}`).send(newpost);

    expect(response.statusCode).toBe(200);
    const postresponse = response.body as PostResource;

    expect(postresponse).toBeDefined();
    expect(postresponse.author).toEqual(idAqua);
    expect(postresponse.content).toEqual("Updated.");
    expect(postresponse.downvotes).toEqual(2);
    expect(postresponse.upvotes).toEqual(1);
    expect(new Date(postresponse.createdAt!)).toEqual(post.createdAt);
});

test("Post PUT, should handle non-existent post ID in update request", async () => {
    const request = supertest(app);

    // Provide no content intentionally
    const nonExistentPost = { author: "new_author", upvotes: 5, downvotes: 2 };

    // Check if postID is a valid MongoDB ObjectId
    expect(ObjectId.isValid(postID)).toBe(true);
    const response = await request.put(`/api/post/${NON_EXISTING_ID}`).set("Authorization", `Bearer ${token2}`).send(nonExistentPost);

    expect(response.status).toBe(400); // Update Error
});

test("Post PUT, should handle missing post ID in update request with validation error", async () => {
    const request = supertest(app);
    const nonExistentPostID: PostResource = { content: "Updated content", author: "new_author", upvotes: 5, downvotes: 2, modified: "" };

    // Check if postID is a valid MongoDB ObjectId
    expect(ObjectId.isValid(postID)).toBe(true);
    const response = await request.put(`/api/post/${NON_EXISTING_ID}`).set("Authorization", `Bearer ${token2}`).send(nonExistentPostID);

    expect(response.status).toBe(400); // Validation error resource
});

// ---------------------------------------------------------- DELETE Tests --------------------------------------------------------------

test("Post DELETE, positive test", async () => {
    const request = supertest(app);
    const newPost = await Post.create({ author: idJinx, content: "New Post" });
    const response = await request.delete(`/api/post/${newPost.id}`).set("Authorization", `Bearer ${token2}`);

    expect(response.status).toBe(204);
});

test("Post DELETE, negative test with invalid ID", async () => {
    const request = supertest(app);
    const response = await request.delete(`/api/post/${NON_EXISTING_ID}`).set("Authorization", `Bearer ${token2}`);

    expect(response.status).toBe(400);
});

test("Post DELETE, negative test with invalid ID 2", async () => {
    const request = supertest(app);
    const response = await request.delete(`/api/post/notanid`).set("Authorization", `Bearer ${token2}`);

    expect(response.status).toBe(400);
});
