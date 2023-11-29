export type LoginResource = {
    "access_token": string
    "token_type": "Bearer"
}

export type UserResource = {
    id?: string
    name: string
    email: string
    password?: string
    admin?: boolean
    mod?: boolean
    createdAt?: Date
}

export type AuthorResource = {
    id?: string
    name: string
    admin?: boolean
    mod?: boolean
    createdAt: Date
}

export type PostResource = {
    id?: string
    content: string
    author: string
    createdAt: Date
}