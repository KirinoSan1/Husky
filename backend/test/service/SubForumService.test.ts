import mongoose, { Types } from "mongoose"
import DB from "../TestDB";
import { createThread } from "../../src/endpoints/thread/ThreadService";
import { ThreadPage } from "../../src/endpoints/threadpage/ThreadPageModel";
import { IUser, User } from "../../src/endpoints/user/UserModel"
import { Post } from "../../src/endpoints/post/PostModel";
import { SubForumResource, ThreadResource } from "../../src/types/Resources";
import { createSubForum, deleteSubForum, getAllThreadsForSubForum, getLatestThreadsFromSubForums, getSubForum, updateSubForum } from "../../src/endpoints/subforum/SubForumService";
import { SubForum } from "../../src/endpoints/subforum/SubForumModel";
import { Thread } from "../../src/endpoints/thread/ThreadModel";

let jinxData: IUser = { email: "Jinx@gmail.com", name: "Jinx", password: "123", admin: false }
let idJinx: string
const NON_EXISTING_ID = "635d2e796ea2e8c9bde5787c";

beforeAll(async () => await DB.connect())
beforeEach(async () => {
    await User.syncIndexes()
    const jinx = await User.create(jinxData)
    idJinx = jinx.id;
})
afterEach(async () => await DB.clear())
afterAll(async () => await DB.close())

test("Creates a new Thread and added to an Subforum returns it", async () => {
    const post = await Post.create({
        content: "Test.",
        author: idJinx,
        createdAt: new Date()
    });
    const post2 = await Post.create({
        content: "Test.",
        author: idJinx,
        createdAt: new Date()
    });
    let postid = post.id
    let post2id = post2.id
    const threadpage = await ThreadPage.create({ postid, post2id })
    const thread: ThreadResource = ({
        creator: idJinx,
        title: "Thread",
        subForum: "Testing",
        pages: [threadpage.id!],
        numPosts: 2,
    });

    const res = await createThread(thread);
    const newSubForum: SubForumResource = {
        name: "New SubForum",
        description: "Description for the new SubForum",
        threads: [new Types.ObjectId(res.id!)]
    };

    const forum = await createSubForum(newSubForum)
    expect(forum.description).toBe("Description for the new SubForum")
    expect(forum.threads[0].toString()).toBe(newSubForum.threads[0].toString())
})

test("Get all threads for a subforum with a limit", async () => {
    const subForumName = "Testing";
    const count = 5;

    await Thread.create([
        {
            title: "Thread 1",
            creator: new mongoose.Types.ObjectId(),
            subForum: subForumName,
            pages: [],
            createdAt: new Date()
        },
        {
            title: "Thread 2",
            creator: new mongoose.Types.ObjectId(),
            subForum: subForumName,
            pages: [],
            createdAt: new Date()
        },
        {
            title: "Thread 3",
            creator: new mongoose.Types.ObjectId(),
            subForum: subForumName,
            pages: [],
            createdAt: new Date()
        }
    ]);

    const threads = await getAllThreadsForSubForum(subForumName, count);

    expect(Array.isArray(threads)).toBe(true);
    expect(threads.length).toBe(3); // Asserts the number of returned threads matches the count
});

test("Get all threads for a subforum without a limit", async () => {
    const subForumName = "Testing";

    await Thread.create([
        {
            title: "Thread 1",
            creator: new mongoose.Types.ObjectId(),
            subForum: subForumName,
            pages: [],
            createdAt: new Date()
        },
        {
            title: "Thread 2",
            creator: new mongoose.Types.ObjectId(),
            subForum: subForumName,
            pages: [],
            createdAt: new Date()
        },
        {
            title: "Thread 3",
            creator: new mongoose.Types.ObjectId(),
            subForum: subForumName,
            pages: [],
            createdAt: new Date()
        }
    ]);

    const threads = await getAllThreadsForSubForum(subForumName);
    expect(Array.isArray(threads)).toBe(true);
});

test("Get latest threads from specified subforums", async () => {
    const subForumNames2 = ["Thread", "Thread2"];
    const threadCount = 5;

    const post = await Post.create({
        content: "Test.",
        author: idJinx,
        createdAt: new Date()
    });
    const post2 = await Post.create({
        content: "Test.",
        author: idJinx,
        createdAt: new Date()
    });
    let postid = post.id
    let post2id = post2.id
    const threadpage = await ThreadPage.create({ postid, post2id })

    const thread: ThreadResource = ({ creator: idJinx, title: "Thread11", subForum: "Thread", pages: [threadpage.id!], numPosts: 2 });
    const thread2: ThreadResource = ({ creator: idJinx, title: "Thread22", subForum: "Thread", pages: [threadpage.id!], numPosts: 2 });
    const thread3: ThreadResource = ({ creator: idJinx, title: "Thread33", subForum: "Thread", pages: [threadpage.id!], numPosts: 2 });
    const thread4: ThreadResource = ({ creator: idJinx, title: "Thread44", subForum: "Thread2", pages: [threadpage.id!], numPosts: 2 });
    const thread5: ThreadResource = ({ creator: idJinx, title: "Thread55", subForum: "Thread2", pages: [threadpage.id!], numPosts: 2 });
    const thread6: ThreadResource = ({ creator: idJinx, title: "Thread66", subForum: "Thread2", pages: [threadpage.id!], numPosts: 2 });

    await Thread.create(thread);
    await Thread.create(thread2);
    await Thread.create(thread3);
    await Thread.create(thread4);
    await Thread.create(thread5);
    await Thread.create(thread6);

    const subForum1: SubForumResource = { name: "Thread", description: "Description for the new SubForum", threads: [new Types.ObjectId(thread.id!), new Types.ObjectId(thread2.id!), new Types.ObjectId(thread3.id!)] };
    const subForum2: SubForumResource = { name: "Thread2", description: "Description for the new SubForum 2", threads: [new Types.ObjectId(thread4.id!), new Types.ObjectId(thread5.id!), new Types.ObjectId(thread6.id!)] };

    const forum = await createSubForum(subForum1)
    const forum2 = await createSubForum(subForum2)

    const latestThreads = await getLatestThreadsFromSubForums(subForumNames2, threadCount);

    expect(Array.isArray(latestThreads)).toBe(true);

    for (let i = 0; i < latestThreads.length - 1; i++) {
        const currentThreadCreatedAt = new Date(latestThreads[i].createdAt!);
        const nextThreadCreatedAt = new Date(latestThreads[i + 1].createdAt!);

        expect(currentThreadCreatedAt.getTime()).toBeGreaterThanOrEqual(nextThreadCreatedAt.getTime());
    }
});

test("Creates a new Thread and added to an Subforum returns it", async () => {
    const post = await Post.create({
        content: "Test.",
        author: idJinx,
        createdAt: new Date()
    });
    const post2 = await Post.create({
        content: "Test.",
        author: idJinx,
        createdAt: new Date()
    });
    let postid = post.id
    let post2id = post2.id
    const threadpage = await ThreadPage.create({ postid, post2id })
    const thread: ThreadResource = ({
        creator: idJinx,
        title: "Thread",
        subForum: "Testing",
        pages: [threadpage.id!],
        numPosts: 2,
    });

    const thread2: ThreadResource = ({
        creator: idJinx,
        title: "Thread2",
        subForum: "Testing",
        pages: [threadpage.id!],
        numPosts: 2,
    });

    const res = await createThread(thread);
    const res1 = await createThread(thread2);
    const newSubForum: SubForumResource = {
        name: "New SubForum",
        description: "Description for the new SubForum",
        threads: [new Types.ObjectId(res.id!)]
    };

    const forum = await createSubForum(newSubForum)
    const updateSub: SubForumResource = {
        id: forum.id,
        name: "Updated SubForum",
        description: "This is an Update",
        threads: [new Types.ObjectId(res.id!), new Types.ObjectId(res1.id)]
    };
    const newSub = await updateSubForum(updateSub)
    const search = await SubForum.findById(forum.id).exec()
    expect(search?.description).toBe("This is an Update")
    expect(search?.threads.toString()).toEqual([res.id, res1.id].toString())
})

test("Creates a new Thread and get the an Subforum with name.", async () => {
    const post = await Post.create({
        content: "Test.",
        author: idJinx,
        createdAt: new Date()
    });
    const post2 = await Post.create({
        content: "Test.",
        author: idJinx,
        createdAt: new Date()
    });
    let postid = post.id
    let post2id = post2.id
    const threadpage = await ThreadPage.create({ postid, post2id })
    const thread: ThreadResource = ({
        creator: idJinx,
        title: "Thread",
        subForum: "Testing",
        pages: [threadpage.id!],
        numPosts: 2,
    });

    const thread2: ThreadResource = ({
        creator: idJinx,
        title: "Thread2",
        subForum: "Testing",
        pages: [threadpage.id!],
        numPosts: 2,
    });

    const res = await createThread(thread);
    const res1 = await createThread(thread2);
    const newSubForum: SubForumResource = {
        name: "New SubForum",
        description: "Description for the new SubForum",
        threads: [new Types.ObjectId(res.id!)]
    };

    const forum = await createSubForum(newSubForum)
    const updateSub: SubForumResource = {
        id: forum.id,
        name: "Updated SubForum",
        description: "This is an Update",
        threads: [new Types.ObjectId(res.id!), new Types.ObjectId(res1.id)]
    };
    const result = await getSubForum("New SubForum")
    expect(result.description).toBe(forum.description)
    expect(result.name).toBe(forum.name)
    expect(result.threads.toString()).toBe(forum.threads.toString())
    const newSub = await updateSubForum(updateSub)
    const result1 = await getSubForum("Updated SubForum")
    expect(result1.description).toBe(newSub.description)
    expect(result1.name).toBe(newSub.name)
    expect(result1.threads.toString()).toBe(newSub.threads.toString())
})

test("Creates a new Thread and added to an Subforum returns negative it", async () => {
    const post = await Post.create({
        content: "Test.",
        author: idJinx,
        createdAt: new Date()
    });
    const post2 = await Post.create({
        content: "Test.",
        author: idJinx,
        createdAt: new Date()
    });
    let postid = post.id
    let post2id = post2.id
    const threadpage = await ThreadPage.create({ postid, post2id })
    const thread: ThreadResource = ({
        creator: idJinx,
        title: "Thread",
        subForum: "Testing",
        pages: [threadpage.id!],
        numPosts: 2,
    });

    const thread2: ThreadResource = ({
        creator: idJinx,
        title: "Thread2",
        subForum: "Testing",
        pages: [threadpage.id!],
        numPosts: 2,
    });

    const res = await createThread(thread);
    const res1 = await createThread(thread2);
    const newSubForum: SubForumResource = {
        name: "New SubForum",
        description: "Description for the new SubForum",
        threads: [new Types.ObjectId(res.id!)]
    };

    const forum = await createSubForum(newSubForum)
    const updateSub: SubForumResource = {
        id: NON_EXISTING_ID,
        name: "Updated SubForum",
        description: "This is an Update",
        threads: [new Types.ObjectId(res.id!), new Types.ObjectId(res1.id)]
    };

    await expect(updateSubForum(updateSub)).rejects.toThrow("The Subforum with the id 635d2e796ea2e8c9bde5787c does not exist.")
})

test("Creates a new Thread and added to an Subforum then delete it", async () => {
    const post = await Post.create({
        content: "Test.",
        author: idJinx,
        createdAt: new Date()
    });
    const post2 = await Post.create({
        content: "Test.",
        author: idJinx,
        createdAt: new Date()
    });
    let postid = post.id
    let post2id = post2.id
    const threadpage = await ThreadPage.create({ postid, post2id })
    const thread: ThreadResource = ({
        creator: idJinx,
        title: "Thread",
        subForum: "Testing",
        pages: [threadpage.id!],
        numPosts: 2,
    });

    const thread2: ThreadResource = ({
        creator: idJinx,
        title: "Thread2",
        subForum: "Testing",
        pages: [threadpage.id!],
        numPosts: 2,
    });

    const res = await createThread(thread);
    const res1 = await createThread(thread2);
    const newSubForum: SubForumResource = {
        name: "New SubForum",
        description: "Description for the new SubForum",
        threads: [new Types.ObjectId(res.id!)]
    };

    const forum = await createSubForum(newSubForum)
    const deletes = await deleteSubForum(forum.id!)
    const found = await SubForum.findById(forum.id)
    expect(found).toBeNull()
})