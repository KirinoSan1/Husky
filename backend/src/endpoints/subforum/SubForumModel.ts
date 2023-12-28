import { Model, model, Schema, Types } from "mongoose";

/**
 * Interface with the appointed properties
 */
export interface ISubForum {
    name: string;
    description: string;
    threads: Types.ObjectId[];
}

/**
* Definition for the 'SubForumModel' type for the database model that includes 
* user properties (ISubForum).
*/
type subForumOverride = { threads: Types.DocumentArray<Types.ObjectId> };
type subForumModel = Model<ISubForum, {}, subForumOverride>;

const subforumSchema = new Schema<ISubForum, subForumModel>({
    name: { type: String, required: true, unique: true },
    description: { type: String },
    threads: { type: [{ type: Schema.Types.ObjectId, ref: "Thread", required: true }], required: true }
});

export const SubForum = model<ISubForum, subForumModel>("SubForum", subforumSchema);
