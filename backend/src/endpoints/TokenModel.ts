import { Model, Schema, model } from "mongoose"

/**
 * Interface with the appointed properties
 */
export interface IToken {
    userid: string,
    token: string
}

/**
* Definition for the 'TokenModel' type for the database model that includes 
* token properties (IToken).
*/
type TokenModel = Model<IToken, {}>

const tokenSchema = new Schema<IToken>({
    userid: {type: String, required: true, ref: "User", unique: true},
    token: {type: String, required: true}
}, { timestamps: true });

export const Token = model<IToken, TokenModel>("Token", tokenSchema);
