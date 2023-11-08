/** 
 * export type UsersResource = {
    * users: UserResource[]
 * } 
*/

export type UserResource = {
    id?: string
    name: string
    email: string
    password: string
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