import { Model, model, Schema } from "mongoose";
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
    verified?: boolean
    createdAt?: Date
    avatar?: string
    votedPosts: Map<string, boolean>
}

/**
 * Interface contains instance methods of the user document from the schema.
 */
export interface IUserMethods {
    isPasswordCorrect(c: string): Promise<boolean>
}

/**
* Definition for the 'UserModel' type for the database model that includes 
* user properties (IUser) and instance methods (IUserMethods).
*/
type UserModel = Model<IUser, {}, IUserMethods>;

const userSchema = new Schema<IUser, IUserMethods>({
    name: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    mod: { type: Boolean, default: false },
    admin: { type: Boolean, default: false },
    verified: { type: Boolean, default: false },
    avatar: { type: String, default: "" },
    createdAt: { type: Date },
    votedPosts: { type: Map, of: Boolean, default: new Map() }
}, { timestamps: true });

/**
* Compares the password of the user with the hashed passwordCandidate.
* If the passwords are not equal, a promise which resolves to false will be returned.
* If the passwords are equal, a promise which resolves to true will be returned.
*
@throws an error if the user has been modified
@returns a promise resolving to a boolean indicating the result of the comparison
*/
userSchema.method("isPasswordCorrect", async function (passwordCandidate: string): Promise<boolean> {
    if (this.isModified()) {
        throw new Error("User has been modified");
    }
    const result = await compare(passwordCandidate, this.password);
    return result;
})

userSchema.pre("save", async function (next) {
    if (this.isModified("password")) {
        const hashedPassword = await hash(this.password, 10);
        this.password = hashedPassword;
    }
    next();
});

export const User = model<IUser, UserModel>("User", userSchema);
