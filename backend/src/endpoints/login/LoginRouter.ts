import express from "express";
import { LoginResource } from "../../types/Resources";
import { verifyPasswordAndCreateJWT } from "../service/JWTService";
import { optionalAuthentication } from "../../util/authentication";
import { body, validationResult } from "express-validator";

const loginRouter = express.Router();

loginRouter.post("/",
    body('email').isEmail().normalizeEmail().isLength({ min: 1, max: 100 }),
    body('password').isStrongPassword().isLength({ min: 1, max: 100 }),
    async (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        try {
            const jwtString = await verifyPasswordAndCreateJWT(req.body.email, req.body.password);
            if (!jwtString) {
                res.status(401).json({ message: "Can't create a JWT." });
            } else {
                const LoginRes = { token_type: "Bearer", access_token: jwtString };
                res.status(201).json(LoginRes);
            }
        } catch (error) {
            res.sendStatus(400); //changed to res.sendStatus()
            next(error);
        }
    });

export default loginRouter;
