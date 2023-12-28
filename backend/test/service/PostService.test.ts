import DB from "../TestDB";
import { User } from "../../src/endpoints/user/UserModel"
import { PostResource, UserResource } from "../../src/types/Resources";
import { createPost, deletePost, downvotePost, getPost, updatePost, upvotePost } from "../../src/endpoints/post/PostService";
import { Post } from "../../src/endpoints/post/PostModel";
import { Types } from "mongoose";
import { createUser } from "../../src/endpoints/user/UserService";
import { ThreadPage } from "../../src/endpoints/threadpage/ThreadPageModel";
import { getThreadPage } from "../../src/endpoints/threadpage/ThreadPageService";

let userJinx: UserResource = { name: "Jinx", email: "Jinx@gmail.com", password: "123asdf!ABCD", admin: false, verified: true };
let idJinx: string;

let postID: string;
let postData: PostResource;
const randomID: Types.ObjectId = new Types.ObjectId;

beforeAll(async () => await DB.connect());
beforeEach(async () => {
    await User.syncIndexes();
    const user = await User.create(userJinx);
    idJinx = user.id;

    postData = { content: "This is a test post.", author: user.id, createdAt: new Date(), modified: "" };
    const post = await createPost(postData);
    postID = post.id!;
});
afterEach(async () => await DB.clear());
afterAll(async () => await DB.close());

// ------------------------------------------------------------ getPost -------------------------------------------------------------------

test("GET post", async () => {
    const postTest = await getPost(postID);

    expect(postTest).toBeDefined();
    expect(postTest.id).toStrictEqual(postID);
    expect(postTest.content).toBe("This is a test post.");
    expect(postTest.author).toBe(idJinx);
    expect(postTest.upvotes).toBe(0);
    expect(postTest.downvotes).toBe(0);
});

test("GET post negative", async () => {
    await expect(getPost(randomID.toString())).rejects.toThrow();
});

// ------------------------------------------------------------ updatePost -------------------------------------------------------------------

test("PUT post", async () => {
    const updatedContent = "Updated Test Content";
    const updatedPostData: PostResource = {
        id: postID,
        content: updatedContent,
        author: new Types.ObjectId().toString(),
        upvotes: 5,
        downvotes: 3,
        modified: "",
        createdAt: new Date()
    };
    const updatedPost = await updatePost(updatedPostData);

    expect(updatedPost).toBeDefined();
    expect(updatedPost.id).toBe(postID);
    expect(updatedPost.content).toBe(updatedContent);
    expect(updatedPost.author).toBe(updatedPostData.author);
    expect(updatedPost.upvotes).toBe(updatedPostData.upvotes);
    expect(updatedPost.downvotes).toBe(updatedPostData.downvotes);
    expect(updatedPost.modified).toBe(updatedPostData.modified);

    const searchedPost = await Post.findById(updatedPost.id).exec();
    expect(searchedPost?.id).toBe(updatedPost.id);
});

test("PUT post negative", async () => {
    const updatedContent = "Updated Test Content";
    const updatedPostData: PostResource = {
        content: updatedContent,
        author: new Types.ObjectId().toString(),
        upvotes: 5,
        downvotes: 3,
        modified: "",
        createdAt: new Date(),
    };

    await expect(updatePost(updatedPostData)).rejects.toThrow("Post ID missing, cannot update.");
});

test("PUT post negative with wrong id", async () => {
    const updatedContent = "Updated Test Content";
    const updatedPostData: PostResource = {
        id: "635d2e796ea2e8c9bde5787c",
        content: updatedContent,
        author: new Types.ObjectId().toString(),
        upvotes: 5,
        downvotes: 3,
        modified: "",
        createdAt: new Date()
    };

    await expect(updatePost(updatedPostData)).rejects.toThrow(`Post with ID ${updatedPostData.id} not found.`);
});

// ------------------------------------------------------------ deletePost -------------------------------------------------------------------

test("DELETE post", async () => {
    await deletePost(postID);
    await new Promise(resolve => setTimeout(resolve, 100));

    const deletedPost = await Post.findById(postID);
    
    expect(deletedPost?.content).toBe("This Post has been deleted.");
});

test("DELETE post negative", async () => {
    await expect(deletePost(Types.ObjectId.toString())).rejects.toThrow();
});

test("DELETE post negative with invalid ID", async () => {
    await expect(deletePost("635d2e796ea2e8c9bde5787c")).rejects.toThrow();
});

// ------------------------------------------------------------ upVotePost -------------------------------------------------------------------

test('upvotePost test positive', async () => {
    let umut = await createUser({ name: "Lucy", email: "lucy@gmail.com", password: "Ufoea2e8c9!!", admin: false, verified: true })
    let postData2: PostResource = { content: "Random Content.Yes.", author: umut.id!, upvotes: 20, modified: "", createdAt: new Date()};
    const post2 = await createPost(postData2);
    let threadPage = await ThreadPage.create({ posts: [post2] });

    await upvotePost(threadPage.id!, 0);
    const test = await getThreadPage(threadPage.id!);

    expect(test.posts[0].upvotes!).toBe(21);
});

test('upvotePost test post not found', async () => {
    let umut = await createUser({ name: "Lucy", email: "lucy@gmail.com", password: "Ufoea2e8c9!!", admin: false, verified: true })
    let postData2: PostResource = { content: "Random Content.Yes.", author: umut.id!, upvotes: 20, modified: "", createdAt: new Date() };
    const post2 = await createPost(postData2);
    let threadPage = await ThreadPage.create({ posts: [post2] });

    await expect(upvotePost(threadPage.id!, 1)).rejects.toThrow("Post not found.");
});

test('upvotePost test negative with invalid ID', async () => {
    await expect(upvotePost("635d2e796ea2e8c9bde5787c", 0)).rejects.toThrow("ThreadPage not found.");
});

// ------------------------------------------------------------ downVotePost -------------------------------------------------------------------

test('downvotePost test positive', async () => {
    let umut = await createUser({ name: "Lucy", email: "lucy@gmail.com", password: "Ufoea2e8c9!!", admin: false, verified: true })
    let postData2: PostResource = { content: "Random Content.Yes.", author: umut.id!, downvotes: 8, modified: "", createdAt: new Date() };
    const post2 = await createPost(postData2);
    let threadPage = await ThreadPage.create({ posts: [post2] });

    await downvotePost(threadPage.id!, 0);
    const test = await getThreadPage(threadPage.id!);

    expect(test.posts[0].downvotes!).toBe(7);
});

test('downvotePost test positive', async () => {
    let umut = await createUser({ name: "Lucy", email: "lucy@gmail.com", password: "Ufoea2e8c9!!", admin: false, verified: true })
    let postData2: PostResource = { content: "Random Content.Yes.", author: umut.id!, downvotes: 8, modified: "", createdAt: new Date() };
    const post2 = await createPost(postData2);
    let threadPage = await ThreadPage.create({ posts: [post2] });

    await expect(downvotePost(threadPage.id!, 1)).rejects.toThrow("Post not found.");
});

test('downvotePost test negative with invalid ID', async () => {
    await expect(downvotePost("635d2e796ea2e8c9bde5787c", 0)).rejects.toThrow("ThreadPage not found.");
});
