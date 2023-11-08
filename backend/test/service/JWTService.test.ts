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


test("JWTService test ",async () => {
    const res = await verifyPasswordAndCreateJWT("john@some-host.de", strongPW)
    expect(res).toBeDefined()
    const result = verifyJWT(res)
    expect(result.userId).toBe(idj)
    expect(result.role).toBe("u")
})

test("JWTService test ",async () => {
    const res = await verifyPasswordAndCreateJWT("john@some-.de", strongPW)
    expect(res).not.toBeDefined()
})

test("JWTService test ",async () => {
    const res = await verifyPasswordAndCreateJWT("john@some-host.de", "strongPW")
    expect(res).not.toBeDefined()
})



test("JWTService test ",async () => {
    const res = await verifyPasswordAndCreateJWT("momo@admin.de", strongPW)
    expect(res).toBeDefined()
    const result = verifyJWT(res)
    expect(result.userId).toBe(ida)
    expect(result.role).toBe("a")
})

test("JWTService test ",async () => {
    const res = await verifyPasswordAndCreateJWT("max@mod.de", strongPW)
    expect(res).toBeDefined()
    const result = verifyJWT(res)
    expect(result.userId).toBe(idm)
    expect(result.role).toBe("m")
})

test("JWTService test ",async () => {
    process.env.JWT_SECRET = "";
    process.env.JWT_TTL = "";
    await expect(verifyPasswordAndCreateJWT("max@mod.de", strongPW)).rejects.toThrow()
})

test("JWTService test ",async () => {
    process.env.JWT_TTL = "";
    await expect(verifyPasswordAndCreateJWT("max@mod.de", strongPW)).rejects.toThrow()
})

test("JWTService test ",async () => {
    process.env.JWT_SECRET = "dwadawd";
    process.env.JWT_TTL = "10d";
    const res = await verifyPasswordAndCreateJWT("max@mod.de", strongPW)
    expect(res).toBeDefined()
    process.env.JWT_SECRET = "";
    expect(() => {verifyJWT(res)}).toThrow();
})

test("JWTService test ",async () => {
    process.env.JWT_SECRET = "dwadawd";
    process.env.JWT_TTL = "10d";
    const res = await verifyPasswordAndCreateJWT("max@mod.de", strongPW)
    expect(res).toBeDefined()
    process.env.JWT_TTL = "";
    expect(() => {verifyJWT(res)}).toThrow();
})