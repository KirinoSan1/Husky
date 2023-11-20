import { LoginResource, PostResource } from "../../types/Resources";
import express from "express";
import { optionalAuthentication, requiresAuthentication } from "../../util/authentication";
import { createPost, deletePost, getPost, updatePost } from "./PostService";
import { body, matchedData, param, validationResult } from "express-validator";
import { verifyPasswordAndCreateJWT } from "../service/JWTService";

export const postRouter = express.Router();
postRouter.get("/:id", requiresAuthentication,
    param("id").isMongoId(),
    async (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        try {
            const users = await getPost(req.params.id);
            return res.send(users); // 200 by default
        } catch (err) {
            res.status(400);
            next(err)
        }
    })


postRouter.post("/", requiresAuthentication,
    body('author').isString(),
    body('content').isString(), async (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        try {
            const postResource = matchedData(req) as PostResource;
            const newPost = await createPost(postResource);
            return res.status(201).send(newPost);
        } catch (err) {
            res.status(400);
            next(err);
        }
    })

postRouter.put("/:id", requiresAuthentication,
    param('id').isMongoId(),
    body('author').isString(),
    body('content').isString(),
    body('upvotes').optional().isNumeric(),
    body('downvotes').optional().isNumeric(),
    async (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ 'Validation errors': errors.array() });
        }
        const PostResource = matchedData(req) as PostResource;
        try {
            const updatedPostResource = await updatePost(PostResource);
            return res.status(200).json(updatedPostResource);
        } catch (err) {
            res.status(400).json(`Error during update: ${err}`);
            next(err);
        }
    }
);


postRouter.delete("/:id", requiresAuthentication,
    param('id').isMongoId(), async (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        try {
            const post = matchedData(req) as PostResource
            const postID = post.id;
            await deletePost(postID!);
            return res.sendStatus(204)
        } catch (err) {
            res.status(400);
            next(err);
        }
    })



export default postRouter;