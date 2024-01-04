import { Types } from "mongoose"
import { IPost } from "../endpoints/post/PostModel"

export type UserResource = {
    avatar?: string
    id?: string
    name: string
    email: string
    password?: string
    admin?: boolean
    mod?: boolean
    createdAt?: Date
    verified?: Boolean
    votedPosts?: Array<{postID: string, vote: boolean}>
}

export type ThreadResource = {
    id?: string
    title: string
    creator: string
    subForum: string
    numPosts?: number
    pages: Types.ObjectId[]
    createdAt?: string
}

export type ThreadPageResource = {
    id?: string,
    posts: IPost[],
    createdAt?: Date
}

export type SubForumResource = {
    id?: string,
    name: string,
    threads: Types.ObjectId[]
    description?: string
}

export type PostResource = {
    id?: string
    content: string
    author: string
    upvotes?: number
    downvotes?: number
    modified: "" | "m" | "d"
    createdAt?: Date
}

export type AuthorResource = {
    id: string
    name: string
    admin: boolean
    mod: boolean
    createdAt: Date
    avatar: string
}

export type AuthorsResource = {
    authors: Array<AuthorResource>
}

export type LoginResource = {
    /** The JWT */
    "access_token": string,
    /** Constant value */
    "token_type": "Bearer"
}
