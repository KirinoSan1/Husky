import dotenv from "dotenv";
dotenv.config();

import supertest from "supertest";
import app from "../../src/testIndex";
import DB from "../TestDB";
import { User } from "../../src/endpoints/user/UserModel";
import { LoginResource, UserResource } from "../../src/types/Resources";

let token: string;
let john: UserResource;
let idjohn: string;
let strongPW = "123asdf!ABCDwdwadwWEuihn092";

beforeAll(async () => { await DB.connect(); });
beforeEach(async () => {
    User.syncIndexes();
    john = await User.create({ name: "Johnathan", email: "johnathan@jonathan.de", password: strongPW, admin: true, verified: true });
    idjohn = john.id!;
});
afterEach(async () => { await DB.clear(); });
afterAll(async () => { await DB.close() });

test("Login POST positive test", async () => {
    const request = supertest(app);
    const loginData = { email: "johnathan@jonathan.de", password: strongPW, };
    const response = await request.post(`/api/login`).send(loginData);
    const loginResource = response.body as LoginResource;
    token = loginResource.access_token;

    expect(token).toBeDefined();
    expect(response.status).toBe(201);
});

test("Login POST without email", async () => {
    const request = supertest(app);
    const loginData = { email: "", password: strongPW };
    const response = await request.post(`/api/login`).send(loginData);

    expect(response.statusCode).toBe(400);
});

test("Login POST without password", async () => {
    const request = supertest(app);
    const loginData = { email: "johnathan@jonathan.de", password: "" };
    const response = await request.post(`/api/login`).send(loginData);

    expect(response.statusCode).toBe(400);
});

test("Login POST wrong data", async () => {
    const request = supertest(app)
    const loginData = { email: "invalid@jonathan.de", password: strongPW };
    const response = await request.post(`/api/login`).send(loginData);

    expect(response.statusCode).toBe(401);
});

test("Login POST unauthorized due to unverified email", async () => {
    const unverifiedUser = await User.create({ name: "Gojo", email: "unverified@unverified.de", password: strongPW, admin: true, verified: false });

    const request = supertest(app);
    const loginData = { email: "unverified@unverified.de", password: strongPW };
    const response = await request.post(`/api/login`).send(loginData);

    expect(response.statusCode).toBe(403);
    expect(response.body.message).toBe("Not authorized. Please verify your email.");
});
