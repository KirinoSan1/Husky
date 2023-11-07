import { IThreadPage, ThreadPage } from "../../src/endpoints/threadpage/ThreadPageModel";
import { Types } from "mongoose";
import TestDB from "../TestDB";
import { IUser, User } from "../../src/endpoints/user/UserModel";
import { Post } from "../../src/endpoints/post/PostModel";

let umut: IUser & { _id: Types.ObjectId; }
let moe: IUser & { _id: Types.ObjectId; }

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
  moe = await User.create({
    email: "ummutcandin@gmx.de",
    name: "Ummut Can Aydin",
    password: "ummut21",
    admin: false
  });
});

afterEach(async () => {
  await TestDB.clear();
});

afterAll(async () => {
  await TestDB.close();
});


/**
 * This testcase shows that a post is saved in the Array of the ThreadPage model posts property.
 */
test("create a Post and the threadpage", async () => {
  const post = await Post.create({
    content: "Test.",
    author: umut,
    createdAt: new Date()
  });

  const post2 = await Post.create({
    content: "Test.",
    author: moe,
    createdAt: new Date()
  });

  const threadPage = await ThreadPage.create({
    posts: [post, post2],
    createdAt: new Date()
  });

  const threadPageLoaded = await ThreadPage.findById(threadPage._id);
  const loadedAuthor = await User.findById(threadPageLoaded!.posts[0].author)
  const loadedAuthor2 = await User.findById(post.author)
  expect(loadedAuthor).toEqual(loadedAuthor2)
  expect(threadPageLoaded?.posts[0].content).toEqual(post.content)

  const loadedAuthor3 = await User.findById(threadPageLoaded!.posts[1].author)
  const loadedAuthor4 = await User.findById(post2.author)
  expect(loadedAuthor3).toEqual(loadedAuthor4)
  expect(threadPageLoaded?.posts[1].content).toEqual(post2.content)
  //expect(threadPageLoaded?.posts).toEqual([post, post2]);
});