import DB from "../TestDB";
import { Types } from "mongoose"
import { createThread } from "../../src/endpoints/thread/ThreadService";
import { ThreadPage } from "../../src/endpoints/threadpage/ThreadPageModel";
import { IUser, User } from "../../src/endpoints/user/UserModel"
import { Post } from "../../src/endpoints/post/PostModel";
import { SubForumResource, ThreadResource } from "../../src/types/Resources";
import { createSubForum, deleteSubForum, getAllSubForums, getAllThreadsForSubForum, getLatestThreadsFromSubForums, getSubForum, updateSubForum } from "../../src/endpoints/subforum/SubForumService";
import { SubForum } from "../../src/endpoints/subforum/SubForumModel";
import { Thread } from "../../src/endpoints/thread/ThreadModel";

let userJinx: IUser = { email: "Jinx@gmail.com", name: "Jinx", password: "123", admin: false, verified: true, votedPosts: new Map() }
let idJinx: string;
const NON_EXISTING_ID = "635d2e796ea2e8c9bde5787c";

beforeAll(async () => await DB.connect());
beforeEach(async () => {
    await User.syncIndexes();
    const jinx = await User.create(userJinx);
    idJinx = jinx.id;
})
afterEach(async () => await DB.clear());
afterAll(async () => await DB.close());

// ------------------------------------------------------------ getSubForum -------------------------------------------------------------------

test("GET subforum, Creates a new Thread and get the an Subforum with name", async () => {
    const post = await Post.create({ content: "Test.", author: idJinx, createdAt: new Date() });
    const post2 = await Post.create({ content: "Test.", author: idJinx, createdAt: new Date() });
    let postid = post.id;
    let post2id = post2.id;

    await SubForum.create({
        name: "computer science",
        description: "geek stuff",
        threads: []
    });

    const threadpage = await ThreadPage.create({ postid, post2id })
    const thread: ThreadResource = ({
        creator: idJinx,
        title: "Thread",
        subForum: "computer science",
        pages: [threadpage.id!],
        numPosts: 2
    });

    const thread2: ThreadResource = ({
        creator: idJinx,
        title: "Thread2",
        subForum: "computer science",
        pages: [threadpage.id!],
        numPosts: 2
    });

    const res = await createThread(thread);
    const res1 = await createThread(thread2);
    const newSubForum: SubForumResource = {
        name: "New SubForum",
        description: "Description for the new SubForum",
        threads: [new Types.ObjectId(res.id!)]
    };

    const forum = await createSubForum(newSubForum);
    const updateSub: SubForumResource = {
        id: forum.id,
        name: "Updated SubForum",
        description: "This is an Update",
        threads: [new Types.ObjectId(res.id!), new Types.ObjectId(res1.id)]
    };
    const result = await getSubForum("New SubForum");

    expect(result.description).toBe(forum.description);
    expect(result.name).toBe(forum.name);
    expect(result.threads.toString()).toBe(forum.threads.toString());

    const newSub = await updateSubForum(updateSub);
    const result1 = await getSubForum("Updated SubForum");

    expect(result1.description).toBe(newSub.description);
    expect(result1.name).toBe(newSub.name);
    expect(result1.threads.toString()).toBe(newSub.threads.toString());
});

// ------------------------------------------------------------ getAllSubForums -------------------------------------------------------------------

test("getAllSubForums - Get all subforums", async () => {
    const subForumsData = [
        { name: "Subforum 1", description: "Description for Subforum 1", threads: [] },
        { name: "Subforum 2", description: "Description for Subforum 2", threads: [] },
        { name: "Subforum 3", description: "Description for Subforum 3", threads: [] }
    ];
    const createdSubForums = await Promise.all(subForumsData.map(subForum => createSubForum(subForum)));
    const allSubForums = await getAllSubForums();

    expect(allSubForums.length).toBe(subForumsData.length);

    createdSubForums.forEach((subForum, index) => {
        expect(allSubForums[index].name).toBe(subForum.name);
        expect(allSubForums[index].description).toBe(subForum.description);
    });
});

// ----------------------------------------------------- getAllThreadsForSubForum -----------------------------------------------------------------

test("getAllThreadsForSubForum - Get all threads for a subforum with a limit", async () => {
    const subForum = await SubForum.create({ name: "Testing Subforum", description: "This is a test.", threads: [] });
    const count = 5;

    const createdThreads = await Thread.create([
        {
            title: "Thread 1",
            creator: idJinx,
            subForum: subForum.name,
            pages: [],
            createdAt: new Date()
        },
        {
            title: "Thread 2",
            creator: idJinx,
            subForum: subForum.name,
            pages: [],
            createdAt: new Date()
        },
        {
            title: "Thread 3",
            creator: idJinx,
            subForum: subForum.name,
            pages: [],
            createdAt: new Date()
        }
    ]);
    const newThreadIds = createdThreads.map(thread => thread._id);

    subForum.threads.push(...newThreadIds);
    await subForum.save();

    const threads = await getAllThreadsForSubForum(subForum.name, count);

    expect(Array.isArray(threads)).toBe(true);
    expect(threads.length).toBe(3);
});

test("getAllThreadsForSubForum - Get all threads for a subforum without a limit", async () => {
    const subForum = await SubForum.create({ name: "Testing Subforum", description: "This is a test.", threads: [] });

    const createdThreads = await Thread.create([
        {
            title: "Thread 1",
            creator: idJinx,
            subForum: subForum.name,
            pages: [],
            createdAt: new Date()
        },
        {
            title: "Thread 2",
            creator: idJinx,
            subForum: subForum.name,
            pages: [],
            createdAt: new Date()
        },
        {
            title: "Thread 3",
            creator: idJinx,
            subForum: subForum.name,
            pages: [],
            createdAt: new Date()
        }
    ]);
    const newThreadIds = createdThreads.map(thread => thread._id);

    subForum.threads.push(...newThreadIds);
    await subForum.save();

    const threads = await getAllThreadsForSubForum(subForum.name);

    expect(Array.isArray(threads)).toBe(true);
});

test("getAllThreadsForSubForum - Creates a new Thread and added to an Subforum returns it", async () => {
    const subForum = await SubForum.create({ name: "Sample Subforum", description: "sample", threads: [] });

    const post = await Post.create({
        content: "Test.",
        author: idJinx,
        createdAt: new Date()
    });

    const threadPromises: Promise<ThreadResource>[] = [];
    for (let i = 0; i < 10; i++) {
        const thread: ThreadResource = {
            creator: idJinx,
            title: `Thread ${i + 1}`,
            subForum: 'Sample Subforum',
            pages: [],
            numPosts: 0
        };
        threadPromises.push(createThread(thread));
    }
    const createdThreads = await Promise.all(threadPromises);
    const threadIds = createdThreads.map(thread => new Types.ObjectId(thread.id!));
    const subforum = await SubForum.create({ name: "Sample Subforum 2", description: "Test", threads: threadIds });
    subforum.threads.map(thread => new Types.ObjectId(thread.id!));
    await updateSubForum(subforum);

    const fetchedThreads = await getAllThreadsForSubForum("Sample Subforum 2", 5);

    expect(fetchedThreads.length).toBe(5);
});

test("getAllThreadsForSubForum - No user found", async () => {
    const subForum = await SubForum.create({
        name: "Testing Subforum",
        description: "geek stuff",
        threads: []
    });

    const threadWithNonExistingUser = {
        title: "Thread with Non-existing User",
        creator: NON_EXISTING_ID,
        subForum: "computer science",
        pages: [],
        numPosts: 0,
        createdAt: new Date()
    };
    const createdThread = await Thread.create(threadWithNonExistingUser);

    try {
        await updateSubForum({ name: "Testing Subforum", description: "This is a test.", threads: [new Types.ObjectId(createdThread.id)], id: subForum.id });
        await expect(getAllThreadsForSubForum(subForum.name)).rejects.toThrow();
        // expect(Array.isArray(threads)).toBe(true);

        // const threadWithoutCreator = threads.find(thread => thread.id === createdThread.id);
        // expect(threadWithoutCreator?.creatorName).toBeUndefined();
    } catch (error) {
        expect(error).toBeUndefined(); // If an error occurs, it should not reach this point
    }
});

// ----------------------------------------------------- getLatestThreadsFromSubForums -----------------------------------------------------------------

test("getLatestThreadsFromSubForums - get threads from specified subforums", async () => {

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

    const subForum1 = await createSubForum({ name: "Thread", description: "Description for the new SubForum", threads: [] });
    const subForum2 = await createSubForum({ name: "Thread2", description: "Description for the new SubForum 2", threads: [] });

    await Thread.create(thread);
    await Thread.create(thread2);
    await Thread.create(thread3);
    await Thread.create(thread4);
    await Thread.create(thread5);
    await Thread.create(thread6);

    await updateSubForum({ name: "Thread", description: "Description for the new SubForum", threads: [new Types.ObjectId(thread.id!), new Types.ObjectId(thread2.id!), new Types.ObjectId(thread3.id!)], id: subForum1.id });
    await updateSubForum({ name: "Thread2", description: "Description for the new SubForum 2", threads: [new Types.ObjectId(thread4.id!), new Types.ObjectId(thread5.id!), new Types.ObjectId(thread6.id!)], id: subForum2.id });

    const latestThreads = await getLatestThreadsFromSubForums(threadCount, subForumNames2.length);

    expect(Array.isArray(latestThreads)).toBe(true);

    for (let i = 0; i < latestThreads.length - 1; i++) {
        const currentThreadCreatedAt = new Date(latestThreads[i].createdAt!);
        const nextThreadCreatedAt = new Date(latestThreads[i + 1].createdAt!);
        expect(currentThreadCreatedAt.getTime()).toBeGreaterThanOrEqual(nextThreadCreatedAt.getTime());
    }
});

// ----------------------------------------------------- createSubForum -----------------------------------------------------------------

test("POST subforum, Creates a new Thread and added to an Subforum returns it", async () => {
    const post = await Post.create({ content: "Test.", author: idJinx, createdAt: new Date() });
    const post2 = await Post.create({ content: "Test.", author: idJinx, createdAt: new Date() });
    let postid = post.id;
    let post2id = post2.id;

    await SubForum.create({
        name: "computer science",
        description: "geek stuff",
        threads: []
    });

    const threadpage = await ThreadPage.create({ postid, post2id });
    const thread: ThreadResource = ({
        creator: idJinx,
        title: "Thread",
        subForum: "computer science",
        pages: [threadpage.id!],
        numPosts: 2
    });

    const res = await createThread(thread);
    const newSubForum: SubForumResource = {
        name: "New SubForum",
        description: "Description for the new SubForum",
        threads: [new Types.ObjectId(res.id!)]
    };
    const forum = await createSubForum(newSubForum);

    expect(forum.description).toBe("Description for the new SubForum");
    expect(forum.threads[0].toString()).toBe(newSubForum.threads[0].toString());
});

// ---------------------------------------------------------- updateSubForum -------------------------------------------------------------------

test("PUT subforum, updates a subforum", async () => {
    const post = await Post.create({ content: "Test.", author: idJinx, createdAt: new Date() });
    const post2 = await Post.create({ content: "Test.", author: idJinx, createdAt: new Date() });
    let postid = post.id;
    let post2id = post2.id;

    await SubForum.create({
        name: "computer science",
        description: "geek stuff",
        threads: []
    });

    await SubForum.create({
        name: "Testing",
        description: "descr",
        threads: []
    });

    const threadpage = await ThreadPage.create({ postid, post2id });
    const thread: ThreadResource = ({
        creator: idJinx,
        title: "Thread",
        subForum: "computer science",
        pages: [threadpage.id!],
        numPosts: 2
    });

    const thread2: ThreadResource = ({
        creator: idJinx,
        title: "Thread2",
        subForum: "Testing",
        pages: [threadpage.id!],
        numPosts: 2
    });

    const res = await createThread(thread);
    const res1 = await createThread(thread2);

    const newSubForum: SubForumResource = {
        name: "New SubForum",
        description: "Description for the new SubForum",
        threads: [new Types.ObjectId(res.id!)]
    };

    const forum = await createSubForum(newSubForum);
    const updateSubforum: SubForumResource = {
        id: forum.id,
        name: "Updated SubForum",
        description: "This is an Update",
        threads: [new Types.ObjectId(res.id!), new Types.ObjectId(res1.id)]
    };
    const newSub = await updateSubForum(updateSubforum);
    const searchSubforum = await SubForum.findById(forum.id).exec();

    expect(searchSubforum?.description).toBe("This is an Update");
    expect(searchSubforum?.threads.toString()).toEqual([res.id, res1.id].toString());
});

test("PUT subforum negative, Creates a new Thread and added to an Subforum", async () => {
    const post = await Post.create({ content: "Test.", author: idJinx, createdAt: new Date() });
    const post2 = await Post.create({ content: "Test.", author: idJinx, createdAt: new Date() });
    let postid = post.id;
    let post2id = post2.id;

    await SubForum.create({
        name: "Testing",
        description: "description",
        threads: []
    });

    const threadpage = await ThreadPage.create({ postid, post2id });
    const thread: ThreadResource = ({
        creator: idJinx,
        title: "Thread",
        subForum: "Testing",
        pages: [threadpage.id!],
        numPosts: 2
    });

    const thread2: ThreadResource = ({
        creator: idJinx,
        title: "Thread2",
        subForum: "Testing",
        pages: [threadpage.id!],
        numPosts: 2
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

    await expect(updateSubForum(updateSub)).rejects.toThrow("The Subforum with the ID 635d2e796ea2e8c9bde5787c does not exist.");
});

// ---------------------------------------------------------- deleteSubForum -------------------------------------------------------------------

test("DELETE subforum", async () => {
    const post = await Post.create({ content: "Test.", author: idJinx, createdAt: new Date() });
    const post2 = await Post.create({ content: "Test.", author: idJinx, createdAt: new Date() });
    let postid = post.id;
    let post2id = post2.id;

    await SubForum.create({
        name: "Testing",
        description: "testing",
        threads: []
    });

    const threadpage = await ThreadPage.create({ postid, post2id });
    const thread: ThreadResource = ({
        creator: idJinx,
        title: "Thread",
        subForum: "Testing",
        pages: [threadpage.id!],
        numPosts: 2
    });

    const thread2: ThreadResource = ({
        creator: idJinx,
        title: "Thread2",
        subForum: "Testing",
        pages: [threadpage.id!],
        numPosts: 2
    });

    const res = await createThread(thread);
    const res1 = await createThread(thread2);
    const newSubForum: SubForumResource = {
        name: "New SubForum",
        description: "Description for the new SubForum",
        threads: [new Types.ObjectId(res.id!)]
    };
    const forum = await createSubForum(newSubForum);
    const deletes = await deleteSubForum(forum.id!);
    const found = await SubForum.findById(forum.id);

    expect(found).toBeNull();
});
