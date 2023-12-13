import { Model, model, Query, Schema } from "mongoose";
//import bcrypt from "bcrypt-ts"
import { hash, compare } from "bcryptjs";

/**
 * Interface with the appointed properties
 */
export interface IUser {
    name: string
    email: string
    password: string
    admin?: boolean
    mod?: boolean
    createdAt?: Date
    avatar? : string
}

/**
 * Interface contains instance methods of the user document from the schema.
 */
export interface IUserMethods {
    isPasswordCorrect(c: string): Promise<boolean>
}

/**
* Definition the 'UserModel' type for the database model that includes 
* user properties (IUser) and instance methods (IUserMethods).
*/
type UserModel = Model<IUser, {}, IUserMethods>

const userSchema = new Schema<IUser, IUserMethods>({
    name: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    mod: { type: Boolean, default: false },
    admin: { type: Boolean, default: false },
    avatar: {type: String, default: "" },
    createdAt: { type: Date }

}, { timestamps: true })

/**
* Compares the passowrd of the user with the hashed passwordCandidate.
* If the passwords are not equal, the promise will not be fullfilled.
* If the passwords are equal, the promise will be fullfilled.
*
* @throws an Error if the User has been modified
* @returns an either fullfilled or not fullfilled Promise
*/

userSchema.method("isPasswordCorrect", async function (passwordCandidate: string): Promise<boolean> {
    if (this.isModified()) {
        throw new Error("User has been modified")
    }
    const result = await compare(passwordCandidate, this.password)
    return result
})

userSchema.pre("save", async function (next) {
    if (this.isModified("password")) {
        const hashedPassword = await hash(this.password, 10)
        this.password = hashedPassword
    }
    next()
})

export const User = model<IUser, UserModel>("User", userSchema)