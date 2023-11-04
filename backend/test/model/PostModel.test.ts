import { Types } from "mongoose";
import { IUser, User } from "../../src/endpoints/user/UserModel";
import TestDB from "../TestDB";
import { Post } from "../../src/endpoints/post/PostModel";

let umut: IUser & {_id: Types.ObjectId;}

beforeAll(async () => {
  await TestDB.connect();
});

beforeEach(async () => {
  umut = await User.create({
    email: "umutcandin@gmx.de",
    name: "Umut Can Aydin",
    password: "umut21",
    admin: false
  });
});

afterEach(async () => {
  await TestDB.clear();
});

afterAll(async () => {
  await TestDB.close();
});

test("create a Post Model dummy", async () => {
  const post = await Post.create({
    content: "This is an Example.",
    author: umut,
    createdAt: new Date()
  });

  expect(post.content).toBe("This is an Example.");
  expect(post.author).toEqual(umut); 
  expect(post.createdAt).toBeDefined();
  expect(post.upvotes).toBe(0)
  expect(post.downvotes).toBe(0)
});
