import { Post } from "../endpoints/post/PostModel";
import { Thread } from "../endpoints/thread/ThreadModel";
import { ThreadPage } from "../endpoints/threadpage/ThreadPageModel";
import { User } from "../endpoints/user/UserModel";
import { SubForum } from '../endpoints/subforum/SubForumModel';

export async function prefillAdmin() {
    const admin = await User.findOne({ email: "admin@husky.de" }).exec();
    if (admin)
        return;
    await User.create({
        email: "admin@husky.de",
        name: "Husky Admin",
        password: "abcABC123!",
        admin: true
    });
    console.log("Successfully created default admin");
}

export async function prefillPineappleThread() {
    const ananasThread = await Thread.findOne({ title: "Ananas auf Pizza" }).exec();
    if (ananasThread)
        return;

    const alice = await User.create({
        name: "Alice",
        email: "alice@gmail.com",
        password: "abcABC123!"
    });
    const bob = await User.create({
        name: "Bob",
        email: "bob@gmail.com",
        password: "abcABC123!"
    });
    const carlos = await User.create({
        name: "Carlos",
        email: "carlos@gmail.com",
        password: "abcABC123!"
    });

    const post1 = new Post({
        content: "Ich mag Ananas auf Pizza! Ich weiß nicht, warum alle immer darüber läster, aber mir schmeckt es super.\nIch denke, es gibt einfach Leute, die andern Leuten nichts gönnen wollen :(",
        author: alice.id!,
        createdAt: new Date(),
        creationDate: new Date()
    });
    const post2 = new Post({
        content: "Ich auch :)\nWie schön mal jemanden gleichgesinntes zu treffen!",
        author: bob.id!,
        createdAt: new Date(),
        creationDate: new Date()
    });
    const post3 = new Post({
        content: "Ananas auf Pizza? Igitt!\nDas gehört zu den widerlichsten Dingen auf diesem Planeten! Sie sollten sich was schämen!",
        author: carlos.id!,
        createdAt: new Date(),
        creationDate: new Date()
    });
    const post4 = new Post({
        content: "Was ist ihr Problem? Wenn es Ihnen nicht schmeckt, dann ist das völlig okay.\nAber warum müssen Sie andere Leute dafür gleich angreifen?",
        author: alice.id!,
        createdAt: new Date(),
        creationDate: new Date()
    });
    const post5 = new Post({
        content: "Ja, wie kann man nur so unsensibel sein!\nWie würden sie sich fühlen, wenn wir uns darüber lustig machen würden, dass Sie beispielsweise keine Pilze mögen?",
        author: bob.id!,
        createdAt: new Date(),
        creationDate: new Date()
    });
    const post6 = new Post({
        content: "Ich bitte Sie, das kann man doch überhaupt nicht miteinander vergleichen!\nEs gibt nunmal Dinge, die auf eine Pizza gehören, und Dinge, die nicht darauf gehören. Und die Ananas gehört nunmal zu letzterem!",
        author: carlos.id!,
        createdAt: new Date(),
        creationDate: new Date()
    });
    const post7 = new Post({
        content: "Ach, ist das so? Seit wann sind Sie denn derjenige, der das zu entscheiden hat?\nPizza ist eine Spezialität, die man überaus divers belegen kann, unter anderem mit vielerlei Arten von Fleisch, Fisch, Käse und Gemüse.\nWarum also nicht auch Früchte? Zumal ja Meeresfrüchte auf Pizza zu den Klassikern gehört.",
        author: alice.id!,
        createdAt: new Date(),
        creationDate: new Date()
    });
    const post8 = new Post({
        content: "1) Das habe nicht ich entschieden, sondern die Weltöffentlichkeit\n2) Da die Pizza ein herzhaftes Gericht ist, macht es nur Sinn, sie auch mit herzhaften Zutaten zu belegen. Eine süße Zutat wie die Frucht der Ananas hat hier nichts zu suchen!\n3) Früchte mit Meeresfrüchten zu vergleichen ist, als würde man Autos mit U-Booten vergleichen. Man merkt, dass Sie in der Thematik nicht sehr bewandert sind.",
        author: carlos.id!,
        createdAt: new Date(),
        creationDate: new Date()
    });
    const post9 = new Post({
        content: "Wie kommen Sie darauf, dass ich mich mit dem Kochen nicht auskenne? Ich koche seit vielen Jahren leidenschaftlich und habe viele Kochkurse besucht!\nDer Unterschied zwischen Früchten und Meeresfrüchten ist mir durchaus bewusst, mir ging es nur darum, ein Beispiel von einer Zutat zu geben, die etwas ungewöhnlicher ist.\nUnd Ihr Argument mit der Herzhaftigkeit hinkt! In der Kulinarik geht es oft darum, mehrere Geschmacksrichtungen miteinander zu verbinden, wie eben zum Beispiel süß und salzig.\nWarum sollte das auf Pizza nicht erlaubt sein? Oder übersteigt das vielleicht einfach nur Ihren kulinarischen Horizont?",
        author: alice.id!,
        createdAt: new Date(),
        creationDate: new Date()
    });
    const post10 = new Post({
        content: "Das mit dem Horizont kann ich mir bei ihm gut vorstellen...",
        author: bob.id!,
        createdAt: new Date(),
        creationDate: new Date()
    });

    const threadPage1 = await ThreadPage.create({
        posts: Array.of(post1, post2, post3, post4, post5, post6, post7, post8, post9, post10)
    });
    const threadPage2 = await ThreadPage.create({
        posts: Array.of(post1, post2, post3, post4, post5, post6, post7, post8, post9, post10)
    });
    const threadPage3 = await ThreadPage.create({
        posts: Array.of(post1, post2, post3, post4, post5)
    });

    const t = await Thread.create({
        title: "Ananas auf Pizza",
        creator: alice.id,
        creatorName: "Alice",
        subForum: "Essen und Trinken",
        pages: Array.of(threadPage1.id, threadPage2.id, threadPage3.id)
    });

    const page = await ThreadPage.findById(t!.pages[0]).exec();

    console.log("Successfully created pineapple thread");
}

export async function prefillSubforums() {
    const sebastianUser = await User.findOne({ email: "sebastian@gmail.com" }).exec();
    if (sebastianUser)
        return;

    const sebastian = await User.create({
        name: "Sebastian",
        email: "sebastian@gmail.com",
        password: "abcABC123!"
    });
    const post1 = new Post({
        content: "Ich mag Ananas auf Pizza! Ich weiß nicht, warum alle immer darüber läster, aber mir schmeckt es super.\nIch denke, es gibt einfach Leute, die andern Leuten nichts gönnen wollen :(",
        author: sebastian.id!,
        createdAt: new Date(),
        creationDate: new Date()
    });
    const post2 = new Post({
        content: "Ich auch :)\nWie schön mal jemanden gleichgesinntes zu treffen!",
        author: sebastian.id!,
        createdAt: new Date(),
        creationDate: new Date()
    });
    const threadPage = await ThreadPage.create({
        posts: Array.of(post1, post2)
    });
    const thread = await Thread.create({
        title: "Ananas auf Pizza",
        creator: sebastian.id,
        creatorName: "Sebastian",
        subForum: "Essen und Trinken",
        pages: [threadPage.id]
    });
    const foodForum = await SubForum.create({
        name: "Essen und Trinken",
        description: "blub",
        threads: [thread.id]
    });
    const cuisineForum = await SubForum.create({
        name: "Cuisine",
        description: "blub",
        threads: [thread.id]
    });
    const scienceForum = await SubForum.create({
        name: "Science",
        description: "blub",
        threads: [thread.id]
    });
}
