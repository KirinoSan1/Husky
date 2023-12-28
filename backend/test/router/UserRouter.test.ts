import dotenv from "dotenv";
dotenv.config();

import supertest from "supertest";
import TestDB from "../TestDB";
import mongoose from "mongoose";
import app from "../../src/testIndex";
import { User } from "../../src/endpoints/user/UserModel";
import * as createUserFunction from "../../src/endpoints/user/UserService";
import { createUser, getAllThreadsForUser } from "../../src/endpoints/user/UserService";
import { LoginResource, ThreadResource, UserResource } from "../../src/types/Resources";
import { IThread, Thread } from "../../src/endpoints/thread/ThreadModel";
import { Token } from "../../src/endpoints/TokenModel";

let userJohn: UserResource;
let userUmut: UserResource;
let userTest: UserResource;
let idjohn: string;
let idumut: string;

let threadId: string;
let token: string;
let tokenB: string;
let findByIdMock;
const NON_EXISTING_ID = "635d2e796ea2e8c9bde5787c";

beforeAll(async () => { await TestDB.connect(); });
beforeEach(async () => {
    User.syncIndexes();
    userJohn = await User.create({ name: "Johnathan", email: "johnathan@jonathan.de", password: "123asdf!ABCD", admin: true, verified: true });
    idjohn = userJohn.id!;

    // Login for token access
    const request = supertest(app);
    const loginData = { email: "johnathan@jonathan.de", password: "123asdf!ABCD" };
    const response = await request.post(`/api/login`).send(loginData);
    const loginResource = response.body as LoginResource;
    token = loginResource.access_token;
    expect(token).toBeDefined();

    userUmut = await User.create({ name: "Umi", email: "umi@jonatahan.de", password: "123asdf!ABCDs", admin: false, verified: true });
    idumut = userUmut.id!;

    const request2 = supertest(app);
    const loginData2 = { email: "umi@jonatahan.de", password: "123asdf!ABCDs" };
    const response2 = await request2.post(`/api/login`).send(loginData2);
    const loginResource2 = response2.body as LoginResource;
    tokenB = loginResource2.access_token;
    expect(tokenB).toBeDefined();
});
afterEach(async () => { await TestDB.clear(); });
afterAll(async () => { await TestDB.close() });

test("User login with invalid email length should throw an error", async () => {
    userTest = await User.create({ name: "Armin", email: "a@b.c", password: "123asdf!ABCD", admin: false, verified: true });    

    const request = supertest(app);
    const response = await request.post(`/api/login`).send({ email: userTest.email, password: "123asdf!ABCD" });

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('errors');
    // expect(response.body.errors[0].msg).toBe('email is not defined');
});

// ------------------------------------------------------------ GET tests -------------------------------------------------------------------

test("User GET, positive test", async () => {
    const request = supertest(app);
    const response = await request.get(`/api/user/${userJohn.id}`).send(userJohn).set("Authorization", `Bearer ${token}`);
    expect(response.statusCode).toBe(200);

    const usersRes: UserResource = response.body as UserResource;
    expect(usersRes.id).toBe(userJohn.id);
    expect(usersRes.name).toBe(userJohn.name);
    expect(usersRes.email).toBe(userJohn.email);
});

test("User GET, negative test", async () => {
    const request = supertest(app);
    const response = await request.get(`/api/user/test`).set("Authorization", `Bearer ${tokenB}`);

    expect(response.statusCode).toBe(400);
});

test("User GET, negative test with invalid ID", async () => {
    const request = supertest(app);
    const response = await request.get(`/api/user/${new mongoose.Types.ObjectId}`).set("Authorization", `Bearer ${tokenB}`);
    expect(response.statusCode).toBe(400);
});

test("User GET, negative test with code 404", async () => {
    const request = supertest(app);
    const response = await request.get(`/api/`);

    expect(response.statusCode).toBe(404);
});

test("User GET avatar, with defined avatar", async () => {
    const request = supertest(app);
    const response = await request.get(`/api/user/${idjohn}/avatar`);

    expect(response.status).toBe(200);
});

test("User GET avatar, negative test validation", async () => {
    const request = supertest(app);
    const response = await request.get(`/api/user/invalidMongoId/avatar`);

    expect(response.status).toBe(400);
});

test("User GET avatar, negative test validation", async () => {
    const request = supertest(app);
    const response = await request.get(`/api/user/${new mongoose.Types.ObjectId}/avatar`);

    expect(response.status).toBe(400);
});

test("User GET verify token, should verify user successfully", async () => {
    const userToji = { name: "Toji", email: "toji@toji.de", password: "123asdf!ABCD", verified: false };

    const request = supertest(app);
    const response = await request.post("/api/user").send(userToji);
    expect(response.status).toBe(201);

    const user = await User.findOne({ email: userToji.email });
    const token = await Token.findOne({ userid: user!.id }).exec();
    const response2 = await request.get(`/api/user/${user!.id}/verify/${token}`);

    expect(response2.status).toBe(201);
    expect(response2.body.message).toBe("You have been successfully verified. You can log in now.");
});

test("User GET verify token, user without id", async () => {
    const request = supertest(app);
    const response = await request.get(`/api/user/invalidUser/verify/${token}`).set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(400); // Validation error
});

test("User GET verify token, invalid user", async () => {
    const request = supertest(app);
    const response = await request.get(`/api/user/${new mongoose.Types.ObjectId}/verify/${token}`).set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(400); // Invalid user
});

test("User GET verify token, invalid token", async () => {
    const request = supertest(app);
    const response = await request.get(`/api/user/${idjohn}/verify/${token}`).set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(400); // Invalid token
});

// test("User GET verify token, invalid user ID", async () => {
//     const userToji = { name: "Toji", email: "toji@toji.de", password: "123asdf!ABCD", verified: false };

//     const request = supertest(app);
//     const response = await request.post("/api/user").send(userToji);
//     expect(response.status).toBe(201);

//     const user = await User.findOne({ email: userToji.email }).exec();
//     const token = await Token.findOne({ userid: user!.id }).exec();

//     const request2 = supertest(app);
//     const response2 = await request2.get(`/api/user/${NON_EXISTING_ID}/verify/${token}`);
//     console.log(response2.body)

//     expect(response2.status).toBe(400); // Invalid user ID
// });

test("User GET verify token, negative test for catch-block", async () => {
    const userToji = { name: "Toji", email: "toji@toji.de", password: "123asdf!ABCD", verified: false };

    const request = supertest(app);
    const response = await request.post("/api/user").send(userToji);
    expect(response.status).toBe(201);

    const user = await User.findOne({ email: userToji.email });
    const token = await Token.findOne({ userid: user!.id }).exec();

    findByIdMock = jest.spyOn(User, "findById");
    findByIdMock.mockReturnValue({
        exec: jest.fn().mockRejectedValue(new Error("Failed to find user"))
    } as any);
    const request2 = supertest(app);
    const response2 = await request2.get(`/api/user/${user!.id}/verify/${token}`);

    expect(response2.status).toBe(400);
    findByIdMock.mockRestore();
});

// ------------------------------------------------------------ POST tests -------------------------------------------------------------------

test("User POST, positive test", async () => {
    const request = supertest(app);
    const userJane: UserResource = { name: "Jane", email: "jane@jana.de", password: "abHBJHBHB!!9324923!gikbfk???c", avatar: "somerandom.jpg", verified: true };
    const response = await request.post(`/api/user`).send(userJane).set("Authorization", `Bearer ${token}`);
    const searchedJane = await User.findOne({ email: "jane@jana.de" });

    expect(searchedJane).toBeDefined();
    expect(response.statusCode).toBe(201);
    expect(response.body.message).toBe("An Email has been sent to your account, please verify.");
});

test("User POST, negative test", async () => {
    const request = supertest(app);
    const response = await request.post(`/api/user`);

    expect(response.statusCode).toBe(400);
});

test("User POST negative test with not authenticated route", async () => {
    const request = supertest(app);
    const response = await request.post(`/api/user`).set("Authorization", `Bearer ${token}`);

    expect(response.statusCode).toBe(400);
});

test("User POST, negative test with searched user", async () => {
    const request = supertest(app);
    const userJane: UserResource = { name: "Jane", email: "johnathan@jonathan.de", password: "abHBJHBHB!!9324923!gikbfk???c", verified: true };
    const response = await request.post(`/api/user`).send(userJane).set("Authorization", `Bearer ${token}`);

    const searchedJane = await User.findOne({ email: "jane@jana.de" });
    expect(searchedJane).toBeDefined();

    expect(response.statusCode).toBe(409);
});

test("User POST, negative test for catch-block", async () => {
    findByIdMock = jest.spyOn(createUserFunction, "createUser");
    findByIdMock.mockRejectedValue(new Error("Failed to create user"));

    const request = supertest(app);
    const userPayload = { name: "TestUser", email: "test@example.com", password: "TestPassword123!" };
    const response = await request.post(`/api/user`).send(userPayload);

    expect(response.status).toBe(400);
    findByIdMock.mockRestore();
});

test("User POST/threads, returns threads for a user", async () => {
    const threadData: IThread = {
        title: "Test Thread",
        creator: new mongoose.Types.ObjectId(idjohn),
        subForum: "Testing Subforum",
        pages: [],
        createdAt: new Date()
    };
    const createdThread = await Thread.create(threadData);
    threadId = createdThread.id;
    let userThreads = await getAllThreadsForUser(idjohn);

    const request = supertest(app);
    const response = await request.post(`/api/user/${idjohn}/threads`).set("Authorization", `Bearer ${token}`);
    expect(response.statusCode).toBe(200);

    userThreads = response.body as (ThreadResource & { creatorName: string })[];
    expect(Array.isArray(userThreads)).toBe(true);
    expect(userThreads.length).toBe(1);

    const threadsCreatedByUser = userThreads.filter(thread => thread.creator.toString() === idjohn);
    expect(threadsCreatedByUser.length).toBeGreaterThan(0);
});

test("User POST/threads, count is not falsy", async () => {
    const newUser = await User.create({ name: "testUser45", email: "testUser45@some-host.de", password: "123asdf!ABCD", admin: false, verified: true });
    const countValue = 5; // Simulate a non-falsy count value

    // Create threads for the user
    for (let i = 0; i < countValue; i++) {
        const threadData: IThread = {
            title: `Thread ${i + 1}`,
            creator: newUser.id,
            subForum: "Testing Subforum",
            pages: [],
            createdAt: new Date()
        };
        await Thread.create(threadData);
    }
    const request = supertest(app);
    const response = await request.post(`/api/user/test/threads`).set("Authorization", `Bearer ${tokenB}`);
    expect(response.statusCode).toBe(400);
});

test("User POST/threads, negative test", async () => {
    const request = supertest(app);
    const response = await request.post(`/api/user/test/threads`).set("Authorization", `Bearer ${tokenB}`);

    expect(response.statusCode).toBe(400);
});

test("User POST/threads, negative test with invalid ID", async () => {
    const request = supertest(app);
    const response = await request.post(`/api/user/${new mongoose.Types.ObjectId}/threads`).set("Authorization", `Bearer ${tokenB}`);

    expect(response.statusCode).toBe(400);
});

// ------------------------------------------------------------ PUT tests -------------------------------------------------------------------

test("User PUT, positive test", async () => {
    const request = supertest(app);
    const update: UserResource = {
        id: userJohn.id, name: "Jane", email: "jane@jana.de", admin: true, password: "hdsbfhHH!!68723472", mod: false,
        avatar: "newAvatar.jpg", verified: true
    };
    const response = await request.put(`/api/user/${update.id}`).send(update).set("Authorization", `Bearer ${token}`);

    expect(response.statusCode).toBe(200);

    const updateRes = response.body as UserResource;
    expect(updateRes).toEqual({ ...update, password: updateRes.password, mod: updateRes.mod, avatar: updateRes.avatar, verified: updateRes.verified });
});

test("User PUT, negative test for duplicate user", async () => {
    const request = supertest(app);
    const updatedUser: UserResource = ({ id: userUmut.id, name: "Test", email: "johnathan@jonathan.de", admin: true, password: "hdsbfhHH!!68723472", mod: false, verified: true });
    const response = await request.put(`/api/user/${userUmut.id}`).send(updatedUser).set("Authorization", `Bearer ${token}`);

    expect(response.statusCode).toBe(400); // Validation-Error
});

test("User PUT, negative test for catch-block", async () => {
    const update: UserResource = {
        id: NON_EXISTING_ID, name: "Geto", email: "geto@geto.de", password: "123asdf!ABCD", admin: false, mod: false, avatar: "newAvatar.jpg", verified: true
    };
    const request = supertest(app);
    const response = await request.put(`/api/user/${update.id}`).send(update).set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(400); // Catch-Error
});

test("User PUT Avatar, positive test", async () => {
    const updatedUserData = {
        id: userJohn.id,
        name: "Nobara",
        email: "nobara@nobara.de",
        data: {
            avatar: "newAvatar.jpg"
        }
    };
    const request = supertest(app);
    const response = await request.put(`/api/user/image/${updatedUserData.id}`).send(updatedUserData).set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(200);
});

test("User PUT Avatar, negative test", async () => {
    const updatedUserData = {
        id: userJohn.id,
        name: "Nobara",
        email: "nobara@nobara.de",
        data: {
            avatar: "newAvatar.jpg"
        }
    };
    const request = supertest(app);
    const response = await request.put(`/api/user/image/${NON_EXISTING_ID}`).send(updatedUserData).set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(400);
});

// -------------------------------------------------------- DELETE tests -------------------------------------------------------------------

test("User DELETE, positive test", async () => {
    const request = supertest(app);
    let newUser = await createUser({ name: "polat", email: "ragnaroek@jana.de", password: "123", admin: false, verified: true });
    const response = await request.delete(`/api/user/${newUser.id}`).set("Authorization", `Bearer ${token}`);

    expect(response.statusCode).toBe(204);
});

test("User DELETE, negative test with invalid ID", async () => {
    const request = supertest(app);
    const response = await request.delete(`/api/user/${NON_EXISTING_ID}`).set("Authorization", `Bearer ${token}`);

    expect(response.statusCode).toBe(400);
});

test("User DELETE, negative test with code 400", async () => {
    const request = supertest(app);
    const response = await request.delete(`/api/user/abc`).set("Authorization", `Bearer ${token}`);

    expect(response.statusCode).toBe(400);
});
