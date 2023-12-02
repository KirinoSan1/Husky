import { Model, model, Schema, Types } from "mongoose"
import { IPost } from "../post/PostModel"

/**
 * Interface with the appointed properties
 */
export interface IThreadPage {
    posts: IPost[],
    createdAt?: Date
}

/**
* Definition for the 'ThreadPageModel' type for the database model that includes 
* user properties (IThreadPage).
*/

type threadPageOverride = { posts: Types.DocumentArray<IPost> }
type ThreadPageModel = Model<IThreadPage, {}, threadPageOverride>

const threadpageSchema = new Schema<IThreadPage, ThreadPageModel>({
    posts: [new Schema<IPost>({
        content: { type: String, required: true },
        author: { type: Schema.Types.ObjectId, ref: "User", required: true },
        upvotes: { type: Number, default: 0 },
        downvotes: { type: Number, default: 0 }
    }, { timestamps: true })]

}, { timestamps: true })

export const ThreadPage = model<IThreadPage, ThreadPageModel>("ThreadPage", threadpageSchema)
