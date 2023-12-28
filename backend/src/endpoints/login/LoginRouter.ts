import express from "express";
import { verifyPasswordAndCreateJWT } from "../service/JWTService";
import { body, matchedData, validationResult } from "express-validator";
import { User } from "../user/UserModel";

const loginRouter = express.Router();

loginRouter.post("/",
    body('email').isEmail().normalizeEmail().isLength({ min: 1, max: 100 }),
    body('password').isString(), // TODO: leads to inconsistencies - should only get checked on register
    async (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        try {
            const data = matchedData(req);
            const jwtString = await verifyPasswordAndCreateJWT(data.email, data.password);
            if (!jwtString) {
                return res.status(401).json({ message: "Can't create a JWT." });
            } else {
                let user = await User.findOne({ email: data.email }).exec();
                if (user!.verified == false) {
                    return res.status(403).json({ message: "Not authorized. Please verify your email." });
                }
                const LoginRes = { token_type: "Bearer", access_token: jwtString };
                return res.status(201).json(LoginRes);
            }
        } catch (error) {
            res.sendStatus(400);
            next(error);
        }
    });

export default loginRouter;
