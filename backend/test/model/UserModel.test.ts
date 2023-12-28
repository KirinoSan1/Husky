import { Types } from "mongoose";
import { IUser, User } from "../../src/endpoints/user/UserModel";
import TestDB from "../TestDB";

let userUmut: IUser & { _id: Types.ObjectId; }

beforeAll(async () => await TestDB.connect())
beforeEach(async () => {
    userUmut = await User.create({ email: "umutcandin@gmx.de", name: "Umut Can Aydin", password: "umut21", admin: false, verified: true });
})
afterEach(async () => await TestDB.clear())
afterAll(async () => await TestDB.close())

test("Change the username", async () => {
    const newUser = await User.create({ email: "umutcanaydin@gmx.de", name: "Habub", password: "umut21", admin: false, verified: true });
    const createdUser = await newUser.save();

    expect(createdUser).toBeDefined();
    expect(userUmut.name).not.toEqual(createdUser.name);
    createdUser.name = "Umut Can Aydin";
    expect(userUmut.name).toEqual(createdUser.name);
});

test("Change the password", async () => {
    const newUser = await User.create({ email: "umutcanaydin@gmx.de", name: "Habub", password: "umut21", admin: false, verified: true });
    const createdUser = await newUser.save();

    expect(createdUser).toBeDefined();
    expect(userUmut.password).not.toEqual(createdUser.password);
    createdUser.password = "hallo";
    expect(userUmut.password).not.toEqual(createdUser.password);
});

test("Change the password 2", async () => {
    const newUser = await User.create({ email: "umutcanaydin@gmx.de", name: "Habub", password: "umut21", admin: false, verified: true });

    expect(newUser).toBeDefined();
    expect(userUmut.password).not.toEqual(newUser.password);
    expect((await newUser.isPasswordCorrect(newUser.password))).not.toEqual(userUmut.password);
    newUser.password = "hallo";
    await expect((newUser.isPasswordCorrect(newUser.password))).rejects.toThrow();
});

test("Change the admin", async () => {
    const newUser = await User.create({ email: "umutcandinss@gmx.de", name: "Habub", password: "umut21", admin: true, verified: true });
    const createdUser = await newUser.save();

    expect(createdUser).toBeDefined();
    expect(userUmut.admin).toBe(false);
    expect(createdUser.admin).toBe(true);
    expect(createdUser.admin).not.toEqual(userUmut.admin);
    createdUser.admin = false;
    expect(createdUser.admin).toEqual(userUmut.admin);
});

test("Test email", async () => {
    const newUser = await User.create({ email: "umutcandinss@gmx.de", name: "Habub", password: "umut21", admin: false, verified: true });
    const createdUser = await newUser.save();

    expect(createdUser).toBeDefined();
    expect(userUmut.email).not.toBe(createdUser.email);
});

test("Test name", async () => {
    const newUser = await User.create({ email: "umi@gg.de", name: "Umi", password: "12", admin: true, verified: true });
    const createdUser = await newUser.save();

    expect(createdUser).toBeDefined();
    expect(createdUser.id).toBeDefined();
    expect(createdUser.name).toBe("Umi");
    expect(createdUser.name).not.toEqual(userUmut.name);
});

test("Test update user", async () => {
    const newUser = new User({ email: "umi@gg.de", name: "Umiti", password: "12", admin: true, verified: true });
    const createdUser = await newUser.save();

    expect(createdUser).toBeDefined();

    const updated = await User.updateOne({ email: "umi@gg.de" }, { name: "HABEBE" });
    expect(updated.acknowledged).toBeTruthy();
    expect(updated.modifiedCount).toBe(1);

    const updatedUser = await User.findOne({ email: "umi@gg.de" }).exec();
    if (updatedUser) {
        expect(updatedUser.name).toBe("HABEBE");
    }
});

test("Test, if email is unique", async () => {
    const newUser = new User({ email: "umi@gg.de", name: "Umiti", password: "12", admin: true, verified: true });
    const createdUser = await newUser.save();

    expect(createdUser).toBeDefined();

    const createdUser2 = new User({ email: "umi@gg.de", name: "Umti", password: "122", admin: true, verified: true });
    try {
        await createdUser2.save();
        const savedUser = await createdUser2.save();
        expect(savedUser).toBeDefined();
    } catch {
    }
});

test("Test if name and email is required", async () => {
    const newUser = new User({ email: "umit@gg.de", name: "Umi", password: "12", admin: true, verified: true });
    const createdUser = await newUser.save();

    expect(createdUser).toBeDefined();
    expect(createdUser.id).toBeDefined();
    expect(createdUser.name).toBe("Umi");
    expect(createdUser.admin).toBe(true);

    const createdUser2 = new User({ password: "122", admin: true, verified: true });
    expect(createdUser2.name).toBeUndefined();
    expect(createdUser2.email).toBeUndefined();
});

test("Test if admin is required", async () => {
    const newUser = new User({ email: "umit@gg.de", password: "12", admin: true, verified: true });
    expect(async () => await newUser.save()).rejects.toThrow();
});
