import { Model, model, Schema, Types } from "mongoose";

export interface IThread {
    title: string;
    creator: Types.ObjectId;
    subForum: string;
    numPosts?: number;
    pages: Types.ObjectId[]; // Array von ThreadPage IDs
    createdAt: Date;
}

type threadOverride = { pages: Types.DocumentArray<Types.ObjectId> };
type ThreadModel = Model<IThread, {}, threadOverride>;

const threadSchema = new Schema<IThread, ThreadModel>({
    title: { type: String, required: true },
    creator: { type: Schema.Types.ObjectId, ref: "User", required: true },
    subForum: { type: String, required: true },
    numPosts: { type: Number, default: 0 },
    pages: {type: [{ type: Schema.Types.ObjectId, ref: "ThreadPage", required: true }], required: true},
}, { timestamps: true });

export const Thread = model<IThread, ThreadModel>("Thread", threadSchema);
