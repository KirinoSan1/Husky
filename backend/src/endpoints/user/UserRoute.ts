import { LoginResource, UserResource } from "../../types/Resources";
import express from "express";
import { requiresAuthentication } from "../../util/authentication";
import { createUser, deleteUser, getAllThreadsForUser, getUser, updateUser } from "./UserService";
import { body, matchedData, param, validationResult } from "express-validator";
import { verifyPasswordAndCreateJWT } from "../service/JWTService";

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
            next(err)
        }
    })

    userRouter.get("/:id/threads", requiresAuthentication,
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
    body('name').isString().isLength({ min: 1, max: 100 }),
    body('password').isStrongPassword().isLength({ min: 1, max: 100 }), async (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        try {
            const userResource = matchedData(req) as UserResource;
            const newUser = await createUser(userResource);
            const jwtString = await verifyPasswordAndCreateJWT(userResource.email, userResource.password!);
            if (!jwtString) {
                // could not create jwt for newly created user - something went seriously wrong
                // better delete the new user
                await deleteUser(newUser.id!);
                return res.status(400).json({ message: "Can't create a JWT." });
            }
            const LoginRes: LoginResource = { token_type: "Bearer", access_token: jwtString };
            res.status(201).send(LoginRes);
        } catch (err) {
            res.status(400);
            next(err);
        }
    })

userRouter.put("/:id",
    requiresAuthentication,
    param("id").isMongoId(),
    body('email').isEmail().normalizeEmail().isLength({ min: 1, max: 100 }),
    body('admin').isBoolean(),
    body('mod').isBoolean(),
    body('name').isString().isLength({ min: 1, max: 100 }),
    body('password').isStrongPassword().isLength({ min: 1, max: 100 }), async (req, res, next) => {

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        // const userID = req.params!.id;
        const userResource = matchedData(req) as UserResource;
        try {
            const updatedUserResource = await updateUser(userResource)
            res.send(updatedUserResource);

        } catch (err) {
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
            const userID = matchedData(req) as unknown as string
            const userID2 = req.params!.id;
            await deleteUser(userID);
            res.sendStatus(204)
        } catch (err) {
            res.status(400);
            next(err);
        }
    })
export default userRouter;