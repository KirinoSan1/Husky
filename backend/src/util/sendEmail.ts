import dotenv from "dotenv";
dotenv.config();

import nodemailer from "nodemailer";
import { User } from "../endpoints/user/UserModel";
import { Token } from "../endpoints/TokenModel";

export default async function (email: string, subject: string, text: string) {
    try {
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: 'husky.projectmaster@gmail.com',
                pass: 'ezzwketlnksmrdwo'
            }
        });

        await transporter.sendMail({
            from: process.env.USER,
            to: email,
            subject: subject,
            text: text
        });
    } catch (error) {
        let user = await User.findOne({ email: email }).exec();
        let token = await Token.findOne({ userid: user!.id }).exec();
        await Token.findByIdAndDelete(token!.id).exec();
        await User.findByIdAndDelete(user!.id).exec();
    }
}
