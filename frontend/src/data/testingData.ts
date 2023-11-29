import { AuthorResource, PostResource, ThreadPageResource } from "../types/Resources";

export const alice: AuthorResource = { id: "1000061029db5bbef3ba64d", name: "Alice", createdAt: new Date() };
export const bob: AuthorResource = { id: "2000061029db5bbef3ba64d", name: "Bob", createdAt: new Date() };

export const authors: Map<string, AuthorResource> = new Map();
authors.set(alice.id!, alice);
authors.set(bob.id!, bob);

export const post1: PostResource = {
    id: "00001b61029db5bbef3ba64d",
    content: "Ich mag Ananas auf Pizza! Ich weiß nicht, warum alle immer darüber läster, aber mir schmeckt es super.\nIch denke, es gibt einfach Leute, die andern Leuten nichts gönnen wollen :(",
    author: alice.id!, createdAt: new Date()
};
export const post2: PostResource = {
    id: "00002b61029db5bbef3ba64d",
    content: "Ich auch :)\nWie schön mal jemanden gleichgesinntes zu treffen!",
    author: bob.id!, createdAt: new Date()
};

export const threadPage1: ThreadPageResource = { id: "00010b61029db5bbef3ba64d", posts: Array.of(post1, post2) };