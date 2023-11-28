import express from "express";
import { getThread, createThread, updateThread, deleteThread } from "./ThreadService";
import { body, matchedData, param, validationResult } from "express-validator";
import { optionalAuthentication, requiresAuthentication } from "../../util/authentication";
import { ThreadResource } from "../../types/Resources";

const threadRouter = express.Router();

threadRouter.get("/:id", optionalAuthentication,
    param("id").isMongoId(),
    async (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        const threadId = req.params!.id;

        try {
            const foundThread = await getThread(threadId);
            return res.send(foundThread);
        } catch (err) {
            res.status(404).json({ message: "Thread not found." });
            next(err);
        }
    });

threadRouter.post("/", requiresAuthentication,
    body("title").isString().isLength({ min: 1, max: 100 }),
    body("subForum").isString().isLength({ min: 1, max: 100 }),
    body('numPosts').optional().isInt({ min: 0 }),
    body("creator").isString().isLength({ min: 1, max: 100 }),
    async (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        const threadData = matchedData(req) as ThreadResource;

        try {
            const createdThread = await createThread(threadData);
            res.status(201).send(createdThread);
        } catch (err) {
            res.status(400);
            next(err);
        }
    })

threadRouter.put("/:id", requiresAuthentication,
    param("id").isMongoId(),
    body("title").isString().isLength({ min: 1, max: 100 }),
    body("subForum").isString().isLength({ min: 1, max: 100 }),
    body('numPosts').optional().isInt({ min: 0 }),
    body("creator").isString().isLength({ min: 1, max: 100 }),
    async (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        const threadData = matchedData(req) as ThreadResource;
        const threadID = req.params.id;
        const creatorID = req.userId;

        try {
            const thread = await getThread(threadID);
            if (thread.creator !== creatorID) {
                return res.status(403).json({ message: "You are not the Creator." });
            }
            const updatedThread = await updateThread(threadData);
            res.status(200).send(updatedThread);
        } catch (err) {
            res.status(400).json(`Error during update: ${err}`);
            next(err);
        }
    })

threadRouter.delete("/:id", requiresAuthentication,
    param("id").isMongoId(),
    async (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        const threadID = req.params.id;
        const creatorID = req.userId;

        try {
            const thread = await getThread(threadID);
            if (thread.creator !== creatorID) {
                return res.status(403).json({ message: "You are not the Creator." });
            }
            await deleteThread(req.params!.id);
            res.status(204).send();
        } catch (err) {
            res.status(404);
            next(err);
        }
    })

export default threadRouter;
