import dotenv from "dotenv";
dotenv.config()

import { sign } from "jsonwebtoken";
import { verifyJWT, verifyPasswordAndCreateJWT } from "../../src/endpoints/service/JWTService";
import { User } from "../../src/endpoints/user/UserModel";
import DB from "../TestDB";

let strongPW = "123asdf!ABCD";
let idJohn: string;
let idMomo: string;
let idMax: string;

let JWT_SECRET_OLD: string;
let JWT_TTL_OLD: string;

beforeAll(async () => {
    await DB.connect();
    JWT_SECRET_OLD = process.env.JWT_SECRET as string;
    JWT_TTL_OLD = process.env.JWT_TTL as string;
});
beforeEach(async () => {
    User.syncIndexes();
    const userJohn = await User.create({ name: "John", email: "john@some-host.de", password: strongPW, admin: false, verified: true });
    const userMomo = await User.create({ name: "Momo", email: "momo@admin.de", password: strongPW, admin: true, verified: true });
    const userMax = await User.create({ name: "Max", email: "max@mod.de", password: strongPW, admin: false, mod: true, verified: true });
    idJohn = userJohn.id!;
    idMomo = userMomo.id!;
    idMax = userMax.id!;
});
afterEach(async () => {
    await DB.clear();
    process.env.JWT_SECRET = JWT_SECRET_OLD;
    process.env.JWT_TTL = JWT_TTL_OLD;
});
afterAll(async () => {
    await DB.close()
});

// ------------------------------------------------- verifyPasswordAndCreateJWT -------------------------------------------------------------------

test("VerifyPasswordAndCreateJWT - Positive test user", async () => {
    const res = await verifyPasswordAndCreateJWT("john@some-host.de", strongPW);

    expect(res).toBeDefined();
    const result = verifyJWT(res);

    expect(result.userId).toBe(idJohn);
    expect(result.role).toBe("u");
});

test("VerifyPasswordAndCreateJWT - Positiv test admin", async () => {
    const res = await verifyPasswordAndCreateJWT("momo@admin.de", strongPW);

    expect(res).toBeDefined();
    const result = verifyJWT(res);

    expect(result.userId).toBe(idMomo);
    expect(result.role).toBe("a");
});

test("VerifyPasswordAndCreateJWT - Positiv test mod", async () => {
    const res = await verifyPasswordAndCreateJWT("max@mod.de", strongPW);

    expect(res).toBeDefined();
    const result = verifyJWT(res);

    expect(result.userId).toBe(idMax);
    expect(result.role).toBe("m");
});

test("VerifyPasswordAndCreateJWT - Negative test user", async () => {
    const res = await verifyPasswordAndCreateJWT("john@some-.de", strongPW);

    expect(res).not.toBeDefined();
});

test("VerifyPasswordAndCreateJWT - Negative test user password", async () => {
    const res = await verifyPasswordAndCreateJWT("john@some-host.de", "strongPW");

    expect(res).not.toBeDefined();
});

test("VerifyPasswordAndCreateJWT - SECRET missing", async () => {
    process.env.JWT_SECRET = "";
    process.env.JWT_TTL = "";

    await expect(verifyPasswordAndCreateJWT("max@mod.de", strongPW)).rejects.toThrow();
});

test("VerifyPasswordAndCreateJWT - TTL missing", async () => {
    process.env.JWT_TTL = "";

    await expect(verifyPasswordAndCreateJWT("max@mod.de", strongPW)).rejects.toThrow();
});

// --------------------------------------------------------------- verifyJWT -------------------------------------------------------------------

test("VerifyJWT - JWT_SECRET missing", async () => {
    process.env.JWT_SECRET = "dwadawd";
    process.env.JWT_TTL = "10d";
    const res = await verifyPasswordAndCreateJWT("max@mod.de", strongPW);

    expect(res).toBeDefined();
    process.env.JWT_SECRET = "";
    expect(() => { verifyJWT(res) }).toThrow();
});

test("VerifyJWT - JWT_TTL missing", async () => {
    process.env.JWT_SECRET = "dwadawd";
    process.env.JWT_TTL = "10d";
    const res = await verifyPasswordAndCreateJWT("max@mod.de", strongPW);

    expect(res).toBeDefined();
    process.env.JWT_TTL = "";
    expect(() => { verifyJWT(res) }).toThrow();
});

test("VerifyJWT - Different secret", async () => {
    process.env.JWT_SECRET = "dwadawd";
    process.env.JWT_TTL = "10d";
    const res = await verifyPasswordAndCreateJWT("max@mod.de", strongPW);

    expect(res).toBeDefined();
    process.env.JWT_SECRET = "dawd";
    expect(() => { verifyJWT(res) }).toThrow();
});

test("VerifyJWT - Different TTL", async () => {
    process.env.JWT_SECRET = "dwadawd";
    process.env.JWT_TTL = "10d";
    const res = await verifyPasswordAndCreateJWT("max@mod.de", strongPW);

    expect(res).toBeDefined();
    process.env.JWT_TTL = "";
    expect(() => { verifyJWT(res) }).toThrow();
});

test("VerifyJWT - Invalid JWT", async () => {
    process.env.JWT_SECRET = "dwadawd";
    process.env.JWT_TTL = "10d";
    const res = await verifyPasswordAndCreateJWT("max@mod.de", strongPW);

    expect(res).toBeDefined();
    expect(() => { verifyJWT(undefined) }).toThrow();
});

test("VerifyJWT - Invalid JWT", async () => {
    process.env.JWT_SECRET = "dwadawd";
    process.env.JWT_TTL = "10d";
    let jwt = sign({ subb: "liar" }, process.env.JWT_SECRET, { algorithm: "HS256", expiresIn: "10d" });

    expect(() => { verifyJWT(jwt) }).toThrow();
});

test("VerifyJWT - Invalid JWT", async () => {
    process.env.JWT_SECRET = "dwadawd";
    process.env.JWT_TTL = "10d";
    let jwt = sign({ rolee: "k" }, process.env.JWT_SECRET, { algorithm: "HS256", expiresIn: "10d" });

    expect(() => { verifyJWT(jwt) }).toThrow();
});
