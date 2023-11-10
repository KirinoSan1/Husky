import { sign } from "jsonwebtoken";
import { verifyJWT, verifyPasswordAndCreateJWT } from "../../src/endpoints/service/JWTService";
import { User } from "../../src/endpoints/user/UserModel";
import DB from "../TestDB";
import dotenv from "dotenv";
dotenv.config() 

let strongPW = "123asdf!ABCD"
let idj:string
let ida:string
let idm:string
let JWT_SECRET_OLD: string;
let JWT_TTL_OLD: string;
beforeAll(async () => { 
    await DB.connect();
    JWT_SECRET_OLD = process.env.JWT_SECRET as string;
    JWT_TTL_OLD = process.env.JWT_TTL as string;
});

beforeEach(async () => {
    User.syncIndexes();
    const j = await User.create({ name: "John", email: "john@some-host.de", password: strongPW, admin: false })
    const adm = await User.create({ name: "Momo", email: "momo@admin.de", password: strongPW, admin: true })
    const mod = await User.create({ name: "Max", email: "max@mod.de", password: strongPW, admin: false , mod:true})
    idj = j.id!
    ida = adm.id!
    idm = mod.id!
})
afterEach(async () => { 
    await DB.clear();
    process.env.JWT_SECRET = JWT_SECRET_OLD;
    process.env.JWT_TTL = JWT_TTL_OLD;
});
afterAll(async () => {
    await DB.close()
})


test("JWTService test Positiv test User ",async () => {
    const res = await verifyPasswordAndCreateJWT("john@some-host.de", strongPW)
    expect(res).toBeDefined()
    const result = verifyJWT(res)
    expect(result.userId).toBe(idj)
    expect(result.role).toBe("u")
})

test("JWTService test Negativ test User ",async () => {
    const res = await verifyPasswordAndCreateJWT("john@some-.de", strongPW)
    expect(res).not.toBeDefined()
})

test("JWTService test Negativ test User Password ",async () => {
    const res = await verifyPasswordAndCreateJWT("john@some-host.de", "strongPW")
    expect(res).not.toBeDefined()
})

test("JWTService test Positiv test admin ",async () => {
    const res = await verifyPasswordAndCreateJWT("momo@admin.de", strongPW)
    expect(res).toBeDefined()
    const result = verifyJWT(res)
    expect(result.userId).toBe(ida)
    expect(result.role).toBe("a")
})

test("JWTService test Positiv test mod ",async () => {
    const res = await verifyPasswordAndCreateJWT("max@mod.de", strongPW)
    expect(res).toBeDefined()
    const result = verifyJWT(res)
    expect(result.userId).toBe(idm)
    expect(result.role).toBe("m")
})

test("JWTService test SECRET Missing ",async () => {
    process.env.JWT_SECRET = "";
    process.env.JWT_TTL = "";
    await expect(verifyPasswordAndCreateJWT("max@mod.de", strongPW)).rejects.toThrow()
})

test("JWTService test TTL Missing ",async () => {
    process.env.JWT_TTL = "";
    await expect(verifyPasswordAndCreateJWT("max@mod.de", strongPW)).rejects.toThrow()
})

test("JWTService test JWT_SECRET Missing in verifyJWT ",async () => {
    process.env.JWT_SECRET = "dwadawd";
    process.env.JWT_TTL = "10d";
    const res = await verifyPasswordAndCreateJWT("max@mod.de", strongPW)
    expect(res).toBeDefined()
    process.env.JWT_SECRET = "";
    expect(() => {verifyJWT(res)}).toThrow();
})

test("JWTService test JWT_TTL Missing in verifyJWT ",async () => {
    process.env.JWT_SECRET = "dwadawd";
    process.env.JWT_TTL = "10d";
    const res = await verifyPasswordAndCreateJWT("max@mod.de", strongPW)
    expect(res).toBeDefined()
    process.env.JWT_TTL = "";
    expect(() => {verifyJWT(res)}).toThrow();
})

test("JWTService test different Secret in verifyJWT ",async () => {
    process.env.JWT_SECRET = "dwadawd";
    process.env.JWT_TTL = "10d";
    const res = await verifyPasswordAndCreateJWT("max@mod.de", strongPW)
    expect(res).toBeDefined()
    process.env.JWT_SECRET = "dawd";
    expect(() => {verifyJWT(res)}).toThrow();
})

test("JWTService test different TTL in verifyJWT ",async () => {
    process.env.JWT_SECRET = "dwadawd";
    process.env.JWT_TTL = "10d";
    const res = await verifyPasswordAndCreateJWT("max@mod.de", strongPW)
    expect(res).toBeDefined()
    process.env.JWT_TTL = "";
    expect(() => {verifyJWT(res)}).toThrow();
})

test("JWTService test invalid JWT in verifyJWT ",async () => {
    process.env.JWT_SECRET = "dwadawd";
    process.env.JWT_TTL = "10d";
    const res = await verifyPasswordAndCreateJWT("max@mod.de", strongPW)
    expect(res).toBeDefined()
    expect(() => {verifyJWT(undefined)}).toThrow();
})


test("JWTService test invalid JWT in verifyJWT ",async () => {
    process.env.JWT_SECRET = "dwadawd";
    process.env.JWT_TTL = "10d";
    let jwt = sign({subb: "liar"}, process.env.JWT_SECRET,{ algorithm: "HS256", expiresIn: "10d" })
    expect(() => {verifyJWT(jwt)}).toThrow();
})


test("JWTService test invalid JWT in verifyJWT ",async () => {
    process.env.JWT_SECRET = "dwadawd";
    process.env.JWT_TTL = "10d";
    let jwt = sign({rolee: "k"}, process.env.JWT_SECRET,{ algorithm: "HS256", expiresIn: "10d" })
    expect(() => {verifyJWT(jwt)}).toThrow();
})