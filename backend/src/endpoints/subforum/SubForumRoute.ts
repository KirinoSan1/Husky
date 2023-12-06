import express from "express";
import { optionalAuthentication, requiresAuthentication } from "../../util/authentication";
import { body, matchedData, param, validationResult } from "express-validator";
import { createSubForum, deleteSubForum, getSubForum, updateSubForum } from "./SubForumService";
import { SubForumResource } from "../../types/Resources";

export const subForumRouter = express.Router();

subForumRouter.get("/:name", optionalAuthentication,
    param("name").isString(),
    async (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        try {
            const subForum = await getSubForum(req.params.name);
            return res.send(subForum); // 200 by default
        } catch (err) {
            res.status(400);
            next(err)
        }
    })

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
    })

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
    })

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
            const subforumResource = matchedData(req) as SubForumResource
            const subForumID = subforumResource.id;
            await deleteSubForum(subForumID!);
            return res.sendStatus(204)
        } catch (err) {
            res.status(400);
            next(err);
        }
    })

export default subForumRouter