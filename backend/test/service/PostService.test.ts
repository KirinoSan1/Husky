import DB from "../TestDB";
import { User } from "../../src/endpoints/user/UserModel"
import { PostResource, UserResource } from "../../src/types/Resources";
import { createPost, deletePost, getPost, updatePost } from "../../src/endpoints/post/PostService";
import { Post } from "../../src/endpoints/post/PostModel";
import { Types } from "mongoose";



const userData: UserResource = { email: "user@gmail.com", name: "User", password: "Hello", admin: false }
let dataID: string
let postID: string
let postData: PostResource
const idd: Types.ObjectId = new Types.ObjectId

beforeAll(async () => await DB.connect())
beforeEach(async () => {
    await User.syncIndexes();
    const user = await User.create(userData);
    dataID = user.id;
    postData = { content: "Random Content.Yes.", author: dataID, createdAt: new Date() };
    // const post = await Post.create(postData)
    const post = await createPost(postData);
    postID = post.id!;
});
afterEach(async () => await DB.clear())
afterAll(async () => await DB.close())


test("getPost test", async () => {
    const postTest = await getPost(postID);
    expect(postTest).toBeDefined();
    expect(postTest.content).toBe("Random Content.Yes.");
    expect(postTest.author).toBe(dataID);
    expect(postTest.upvotes).toBe(0)
    expect(postTest.downvotes).toBe(0);
    expect(postTest.id).toStrictEqual(postID)
})

test("getPost negativ test", async () => {
    await expect(getPost(idd.toString())).rejects.toThrow();
})

test('updatePost test', async () => {
    const updatedContent = "Updated Test Content";
    const updatedPostData: PostResource = {
        id: postID,
        content: updatedContent,
        author: new Types.ObjectId().toString(),
        upvotes: 5,
        downvotes: 3,
        createdAt: new Date(),
    };
    const updatedPost = await updatePost(updatedPostData);
    expect(updatedPost).toBeDefined();
    expect(updatedPost.content).toBe(updatedContent);
    expect(updatedPost.author).toBe(updatedPostData.author);
    expect(updatedPost.upvotes).toBe(updatedPostData.upvotes);
    expect(updatedPost.downvotes).toBe(updatedPostData.downvotes);
    expect(updatedPost.id).toBe(postID);
    const x = await Post.findById(updatedPost.id).exec();
    expect(x?.id).toBe(updatedPost.id)
});

test('deletePost test', async () => {
    await deletePost(postID);
    const deletedPost = await Post.findById(postID);
    expect(deletedPost?.content).toBe("This Post has been deleted.");
});

test('deletePost test negativ', async () => {
    await expect(deletePost(Types.ObjectId.toString())).rejects.toThrow();
});

test('deletePost test negativ', async () => {
    await expect(deletePost(Types.ObjectId.toString())).rejects.toThrow();
});

test('updatePost test negativ', async () => {
    const updatedContent = "Updated Test Content";
    const updatedPostData: PostResource = {
        content: updatedContent,
        author: new Types.ObjectId().toString(),
        upvotes: 5,
        downvotes: 3,
        createdAt: new Date(),
    };
    await expect(updatePost(updatedPostData)).rejects.toThrow("Post id missing, cannot update");
});


test('updatePost test negativ with wrong id ', async () => {
    const updatedContent = "Updated Test Content";
    const updatedPostData: PostResource = {
        id: "635d2e796ea2e8c9bde5787c",
        content: updatedContent,
        author: new Types.ObjectId().toString(),
        upvotes: 5,
        downvotes: 3,
        createdAt: new Date()
    };
    await expect(updatePost(updatedPostData)).rejects.toThrow(`No Post with the given id found, cannot update.`);
});


test('deletePost test negativ', async () => {
    await expect(deletePost("635d2e796ea2e8c9bde5787c")).rejects.toThrow();
});