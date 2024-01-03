import express from "express";
import { optionalAuthentication, requiresAuthentication } from "../../util/authentication";
import { body, check, matchedData, param, validationResult } from "express-validator";
import { addPost, createThreadPage, deleteThreadPage, editPost, getThreadPage, getThreadPageAuthors, updateThreadPage } from "./ThreadPageService";
import { ThreadPageResource } from "../../types/Resources";

export const threadPageRouter = express.Router();

threadPageRouter.get("/:id", optionalAuthentication,
    param("id").isMongoId(),
    async (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        try {
            const threadPage = await getThreadPage(req.params.id);
            return res.send(threadPage); // 200 by default
        } catch (err) {
            res.status(400);
            next(err);
        }
    }
);

threadPageRouter.get("/authors/:id", optionalAuthentication,
    param("id").isMongoId(),
    async (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        try {
            const authors = await getThreadPageAuthors(req.params.id);
            return res.send(authors); 
        } catch (err) {
            res.status(400);
            next(err);
        }
    }
);

threadPageRouter.post("/", requiresAuthentication,
    body('posts').isArray(),
    check("posts").custom(value => {
        // Here is the actual validation
        if (!Array.isArray(value) || value.length < 1 || value.length > 10) {
            throw new Error("Invalid number of Posts. A ThreadPage has to contain at least 1 Post and a maximum of 10");
        }
        return true; // Return true if validation passed
    }),
    async (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        try {
            const body = matchedData(req) as ThreadPageResource;
            const postedThreadPage = await createThreadPage(body);
            return res.status(201).send(postedThreadPage);
        } catch (err) {
            res.status(400);
            next(err);
        }
    }
);

threadPageRouter.put("/:id", requiresAuthentication,
    param('id').isMongoId(),
    check("posts").custom(value => {
        if (!Array.isArray(value) || value.length < 1 || value.length > 10) {
            throw new Error("Invalid number of Posts. A ThreadPage has to contain at least 1 Post and a maximum of 10");
        }
        return true;
    }),
    async (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        const threadPageResource = matchedData(req) as ThreadPageResource;
        try {
            const newThreadPageResource = await updateThreadPage(threadPageResource);
            return res.status(200).json(newThreadPageResource);
        } catch (err) {
            res.status(400).json(`Error during update: ${err}`);
            next(err);
        }
    }
);

threadPageRouter.patch("/:id/add", requiresAuthentication,
    param('id').isMongoId(),
    body('author').isMongoId(),
    body('content').isString(),
    body('threadID').isMongoId(),
    async (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        const postData = matchedData(req) as { author: string, content: string, threadID: string };
        try {
            const newThreadPageResource = await addPost(postData.content, postData.author, req.params.id, postData.threadID);
            return res.status(200).json(newThreadPageResource);
        } catch (err) {
            res.status(400).json(`Error during update: ${err}`);
            next(err);
        }
    }
);

threadPageRouter.patch("/:id/edit", requiresAuthentication,
    param('id').isMongoId(),
    body('author').isMongoId(),
    body('postNum').isNumeric(),
    body('content').isString(),
    body('modified').isString().optional(),
    async (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        const postData = matchedData(req) as { author: string, content: string, postNum: number };
        const modified = req.body.modified ?? "m";
        try {
            const newThreadPageResource = await editPost(postData.content, postData.author, req.params.id, postData.postNum, modified);
            return res.status(200).json(newThreadPageResource);
        } catch (err) {
            res.status(400).json(`Error during update: ${err}`);
            next(err);
        }
    }
);

threadPageRouter.delete("/:id", requiresAuthentication,
    param('id').isMongoId(),
    async (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        try {
            const loadedthreadPage = matchedData(req) as ThreadPageResource;
            const threadPageToDelete = loadedthreadPage.id;
            await deleteThreadPage(threadPageToDelete!);
            return res.sendStatus(204)
        } catch (err) {
            res.status(400);
            next(err);
        }
    }
);

export default threadPageRouter;
