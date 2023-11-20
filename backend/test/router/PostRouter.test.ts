import dotenv from "dotenv";
import { User } from "../../src/endpoints/user/UserModel";
import { createUser } from "../../src/endpoints/user/UserService";
import app from "../../src/testIndex";
import supertest from "supertest";
import TestDB from "../TestDB";
import { LoginResource, PostResource, UserResource } from "../../src/types/Resources";
import { createPost } from "../../src/endpoints/post/PostService";
import { Post } from "../../src/endpoints/post/PostModel";
dotenv.config();
import { ObjectId } from 'mongodb';

let johntoken: string
let john: UserResource
let idjohn: string
let moetoken: string
let moe: UserResource
let idmoe: string
let post: PostResource
let postID: string
const NON_EXISTING_ID = "635d2e796ea2e8c9bde5787c";

beforeAll(async () => { await TestDB.connect(); })
beforeEach(async () => {
    // create a use and login
    User.syncIndexes();
    john = await createUser({ name: "Johnathan", email: "johnathan@jonathan.de", password: "123asdf!ABCD", admin: true })
    idjohn = john.id!
    moe = await createUser({ name: "Umi", email: "umi@jonatahan.de", password: "123asdf!ABCDs", admin: false })
    idmoe = moe.id!
    post = await createPost({
        content: "This is an Example.",
        author: idmoe
    })
    postID = post.id!;
    // Login um Token zu erhalten
    const request = supertest(app);
    const loginData = { email: "johnathan@jonathan.de", password: "123asdf!ABCD" };
    const response = await request.post(`/api/login`).send(loginData)
    const loginResource = response.body as LoginResource;
    johntoken = loginResource.access_token;
    expect(johntoken).toBeDefined();

    // Login um Token zu erhalten
    const request2 = supertest(app);
    const loginData2 = { email: "umi@jonatahan.de", password: "123asdf!ABCDs" };
    const response2 = await request2.post(`/api/login`).send(loginData2)
    const loginResource2 = response2.body as LoginResource;
    moetoken = loginResource2.access_token;
    expect(moetoken).toBeDefined();
})
afterEach(async () => { await TestDB.clear(); })
afterAll(async () => {
    await TestDB.close()
})

test("Post GET, positive test", async () => {
    const request = supertest(app);
    const response = await request.get(`/api/post/${post.id}`).set("Authorization", `Bearer ${johntoken}`);
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

test("Post GET, Negativ test, no Header.", async () => {
    const request = supertest(app);
    const response = await request.get(`/api/post/${post.id}`);
    expect(response.statusCode).toBe(401);
});

test("Post GET, Negativ test, no Real Post .", async () => {
    const request = supertest(app);
    const response = await request.get(`/api/post/${NON_EXISTING_ID}`).set("Authorization", `Bearer ${johntoken}`);
    expect(response.statusCode).toBe(400);
});

test("Post GET, Negativ test, no MongoID .", async () => {
    const request = supertest(app);
    const response = await request.get(`/api/post/fakepost`).set("Authorization", `Bearer ${johntoken}`);
    expect(response.statusCode).toBe(400);
});


test("Post POST,positive Test", async () => {
    const request = supertest(app);
    const newpost: PostResource = { content: "This is a brand Example.", author: idjohn };
    const response = await request.post(`/api/post`).send(newpost).set("Authorization", `Bearer ${moetoken}`);
    const postModel = await Post.findOne({ id: postID }).exec();
    expect(postModel).toBeDefined();
    expect(response.statusCode).toBe(201);
});


test("Post POST, positive Test", async () => {
    const request = supertest(app);
    const newpost: PostResource = { content: "This is a brand new  Example.", author: idmoe };
    const response = await request.post(`/api/post`).send(newpost).set("Authorization", `Bearer ${moetoken}`);
    const postModel = await Post.findById(response.body.id).exec();
    expect(postModel).toBeDefined();
    expect(response.statusCode).toBe(201);
    const postRes = response.body as PostResource;
    expect(postRes.content).toBe("This is a brand new  Example.");
    expect(postRes.author).toBe(idmoe);
});

test("Post POST, negative Test", async () => {
    const request = supertest(app);
    const newpost: PostResource = { content: "This is a brand new  Example.", author: "" };
    const response = await request.post(`/api/post`).send(newpost).set("Authorization", `Bearer ${moetoken}`);
    const postModel = await Post.findById(response.body.id).exec();
    expect(postModel).toBeDefined();
    expect(response.statusCode).toBe(400);
});


test("Post POST, negative Test, Validation Error", async () => {
    const request = supertest(app);
    const newpost = { content: "This is a brand new  Example." };
    const response = await request.post(`/api/post`).send(newpost).set("Authorization", `Bearer ${moetoken}`);
    const postModel = await Post.findById(response.body.id).exec();
    expect(postModel).toBeDefined();
    expect(response.statusCode).toBe(400);
});


test("post PUT, positive test", async () => {
    const request = supertest(app);

    const newpost: PostResource = {
        content: "Updated.",
        author: idmoe,
        downvotes: 2,
        upvotes: 1,
    };

    // Check if postID is a valid MongoDB ObjectId
    expect(ObjectId.isValid(postID)).toBe(true);

    const response = await request
        .put(`/api/post/${postID}`)
        .set("Authorization", `Bearer ${moetoken}`)
        .send(newpost);

    //status code to 200 for a successful update
    expect(response.statusCode).toBe(200);

    const postresponse = response.body as PostResource;
    expect(postresponse).toBeDefined();
    expect(postresponse.author).toEqual(idmoe);
    expect(postresponse.content).toEqual("Updated.");
    expect(postresponse.downvotes).toEqual(2);
    expect(postresponse.upvotes).toEqual(1);
    expect(new Date(postresponse.createdAt!)).toEqual(post.createdAt);
});


test("should handle non-existent post id in update request", async () => {
    const request = supertest(app);

    const nonExistentPost = {
       // content: "Updated content", Provide no content intentionally
        author: "new_author",
        upvotes: 5,
        downvotes: 2,
    };

    // Check if postID is a valid MongoDB ObjectId
    expect(ObjectId.isValid(postID)).toBe(true);

    const response = await request
        .put(`/api/post/${NON_EXISTING_ID}`)
        .set("Authorization", `Bearer ${moetoken}`)
        .send(nonExistentPost);

    expect(response.status).toBe(400); // update Error
});


test("should handle missing post id in update request, Validation Error", async () => {
    const request = supertest(app);

    const nonExistentPostID: PostResource = {
        content: "Updated content",
        author: "new_author",
        upvotes: 5,
        downvotes: 2,
    };

    // Check if postID is a valid MongoDB ObjectId
    expect(ObjectId.isValid(postID)).toBe(true);

    const response = await request
        .put(`/api/post/${NON_EXISTING_ID}`)
        .set("Authorization", `Bearer ${moetoken}`)
        .send(nonExistentPostID);

    expect(response.status).toBe(400); // Validation error resource
});



test("post DELETE, positive test", async () => {
    const request = supertest(app);
    const newP = await Post.create({
        author: idjohn,
        content: "New Post"
    })
    const response = await request
        .delete(`/api/post/${newP.id}`)
        .set("Authorization", `Bearer ${moetoken}`);

    expect(response.status).toBe(204);
});

test("post DELETE, positive test", async () => {
    const request = supertest(app);
    const newP = await Post.create({
        author: idjohn,
        content: "New Post"
    })
    const response = await request
        .delete(`/api/post/${newP.id}`)
        .set("Authorization", `Bearer ${moetoken}`);

    expect(response.status).toBe(204);
});

test("post DELETE, positive test", async () => {
    const request = supertest(app);
    const newP = await Post.create({
        author: idjohn,
        content: "New Post"
    })
    const response = await request
        .delete(`/api/post/${NON_EXISTING_ID}`)
        .set("Authorization", `Bearer ${moetoken}`);

    expect(response.status).toBe(400);
});

test("post DELETE, positive test", async () => {
    const request = supertest(app);
    const newP = await Post.create({
        author: idjohn,
        content: "New Post"
    })
    const response = await request
        .delete(`/api/post/notanid`)
        .set("Authorization", `Bearer ${moetoken}`);

    expect(response.status).toBe(400);
});