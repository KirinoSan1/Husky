import express from "express";
import { LoginResource } from "../../Resources";
import { verifyPasswordAndCreateJWT } from "../service/JWTService";

const loginRouter = express.Router();

loginRouter.post("/", async (req, res, next) => {
    try {
        const jwtString = await verifyPasswordAndCreateJWT(req.body.email, req.body.password)
        if (!jwtString) {
            return res.send(401).json({ message: "Konnte keine JWT-Datei erstellen." });
        }
        const LoginRes: LoginResource = { token_type: "Bearer", access_token: jwtString };
        res.status(201).send(LoginRes);
    } catch (error) {
        res.status(400);
        next(error);
    }
});

export default loginRouter;

