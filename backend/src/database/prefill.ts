import { Post } from "../endpoints/post/PostModel";
import { Thread } from "../endpoints/thread/ThreadModel";
import { ThreadPage } from "../endpoints/threadpage/ThreadPageModel";
import { User } from "../endpoints/user/UserModel";
import { SubForum } from '../endpoints/subforum/SubForumModel';

let pineappleThreadID: string;

export async function prefillAdmin() {
    const admin = await User.findOne({ email: "admin@husky.de" }).exec();
    if (admin)
        return;
    await User.create({
        email: "admin@husky.de",
        name: "Husky Admin",
        password: "abcABC123!",
        admin: true,
        verified: true
    });
    console.log("Successfully created default admin");
}

export async function prefillSubforums() {
    const forum = await SubForum.findOne({name: "Cuisine"}).exec();
    if (forum)
        return;

    const cuisineForum = await SubForum.create({
        name: "Cuisine",
        description: "blub",
        threads: []
    });
    const historyForum = await SubForum.create({
        name: "History",
        description: "blub",
        threads: []
    });
    const mathematicsForum = await SubForum.create({
        name: "Mathematics",
        description: "blub",
        threads: []
    });
    const philosophyForum = await SubForum.create({
        name: "Philosophy",
        description: "blub",
        threads: []
    });
    const scienceForum = await SubForum.create({
        name: "Science",
        description: "blub",
        threads: []
    });

    console.log("Successfully created subforums");
}

export async function prefillPineappleThread() {
    const pineappleThread = await Thread.findOne({ title: "Pineapple on Pizza" }).exec();
    if (pineappleThread) {
        pineappleThreadID = pineappleThread.id;
        return;
    }

    const alice = await User.create({
        name: "Alice",
        email: "alice@gmail.com",
        password: "abcABC123!",
        verified: true
    });
    const bob = await User.create({
        name: "Bob",
        email: "bob@gmail.com",
        password: "abcABC123!",
        verified: true
    });
    const carl = await User.create({
        name: "Carl",
        email: "carl@gmail.com",
        password: "abcABC123!",
        verified: true
    });

    const post1 = new Post({
        content: "I LOVE pineapple on pizza! I don't know why so many people have a problem with that.\nJust another case of bad people on the internet I suppose :(",
        author: alice.id!
    });
    const post2 = new Post({
        content: "Me too :)\nI think it's greatly underrated!",
        author: bob.id!
    });
    const post3 = new Post({
        content: "You must be joking, right? Pineapple is, without a doubt, one of the most egregious things you could possibly put on pizza. You should be ashamed of yourself!",
        author: carl.id!
    });
    const post4 = new Post({
        content: "What's your problem? If you don't like it, that's okay. But why do you need to attack other people for their preferences?",
        author: alice.id!
    });
    const post5 = new Post({
        content: "I find it nothing short of amazing how rude some people around here can be.\nHow would you feel if we made fun of you for, let's say, you not liking mushrooms?",
        author: bob.id!
    });
    const post6 = new Post({
        content: "Oh please, I beg you! This is hardly comparable at all!\nThe truth of the matter is that there are some ingredients which belong on pizza, and some which do not. And pineapple belongs indisputably to the latter!",
        author: carl.id!
    });
    const post7 = new Post({
        content: "Really, and when did YOU get to decide that?\nPizza is a highly versatile dish and can be combined with a vast number of ingredients, including vegetables, beef, pork, and fish? So why would a fruit be a problem?",
        author: alice.id!
    });
    const post8 = new Post({
        content: "1) I did not need to decide that as it is common sense\n2) Furthermore, since pizza is a savoury dish, it only makes sense to combine it with savoury ingredients. Sweet ingredients such as pineapple have no business here!\n3) To be frank, it is most apparent that you are not particularly educated in the art of cooking!",
        author: carl.id!
    });
    const post9 = new Post({
        content: "What makes you think I am bad at cooking? I have been cooking for years and have partaken in many cooking classes.\nAlso, your argument with the savouriness is shallow! High cuisine is often about combining different flavours such as sweet and salty or sweet and sour.\nWhy should that be a problem on pizza? Could it be that a combination of sweet and salty already marks the end of your culinary horizon?",
        author: alice.id!
    });
    const post10 = new Post({
        content: "That's what I'm thinking as well.",
        author: bob.id!
    });
    const post11 = new Post({
        content: "That would have been a good point if one ignored that fact that pizza can hardly be considered a dish of the 'haute cuisine'. Also, do not even attempt to compare my distinguished taste with a primitive one such as yours!",
        author: carl.id!
    });
    const post12 = new Post({
        content: "Do you talk like that in real life?",
        author: bob.id!
    });
    const post13 = new Post({
        content: "Only to narrow-minded people such as you :)",
        author: carl.id!
    });
    const post14 = new Post({
        content: "YOU are calling ME narrow-minded after you have insulted people for liking pineapple on pizza? You are without a doubt the most oblivious person I have ever met...",
        author: bob.id!
    });
    const post15 = new Post({
        content: "People like you are the reason why people perceive people like us who are passionate about cooking and food as snobbish.",
        author: bob.id!
    });

    const threadPage1 = await ThreadPage.create({
        posts: Array.of(post1, post2, post3, post4, post5, post6, post7, post8, post9, post10)
    });
    const threadPage2 = await ThreadPage.create({
        posts: Array.of(post11, post12, post13, post14, post15)
    });

    const pages = Array.of(threadPage1.id, threadPage2.id);
    const thread = await Thread.create({
        title: "Pineapple on Pizza",
        creator: alice.id,
        creatorName: "Alice",
        subForum: "Cuisine",
        pages: pages,
        numPosts: (pages.length - 1) * 10 + threadPage2.posts.length
    });
    pineappleThreadID = thread.id;

    const cuisineThread = await SubForum.findOne({name: "Cuisine"}).exec();
    cuisineThread?.threads.push(thread);
    await cuisineThread?.save();

    console.log("Successfully created pineapple thread");
}
