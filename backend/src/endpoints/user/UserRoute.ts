import { UserResource } from "../../types/Resources";
import express from "express";
import dotenv from "dotenv";
dotenv.config()
import { requiresAuthentication } from "../../util/authentication";
import { createUser, deleteUser, getAllThreadsForUser, getUser, getUsersAvatar, updateUser } from "./UserService";
import { body, matchedData, param, validationResult } from "express-validator";
import sendEmail from "../../util/sendEmail";
import crypto from "crypto"
import { User } from "./UserModel";
import { Token } from "../TokenModel";

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
    })

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
    }
);

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
                return res.status(400).send({ message: "id does not exist" });
            }
            const user = await User.findById(req.params!.id).exec();
            if (!user) {
                return res.status(400).send({ message: "Invalid link" });
            }
            const token = await Token.findOne({ userid: user.id }).exec();
            if (!token) {
                return res.status(400).send({ message: "Invalid link" });
            }
            await User.updateOne({ _id: user._id }, { verified: true }).exec();
            await Token.deleteOne({ _id: token._id }).exec();
            res.status(201).json({ message: "You have been successfully verified. You can now log in." });
        } catch (err) {
            res.status(400);
            next(err);
        }
    })

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

userRouter.post("/",
    body('email').isEmail().normalizeEmail().isLength({ min: 1, max: 100 }),
    body('name').isString().isLength({ min: 3, max: 20 }),
    body('password').isStrongPassword().isLength({ min: 1, max: 100 }), async (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        const user = await User.findOne({ email: req.body.email });
        if (user) {
            return res.status(409).json({ message: "User already exists" });
        }
        try {
            const userResource = matchedData(req) as UserResource;
            const newUser = await createUser(userResource);
            const token = await new Token({ userid: newUser.id, token: crypto.randomBytes(32).toString("hex") }).save();
            const url = `${process.env.BASE_URL}/api/user/${newUser.id}/verify/${token.token}`;
            await sendEmail(newUser.email, "Verify Email", url);
            res.status(201).send({ message: "An Email has been sent to your account, please verify" });
        } catch (err) {
            res.status(400);
            next(err);
        }
    })

userRouter.put("/:id",
    requiresAuthentication,
    param("id").isMongoId(),
    body("avatar").isString(),
    body('email').isEmail().normalizeEmail().isLength({ min: 1, max: 100 }),
    body('admin').isBoolean(),
    body('mod').isBoolean(),
    body('name').isString().isLength({ min: 1, max: 100 }),
    body('password').isStrongPassword().isLength({ min: 1, max: 100 }), async (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        const userResource = matchedData(req) as UserResource;
        try {
            const updatedUserResource = await updateUser(userResource);
            return res.send(updatedUserResource);
        } catch (err) {
            console.log(err);
            res.status(400); // duplicate user
            next(err);
        }
    })


userRouter.put("/image/:id",
    async (req, res, next) => {
        const userResource: UserResource = {
            id: req.params.id,
            name: req.body.name,
            email: req.body.email,
            avatar: req.body.data.avatar
        }
        try {
            const updatedUserResource = await updateUser(userResource)
            return res.send(updatedUserResource);
        } catch (err) {
            console.log(err)
            res.status(400); // duplicate user
            next(err);
        }
    })

userRouter.delete("/:id",
    requiresAuthentication,
    param("id").isMongoId(), async (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        try {
            const userID = matchedData(req) as unknown as string;
            const userID2 = req.params!.id;
            await deleteUser(userID);
            res.sendStatus(204)
        } catch (err) {
            res.status(400);
            next(err);
        }
    })

export default userRouter;