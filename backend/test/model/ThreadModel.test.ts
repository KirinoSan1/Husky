import { ThreadPage } from "../../src/endpoints/threadpage/ThreadPageModel";
import { Types } from "mongoose";
import TestDB from "../TestDB";
import { IUser, User } from "../../src/endpoints/user/UserModel";
import { Post } from "../../src/endpoints/post/PostModel";
import { Thread } from "../../src/endpoints/thread/ThreadModel"

let userUmut: IUser & { _id: Types.ObjectId; }
let userMoe: IUser & { _id: Types.ObjectId; }

beforeAll(async () => { await TestDB.connect(); });
beforeEach(async () => {
  userUmut = await User.create({
    email: "umutcandin@gmx.de",
    name: "Umut Can Aydin",
    password: "umut21",
    admin: false,
    verified: true
  });
  userMoe = await User.create({
    email: "ummutcandin@gmx.de",
    name: "Ummut Can Aydin",
    password: "ummut21",
    admin: false,
    verified: true
  });
});
afterEach(async () => { await TestDB.clear(); });
afterAll(async () => { await TestDB.close() });

test("Create a Thread and test some attributes", async () => {

  // Create posts
  const post = await Post.create({
    content: "Test.",
    author: userUmut,
    createdAt: new Date()
  });

  const post2 = await Post.create({
    content: "Test.",
    author: userMoe,
    createdAt: new Date()
  });

  // Create ThreadPages
  const threadPage = await ThreadPage.create({
    posts: [post, post2],
    createdAt: new Date()
  });

  const threadPage2 = await ThreadPage.create({
    posts: [post, post2],
    createdAt: new Date()
  });

  // Create Thread
  const newThread = await Thread.create({
    creator: userUmut._id,
    title: "Thread",
    subForum: "Testing",
    pages: [threadPage, threadPage2],
    numPosts: 2,
    createdAt: Date.now()
  });

  // Find the created Thread
  const searchThread = await Thread.findById(newThread.id).exec();

  // Expectations
  expect(searchThread?.title).toBe("Thread");
  expect(searchThread?.creator).toEqual(userUmut._id);
  expect(searchThread?.subForum).toBe("Testing");
  expect(searchThread?.numPosts).toBe(2);

  // Compare ThreadPages
  const searchThreadpage = await ThreadPage.findById(searchThread?.pages[0]);
  expect(searchThreadpage?.posts[0].id).toBe(threadPage.posts[0].id);
  expect(searchThreadpage?.posts[0].content).toBe(threadPage.posts[0].content);
  const searchThreadpage2 = await ThreadPage.findById(searchThread?.pages[1]);
  expect(searchThreadpage2?.posts[0].id).toBe(threadPage2.posts[0].id);
  expect(searchThreadpage2?.posts[0].content).toBe(threadPage2.posts[0].content);
});

test("Negative test", async () => {

  // Create posts
  const post = await Post.create({
    content: "Test.",
    author: userUmut,
    createdAt: new Date()
  });

  const post2 = await Post.create({
    content: "Test.",
    author: userMoe,
    createdAt: new Date()
  });

  // Create ThreadPages
  const threadPage = await ThreadPage.create({
    posts: [post, post2],
    createdAt: new Date()
  });

  const threadPage2 = await ThreadPage.create({
    posts: [post, post2],
    createdAt: new Date()
  });

  // Create Thread
  const newThread = await Thread.create({
    creator: userUmut._id,
    title: "Thread",
    subForum: "Testing",
    pages: [threadPage, threadPage2],
    numPosts: 2,
    createdAt: Date.now()
  });

  // Find the created Thread
  const searchThread = await Thread.findById(newThread.id).exec();

  // Expectations
  expect(searchThread?.title).not.toBe("RandomThread");
  expect(searchThread!.creator).not.toEqual(userMoe._id);
  expect(searchThread?.subForum).not.toBe("German");
  expect(searchThread?.numPosts).not.toBe(1);

  // Compare ThreadPages
  const searchThreadpage = await ThreadPage.findById(searchThread?.pages[0]);
  expect(searchThreadpage?.posts).not.toEqual(threadPage2.posts);

  const searchThreadpage2 = await ThreadPage.findById(searchThread?.pages[1]);
  expect(searchThreadpage2?.posts).not.toEqual(threadPage.posts);
});
