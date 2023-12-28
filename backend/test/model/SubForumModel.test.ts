import { ThreadPage } from "../../src/endpoints/threadpage/ThreadPageModel";
import { Types } from "mongoose";
import TestDB from "../TestDB";
import { IUser, User } from "../../src/endpoints/user/UserModel";
import { Post } from "../../src/endpoints/post/PostModel";
import { Thread } from "../../src/endpoints/thread/ThreadModel"
import { SubForum } from "../../src/endpoints/subforum/SubForumModel"
import { ISubForum } from "../../src/endpoints/subforum/SubForumModel";

let userEren: IUser & { _id: Types.ObjectId; }
let userMikasa: IUser & { _id: Types.ObjectId; }

beforeAll(async () => { await TestDB.connect(); });
beforeEach(async () => {
  userEren = await User.create({
    email: "eren@gmx.de",
    name: "Eren",
    password: "eren123",
    admin: false,
    verified: true
  });
  userMikasa = await User.create({
    email: "mikasa@gmx.de",
    name: "Mikasa",
    password: "mikasa123",
    admin: false,
    verified: true
  });
});

afterEach(async () => { await TestDB.clear(); });
afterAll(async () => { await TestDB.close(); });

test("Create a SubForum with Threads, ThreadPages, and Posts", async () => {

  // Create posts
  const post = await Post.create({
    content: "Mathematik",
    author: userEren,
    createdAt: new Date()
  });

  const post2 = await Post.create({
    content: "Informatik",
    author: userMikasa,
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
    creator: userEren._id,
    title: "Thread",
    subForum: "Testing",
    pages: [threadPage, threadPage2],
    numPosts: 2,
    createdAt: Date.now()
  });

  // Create SubForum with Thread
  const newSubForum: ISubForum = {
    name: "New SubForum",
    description: "Description for the new SubForum",
    threads: [newThread._id] // add new Thread
  };

  const createdSubForum = await SubForum.create(newSubForum);
  const foundSubForum = await SubForum.findById(createdSubForum._id).exec();

  // Expectations
  expect(foundSubForum?.threads.length).toBe(1);
  expect(foundSubForum?.name).toBe("New SubForum");
  expect(foundSubForum?.description).toBe("Description for the new SubForum");
  expect(foundSubForum?.threads[0]).toEqual(newThread._id);
});
