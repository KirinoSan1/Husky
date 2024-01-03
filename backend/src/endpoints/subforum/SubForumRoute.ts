import express from "express";
import { optionalAuthentication, requiresAuthentication } from "../../util/authentication";
import { body, matchedData, param, validationResult } from "express-validator";
import { createSubForum, deleteSubForum, getAllSubForums, getAllThreadsForSubForum, getLatestThreadsFromSubForums, getSubForum, updateSubForum } from "./SubForumService";
import { SubForumResource } from "../../types/Resources";

export const subForumRouter = express.Router();

subForumRouter.get("/:name", optionalAuthentication,
    param("name").isString(),
    async (req, res, next) => {
        try {
            const subForum = await getSubForum(req.params.name);
            return res.send(subForum); // 200 by default
        } catch (err) {
            res.status(400);
            next(err);
        }
    }
);

subForumRouter.get("/", optionalAuthentication,
    async (_req, res, next) => {
        try {
            const subForums = await getAllSubForums();
            return res.send(subForums); // 200 by default
        } catch (err) {
            res.status(400);
            next(err);
        }
    }
);

subForumRouter.post("/:name/threads", optionalAuthentication,
    param("name").isString(),
    async (req, res, next) => {
        try {
            const subForumName = req.params.name;
            const count = req.query.count ? parseInt(req.query.count as string) : undefined;
            const threads = await getAllThreadsForSubForum(subForumName, count);
            return res.send(threads);
        } catch (err) {
            res.status(400);
            next(err);
        }
    }
);

subForumRouter.post("/threads", optionalAuthentication,
    body('threadCount').optional().isInt(),
    body('subForumCount').optional().isInt(),
    async (req, res, next) => {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        try {
            const threadCount = req.body.threadCount ? parseInt(req.body.threadCount as string) : 2;
            const subForumCount = req.body.subForumCount ? parseInt(req.body.subForumCount as string) : 2;
            const threads = await getLatestThreadsFromSubForums(threadCount, subForumCount);
            return res.send(threads);
        } catch (err) {
            res.status(400);
            next(err);
        }
    }
);

subForumRouter.post("/", requiresAuthentication,
    body('name').isString(),
    async (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        if (req.role !== "a") {
            return res.status(403).json({ error: 'Permission denied. Only admins can create subforums.' });
        }
        try {
            const subForumResource = matchedData(req) as SubForumResource;
            const newSubForum = await createSubForum(subForumResource);
            return res.status(201).send(newSubForum);
        } catch (err) {
            res.status(400);
            next(err);
        }
    }
);

subForumRouter.put("/:name", requiresAuthentication,
    param('name').isString(),
    body('id').isMongoId(),
    body('name').isString(),
    body('description').isString(),
    body('threads').isArray(),
    async (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ 'Validation errors': errors.array() });
        }
        if (req.role !== "a") {
            return res.status(403).json({ error: 'Permission denied. Only admins can update subforums.' });
        }
        try {
            const subforumResource = matchedData(req) as SubForumResource;
            const updatedSubForumResource = await updateSubForum(subforumResource);
            return res.status(200).json(updatedSubForumResource);
        } catch (err) {
            res.status(400).json(`Error during update: ${err}`);
            next(err);
        }
    }
);

subForumRouter.delete("/:id", requiresAuthentication,
    param('id').isMongoId(), async (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        if (req.role !== "a") {
            return res.status(403).json({ error: 'Permission denied. Only admins can delete subforums.' });
        }
        try {
            const subforumResource = matchedData(req) as SubForumResource;
            const subForumID = subforumResource.id;
            await deleteSubForum(subForumID!);
            return res.sendStatus(204)
        } catch (err) {
            res.status(400);
            next(err);
        }
    }
);

export default subForumRouter;
