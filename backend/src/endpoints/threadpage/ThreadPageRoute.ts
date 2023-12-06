import express from "express";
import { optionalAuthentication, requiresAuthentication } from "../../util/authentication";
import { body, check, matchedData, param, validationResult } from "express-validator";
import { addPost, createThreadPageAndNotifyThread, deleteThreadPage, getThreadPage, getThreadPageAuthors, updateThreadPage } from "./ThreadPageService";
import { PostResource, ThreadPageResource } from "../../types/Resources";

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
            next(err)
        }
    })

threadPageRouter.get("/authors/:id", optionalAuthentication,
    param("id").isMongoId(),
    async (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        try {
            const authors = await getThreadPageAuthors(req.params.id);
            return res.send(authors); // 200 by default
        } catch (err) {
            res.status(400);
            next(err);
        }
    })

threadPageRouter.post("/", requiresAuthentication,
    body('posts').isArray(),
    body("threadID").isMongoId(),
    //isLength({min: 1, max: 10}) didnt work. Had to use check.custom
    //check custom spot
    check("posts").custom(/*specialize the value*/value => {
        //here is the actual validation
        if (!Array.isArray(value) || value.length < 1 || value.length > 10) {
            throw new Error("Invalid number of Posts. A ThreadPage has to contain at least 1 Post and a maximum of 10");
        }
        //return true if validation passed
        return true;
    }),
    async (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        try {
            const body = matchedData(req) as { posts: Array<PostResource>, threadID: string };
            const postedThreadPage = await createThreadPageAndNotifyThread(body.posts, body.threadID);
            return res.status(201).send(postedThreadPage);
        } catch (err) {
            res.status(400);
            next(err);
        }
    })

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
    async (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        const postData = matchedData(req) as { author: string, content: string };
        try {
            const newThreadPageResource = await addPost(postData.content, postData.author, req.params.id);
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
            const loadedthreadPage = matchedData(req) as ThreadPageResource
            const threadPageToDelete = loadedthreadPage.id;
            await deleteThreadPage(threadPageToDelete!);
            return res.sendStatus(204)
        } catch (err) {
            res.status(400);
            next(err);
        }
    })

export default threadPageRouter