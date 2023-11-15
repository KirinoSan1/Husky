import dotenv from "dotenv";
import { User } from "../../src/endpoints/user/UserModel";
import { LoginResource, UserResource, UsersResource } from "../../src/Resources";
import { createUser } from "../../src/endpoints/user/UserService";
import app from "../../src/testIndex";
import supertest from "supertest";
import TestDB from "../TestDB";
import mongoose, { Types } from "mongoose";
dotenv.config();
let token: string
let john: UserResource
let idjohn: string

let tokenB: string
let umut: UserResource
let idumut: string
const NON_EXISTING_ID = "635d2e796ea2e8c9bde5787c";

beforeAll(async () => { await TestDB.connect(); })
beforeEach(async () => {
    // create a use and login
    User.syncIndexes();
    john = await createUser({ name: "Johnathan", email: "johnathan@jonathan.de", password: "123asdf!ABCD", admin: true })
    idjohn = john.id!

    // Login um Token zu erhalten
    const request = supertest(app);
    const loginData = { email: "johnathan@jonathan.de", password: "123asdf!ABCD"};
    const response = await request.post(`/api/login`).send(loginData).set("Authorization", `Bearer ${token}`);
    const loginResource = response.body as LoginResource;
    token = loginResource.access_token;
    expect(token).toBeDefined();

    umut = await createUser({ name: "Umi", email: "umi@jonatahan.de", password: "123asdf!ABCDs", admin: false })
    idumut = umut.id!

    // Login um Token zu erhalten
    const request2 = supertest(app);
    const loginData2 = { email: "umi@jonatahan.de", password: "123asdf!ABCDs"};
    const response2 = await request2.post(`/api/login`).send(loginData2).set("Authorization", `Bearer ${tokenB}`);
    const loginResource2 = response2.body as LoginResource;
    tokenB = loginResource2.access_token;
    expect(tokenB).toBeDefined();
})
afterEach(async () => { await TestDB.clear(); })
afterAll(async () => {
    await TestDB.close()
})

// Get tests getUsers needs to be modified!!!
test("users GET, positive test", async () => {
    const request = supertest(app);
    const response = await request.get(`/api/user/${john.id}`).send(john).set("Authorization", `Bearer ${token}`);;
    expect(response.statusCode).toBe(200);

    const usersRes = response.body as UsersResource;
    expect(usersRes).toEqual(john);
});

test("users GET, negative test", async () => {
    const request = supertest(app);
    const response = await request.get(`/api/user/test`).set("Authorization", `Bearer ${tokenB}`);;
    expect(response.statusCode).toBe(400);
});

test("users GET, negative test", async () => {
    const request = supertest(app);
    const response = await request.get(`/api/user/${new mongoose.Types.ObjectId}`).set("Authorization", `Bearer ${tokenB}`);;
    expect(response.statusCode).toBe(400);
});

test("users GET negative test for 404", async () => {
    const request = supertest(app);
    const response = await request.get(`/api/`);
    expect(response.statusCode).toBe(404);
});

//POST tests
test("user POST, positive test", async () => {
    const request = supertest(app);
    const jane: UserResource = { name: "Jane", email: "jane@jana.de", password: "abHBJHBHB!!9324923!gikbfk???c" };
    const response = await request.post(`/api/user`).send(jane).set("Authorization", `Bearer ${token}`);

    const janeModel = await User.findOne({ email: "jane@jana.de" });
    expect(janeModel).toBeDefined();

    expect(response.statusCode).toBe(201);
    const userRes = response.body as UserResource;
    const { password, ...expected } = { ...jane, id: janeModel!.id, mod: false, admin: false };
    expect(userRes).toEqual(expected);
});

test("users post negativ 400", async () => {
    const request = supertest(app);
    const response = await request.post(`/api/user`).set("Authorization", `Bearer ${token}`);
    expect(response.statusCode).toBe(400);
});

test("user POST, negative test 400 2", async () => {
    const request = supertest(app);
    const jane: UserResource = { name: "Jane", email: "johnathan@jonathan.de", password: "abHBJHBHB!!9324923!gikbfk???c"};
    const response = await request.post(`/api/user`).send(jane).set("Authorization", `Bearer ${token}`);

    const janeModel = await User.findOne({ email: "jane@jana.de" });
    expect(janeModel).toBeDefined();

    expect(response.statusCode).toBe(400);
});

//PUT tests
test("user PUT, positive test", async () => {
    const request = supertest(app);
    const update: UserResource = { id: john.id, name: "Jane", email: "jane@jana.de", admin: true, password: "hdsbfhHH!!68723472", mod: false }

    const response = await request.put(`/api/user/${update.id}`).send(update).set("Authorization", `Bearer ${token}`);

    expect(response.statusCode).toBe(200);

    const updateRes = response.body as UserResource;
    expect(updateRes).toEqual({ ...update, password:  updateRes.password, mod: updateRes.mod});
});

test("user PUT, negative test for duplicate User", async () => {
    const request = supertest(app);
    const update: UserResource = ({ id: umut.id, name: "Test", email: "johnathan@jonathan.de", admin: true, password: "hdsbfhHH!!68723472", mod: false })
    const response = await request.put(`/api/user/${umut.id}`).send(update).set("Authorization", `Bearer ${token}`);

    expect(response.statusCode).toBe(400);
});

test("users put negative test 400", async () => {
    const request = supertest(app);
    const response = await request.put(`/api/user/abc`).set("Authorization", `Bearer ${token}`);
    expect(response.statusCode).toBe(400);
});

//DELETE tests
test("user DELETE, positive test", async() => {
    const request = supertest(app);
     let johnss = await createUser({ name: "polat", email: "ragnaroek@jana.de", password: "123", admin: false })
    const response = await request.delete(`/api/user/${johnss.id}`).set("Authorization", `Bearer ${token}`);
    
    expect(response.statusCode).toBe(204);
});

test("user DELETE, negative test 400", async() => {
    const request = supertest(app);
    const response = await request.delete(`/api/user/${NON_EXISTING_ID}`).set("Authorization", `Bearer ${token}`);
    
    expect(response.statusCode).toBe(400);
});

test("users delete negativ 400", async () => {
    const request = supertest(app);
    const response = await request.delete(`/api/user/abc`).set("Authorization", `Bearer ${token}`);
    expect(response.statusCode).toBe(400);
});