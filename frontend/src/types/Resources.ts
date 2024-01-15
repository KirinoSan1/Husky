export type LoginResource = {
    "access_token": string
    "token_type": "Bearer"
};

export type UserResource = {
    id: string
    name: string
    email: string
    admin: boolean
    mod: boolean
    createdAt: Date
    avatar: string
    file: File
    votedPosts: Map<string, boolean>
};

export type AuthorResource = {
    id: string
    name: string
    admin: boolean
    mod: boolean
    createdAt: Date
    avatar: string
};

export type AuthorsResource = {
    authors: Array<AuthorResource>
};

export type SubforumResource = {
    name: string,
    description: string
};

export type PostResource = {
    id: string
    content: string
    author: string
    modified: "" | "m" | "d"
    upvotes: number
    downvotes: number
    createdAt: Date
};

export type ThreadPageResource = {
    id: string,
    posts: PostResource[],
    createdAt: Date
};

export type ThreadResource = {
    id: string
    title: string
    creator: string
    creatorName: string
    subForum: string
    numPosts: number
    pages: string[]
    createdAt: Date
};

export type SubForumName = "" | "Cuisine" | "History" | "Mathematics" | "Philosophy" | "Science";