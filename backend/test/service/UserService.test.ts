import mongoose, { Types } from "mongoose"
import DB from "../TestDB";
import { IUser, User } from "../../src/endpoints/user/UserModel"
import { getUser, createUser, updateUser, deleteUser } from "../../src/endpoints/user/UserService"
import { UserResource } from "../../src/types/Resources";

const jinxData: IUser = { email: "jinx@gmail.com", name: "Jinx", password: "Hello", admin: false }
let idJinx: string

beforeAll(async () => await DB.connect())
beforeEach(async () => {
    await User.syncIndexes()
    const jinx = await User.create(jinxData)
    idJinx = jinx.id;
})
afterEach(async () => await DB.clear())
afterAll(async () => await DB.close())



// getUsers-Tests

test("getUsers with pre-existing users", async () => {
    const userResource = await getUser(idJinx);
    expect(userResource).toBeDefined();
    expect(userResource.name).toBe("Jinx");
    expect(userResource.password).not.toBeDefined();
})

// test("getUsers, passwords are not returned", async () => {
//     const userResource = await getUsers();
//     expect(userResource.users.length).toBe(1);
//     expect(userResource.users.every(alte => !alte.password)).toBeTruthy()
// })

// createUser-Tests

test("createUser Lucy", async () => {
    const userResource = await createUser({ name: "Lucy", email: "lucy@gmail.com", password: "Ufo", admin: false })
    expect(userResource.name).toBe("Lucy")
    expect(userResource.email).toBe("lucy@gmail.com")
    expect(userResource.admin).toBe(false)
})

test("createUser and getUsers are consistent", async () => {
    const lucy = await createUser({ name: "Lucy", email: "lucy@gmail.com", password: "Ufo", admin: false })
    const userResource = await getUser(lucy.id!);
    expect(userResource.name).toBe("Lucy")
    expect(userResource.email).toBe("lucy@gmail.com")
    expect(userResource.admin).toBe(false)
})

// updateUser-Tests

test("updateUser, name can be changed", async () => {
    const userResource = await getUser(idJinx);
    let a: UserResource = {id: idJinx, name: "Vitawelt", email: "jinx2@gmail.com", password: "thisISstrong!!22", admin: true, mod: true}
    const updatedResource = await updateUser(a);
    expect(updatedResource.name).toBe("Vitawelt");
})

test("Error when updating a user with a missing id", async () => {
    const userResource: UserResource = {
        name: "Lucy",
        email: "Lucy@gmail.com",
        password: "Vitawelt",
        admin: false
    };
    await expect(updateUser(userResource)).rejects.toThrowError("User id missing, cannot update");
});

test("Throws an error if no user with the given ID is found", async () => {
    const invalidUserId =  new mongoose.Types.ObjectId();
    const userResource: UserResource = { id: invalidUserId.toString(), name: "Jinx", email: "jinx@gmail.com", admin: false };

    await expect(updateUser(userResource)).rejects.toThrow(`No user with id ${userResource.id} found, cannot update`);
});

// deleteUser-Tests

test("deleteUser of an existing user", async () => {
    await deleteUser(idJinx);
    const user = await User.findById(idJinx).exec();
    expect(user).toBeNull();
});

test("Error when deleting a user with a missing id", async () => {
    await expect(deleteUser("")).rejects.toThrow("No id given, cannot delete user.");
});

test("Throws an error if no user was deleted", async () => {
    const invalidUserId =  new mongoose.Types.ObjectId();
    await expect(deleteUser(invalidUserId.toString())).rejects.toThrowError(`No user with id ${invalidUserId} deleted, probably id not valid`);
});