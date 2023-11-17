// export type UsersResource = {
//     users: UserResource[]
// } 

export type UserResource = {
    id?: string
    name: string
    email: string
    password?: string
    admin?: boolean
    mod?: boolean
    createdAt?: Date
}

export type LoginResource = {
    /** The JWT */
    "access_token": string,
    /** Constant value */
    "token_type": "Bearer"
}

// Should Author be String or an ID?
export type PostResource = {
    id?:string
    content: string
    author: string
    upvotes?: number
    downvotes?: number
    createdAt?: Date
}