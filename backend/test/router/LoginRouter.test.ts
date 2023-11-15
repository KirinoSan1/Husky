import dotenv from "dotenv";
dotenv.config();
import supertest from "supertest";
import app from "../../src/testIndex";
import DB from "../TestDB";
import { User } from "../../src/endpoints/user/UserModel";
import { createUser } from "../../src/endpoints/user/UserService";
import { LoginResource, UserResource } from "../../src/types/Resources";

let token: string
let john: UserResource
let idjohn: string
let strongPW = "123asdf!ABCDwdwadwWEuihn092"

beforeAll(async () => { await DB.connect(); })
beforeEach(async () => {
    User.syncIndexes();
    john = await createUser({ name: "Johnathan", email: "johnathan@jonathan.de", password: strongPW, admin: true })
    idjohn = john.id!
})
afterEach(async () => { await DB.clear(); })
afterAll(async () => {
    await DB.close()
})

test("login POST", async () => {
    const request = supertest(app);
    const loginData = { email: "johnathan@jonathan.de", password: strongPW };
    const response = await request.post(`/api/login`).send(loginData);
    const loginResource = response.body as LoginResource;
    token = loginResource.access_token;
    expect(token).toBeDefined();
    expect(response.status).toBe(201)
});

test("login POST no email", async () => {
    const request = supertest(app);
    const loginData = { email: "", password: strongPW };
    const response = await request.post(`/api/login`).send(loginData)
    expect(response.statusCode).toBe(400)
});

test("login POST no password", async () => {
    const request = supertest(app);
    const loginData = { email: "johnathan@jonathan.de", password: "" };
    const response = await request.post(`/api/login`).send(loginData);
    expect(response.statusCode).toBe(400)
});


test("Login falsche Daten", async () => {
    const request = supertest(app)
    const loginData = { email: "falscheemail@jonathan.de", password: strongPW };
    const response = await request.post(`/api/login`).send(loginData)
    expect(response.statusCode).toBe(401)
})