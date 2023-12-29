import dotenv from "dotenv";
dotenv.config();

import { UserResource } from "../../types/Resources";
import express from "express";
import { requiresAuthentication } from "../../util/authentication";
import { createUser, deleteUser, getAllThreadsForUser, getUser, getUsersAvatar, updateUser } from "./UserService";
import { body, matchedData, param, validationResult } from "express-validator";
import sendEmail from "../../util/sendEmail";
import crypto from "crypto"
import { User } from "./UserModel";
import { Token } from "../TokenModel";
import { MAX_LENGTH_EMAIL_ADDRESS, MAX_LENGTH_PASSWORD, MAX_LENGTH_USERNAME, MIN_LENGTH_EMAIL_ADDRESS, MIN_LENGTH_PASSWORD, MIN_LENGTH_USERNAME } from "../../types/Constants";

export const userRouter = express.Router();

userRouter.get("/:id", requiresAuthentication,
    param("id").isMongoId(),
    async (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        try {
            const users = await getUser(req.params.id);
            res.send(users); // 200 by default
        } catch (err) {
            res.status(400);
            next(err);
        }
    });

userRouter.get("/:id/avatar",
    param("id").isMongoId(),
    async (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        try {
            const avatar = await getUsersAvatar(req.params?.id);
            res.send(avatar); // 200 by default
        } catch (err) {
            res.status(400);
            next(err);
        }
    });

userRouter.get("/:id/verify/:token",
    param("id").isMongoId(),
    param("token").isString(),
    async (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        try {
            if (!req.params!.id) {
                return res.status(400).send({ message: "ID does not exist." });
            }
            const user = await User.findById(req.params!.id).exec();
            if (!user) {
                return res.status(400).send({ message: "Invalid link." });
            }
            const token = await Token.findOne({ userid: user.id }).exec();
            if (!token) {
                return res.status(400).send({ message: "Invalid Token." });
            }
            await User.updateOne({ _id: user._id }, { verified: true }).exec();
            await Token.deleteOne({ _id: token._id }).exec();
            res.status(201).json({ message: "You have been successfully verified. You can log in now." });
        } catch (err) {
            res.status(400);
            next(err);
        }
    });

userRouter.post("/",
    body('email').isEmail().normalizeEmail().isLength({ min: MIN_LENGTH_EMAIL_ADDRESS, max: MAX_LENGTH_EMAIL_ADDRESS }),
    body('name').isString().isLength({ min: MIN_LENGTH_USERNAME, max: MAX_LENGTH_USERNAME }),
    body('password').isStrongPassword().isLength({ min: MIN_LENGTH_PASSWORD, max: MAX_LENGTH_PASSWORD }),
    async (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        const user = await User.findOne({ email: req.body.email });
        if (user) {
            // mock the actual function call by sleeping for a duration
            await new Promise(r => setTimeout(r, 1000 + Math.random() * 1000));
            // we do not want to show that the email address already exists
            // pretend that everything worked as intended by returning 201
            res.sendStatus(201);
        }
        try {
            const userResource = matchedData(req) as UserResource;
            const newUser = await createUser(userResource);
            const token = await new Token({ userid: newUser.id, token: crypto.randomBytes(32).toString("hex") }).save();
            const url = `${process.env.BASE_URL}/api/user/${newUser.id}/verify/${token.token}`;
            await sendEmail(newUser.email, "Verify Email", url);
            res.status(201).send({ message: "An Email has been sent to your account, please verify." });
        } catch (err) {
            res.status(400);
            next(err);
        }
    });

userRouter.post("/:id/threads", requiresAuthentication,
    param("id").isMongoId(),
    async (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        try {
            const userId = req.params.id;
            const count = req.query.count ? parseInt(req.query.count as string) : undefined;
            const threads = await getAllThreadsForUser(userId, count);
            res.send(threads); // Send threads for the user with the given ID
        } catch (err) {
            res.status(400);
            next(err);
        }
    });

userRouter.put("/:id",
    requiresAuthentication,
    param("id").isMongoId(),
    body("avatar").isString(),
    body('email').isEmail().normalizeEmail().isLength({ min: MIN_LENGTH_EMAIL_ADDRESS, max: MAX_LENGTH_EMAIL_ADDRESS }),
    body('admin').isBoolean(),
    body('mod').isBoolean(),
    body('name').isString().isLength({ min: MIN_LENGTH_USERNAME, max: MAX_LENGTH_USERNAME }),
    body('password').isStrongPassword().isLength({ min: MIN_LENGTH_PASSWORD, max: MAX_LENGTH_PASSWORD }),
    async (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        const userResource = matchedData(req) as UserResource;
        try {
            const updatedUserResource = await updateUser(userResource);
            return res.send(updatedUserResource);
        } catch (err) {
            res.status(405); // duplicate user
            next(err);
        }
    });

userRouter.put("/image/:id",
    async (req, res, next) => {
        const userResource: UserResource = {
            id: req.params.id,
            name: req.body.name,
            email: req.body.email,
            avatar: req.body.data.avatar
        };
        try {
            const updatedUserResource = await updateUser(userResource);
            return res.send(updatedUserResource);
        } catch (err) {
            res.status(400); // duplicate user
            next(err);
        }
    });

userRouter.delete("/:id",
    requiresAuthentication,
    param("id").isMongoId(),
    async (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        try {
            const userID = matchedData(req) as unknown as string;
            await deleteUser(userID);
            res.sendStatus(204);
        } catch (err) {
            res.status(400);
            next(err);
        }
    });

export default userRouter;
