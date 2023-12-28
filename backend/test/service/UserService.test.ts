import DB from "../TestDB";
import mongoose from "mongoose"
import { IUser, User } from "../../src/endpoints/user/UserModel"
import { getUser, createUser, updateUser, deleteUser, getAllThreadsForUser, getUsersAvatar } from "../../src/endpoints/user/UserService"
import { UserResource } from "../../src/types/Resources";

const userJinx: IUser = { name: "Jinx", email: "jinx@gmail.com", password: "123asdf!ABCD", admin: false, verified: true };
let idJinx: string;
let threadId: string;

beforeAll(async () => await DB.connect());
beforeEach(async () => {
    await User.syncIndexes();
    const jinx = await User.create(userJinx);
    idJinx = jinx.id;
});
afterEach(async () => await DB.clear());
afterAll(async () => await DB.close());

// ------------------------------------------------------------ getUsers -------------------------------------------------------------------

test("GetUser with pre-existing users", async () => {
    const userResource = await getUser(idJinx);

    expect(userResource).toBeDefined();
    expect(userResource.name).toBe("Jinx");
    expect(userResource.password).not.toBeDefined();
});

test("GetUser should throw error because user not found", async () => {
    const invalidUserId = new mongoose.Types.ObjectId();
    await expect(getUser(invalidUserId.toString())).rejects.toThrowError(`User with ID ${invalidUserId} not found.`);
});

test("GetUsersAvatar positive test", async () => {
    const avatarObject = await getUsersAvatar(idJinx);

    expect(avatarObject).toHaveProperty("avatar");
    expect(typeof avatarObject.avatar).toBe("string");
});

test("GetUsersAvatar positive test with defined avatar", async () => {
    const userYuuta: IUser = { name: "Yuuta", email: "yuuta@gmail.com", password: "123asdf!ABCD", admin: false, avatar: "avatar.jpg", verified: true };
    const yuuta = await User.create(userYuuta);

    const avatarObject = await getUsersAvatar(yuuta.id);

    expect(avatarObject).toBeDefined();
    expect(avatarObject.avatar).toBe("avatar.jpg"); 

    const userKiri: IUser = { name: "Kiri", email: "kiri@gmail.com", password: "123asdf!ABCD", admin: false, avatar: undefined, verified: true };
    const kiri = await User.create(userKiri);

    const avatarObject2 = await getUsersAvatar(kiri.id);

    expect(avatarObject2).toBeDefined();
    expect(avatarObject2.avatar).toBe(""); 
});

test("GetUsersAvatar throws error for non-existent user ID", async () => {
    const invalidUserId = new mongoose.Types.ObjectId().toString();
    await expect(getUsersAvatar(invalidUserId)).rejects.toThrowError(`User with ID ${invalidUserId} not found.`);
});

test("GetAllThreadsForUser limits threads if count is provided and greater than 0", async () => {
    const count = 5;
    const userId = idJinx;
    const threads = await getAllThreadsForUser(userId, count);

    expect(threads).toBeDefined();
    expect(threads.length).toBeLessThanOrEqual(count);
});

test("GetAllThreadsForUser should throw error because user not found", async () => {
    const invalidUserId = new mongoose.Types.ObjectId();
    await expect(getAllThreadsForUser(invalidUserId.toString())).rejects.toThrowError(`User with ID ${invalidUserId} not found.`);
});

// ------------------------------------------------------------ createUser -------------------------------------------------------------------

test("CreateUser Lucy", async () => {
    const userResource = await createUser({ name: "Lucy", email: "lucy@gmail.com", password: "Ufo", admin: false, verified: true });

    expect(userResource.name).toBe("Lucy");
    expect(userResource.email).toBe("lucy@gmail.com");
    expect(userResource.admin).toBe(false);
});

test("CreateUser and getUsers are consistent", async () => {
    const lucy = await createUser({ name: "Lucy", email: "lucy@gmail.com", password: "Ufo", admin: false, verified: true });
    const userResource = await getUser(lucy.id!);

    expect(userResource.name).toBe("Lucy");
    expect(userResource.email).toBe("lucy@gmail.com");
    expect(userResource.admin).toBe(false);
});

// ------------------------------------------------------------ updateUser -------------------------------------------------------------------

test("UpdateUser, name can be changed", async () => {
    let updatedUser: UserResource = { id: idJinx, name: "Vitawelt", email: "jinx2@gmail.com", password: "thisISstrong!!22", admin: true, mod: true, verified: true };
    const updatedResource = await updateUser(updatedUser);

    expect(updatedResource.name).toBe("Vitawelt");
});

test("Error when updating a user with a missing id", async () => {
    const userResource: UserResource = {
        name: "Lucy",
        email: "Lucy@gmail.com",
        password: "Vitawelt",
        admin: false
    };

    await expect(updateUser(userResource)).rejects.toThrowError("User ID missing, cannot update.");
});

test("Throws an error if no user with the given ID is found", async () => {
    const invalidUserId = new mongoose.Types.ObjectId();
    const userResource: UserResource = { id: invalidUserId.toString(), name: "Jinx", email: "jinx@gmail.com", admin: false, verified: true };

    await expect(updateUser(userResource)).rejects.toThrow(`No user with ID ${userResource.id} found, cannot update.`);
});

// ------------------------------------------------------------ deleteUser -------------------------------------------------------------------

test("DeleteUser of an existing user", async () => {
    await deleteUser(idJinx);
    const user = await User.findById(idJinx).exec();

    expect(user).toBeNull();
});

test("Error when deleting a user with a missing id", async () => {
    await expect(deleteUser("")).rejects.toThrow("No ID given, cannot delete user.");
});

test("Throws an error if no user was deleted", async () => {
    const invalidUserId = new mongoose.Types.ObjectId();
    await expect(deleteUser(invalidUserId.toString())).rejects.toThrowError(`No user with ID ${invalidUserId} deleted, probably ID not valid.`);
});
