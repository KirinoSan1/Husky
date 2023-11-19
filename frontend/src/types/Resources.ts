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