import { model, Schema, Types } from "mongoose"

/*
 * cf. https://mongoosejs.com/docs/typescript.html
 */

/**
 * Interface with the appointed properties
 */
export interface IPost {
    content: string
    author: Types.ObjectId
    upvotes?: number
    downvotes?: number
    modified: "" | "m" | "d"
    createdAt: Date
}

export const postSchema = new Schema<IPost>({
    content: { type: String, required: true },
    author: { type: Schema.Types.ObjectId, ref: "User", required: true },
    upvotes: { type: Number, default: 0 },
    downvotes: { type: Number, default: 0 },
    modified: { type: String, default: "" }
}, { timestamps: true });

export const Post = model<IPost>("Post", postSchema);
