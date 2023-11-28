import { NextFunction, Request, Response } from "express";
import { verifyJWT } from "../endpoints/service/JWTService";

/**
 * Typdefinitions for TypeScript.
 */
declare global {
    namespace Express {
        /**
         * Expanding the Request interface with the fields userId and role.
         * Only relevant for TypeScript.
         */
        export interface Request {
            /**
             * Mongo-ID of currently logged in user; or undefined, if user is a guest.
             */
            userId?: string;
            role: "u" | "a" | "m";
        }
    }
}

/**
 * Checks the authentication and adds userId with the Mongo ID of the user and role. 
 * In case of authentication failure, an error (401) is generated.
 */
export async function requiresAuthentication(req: Request, res: Response, next: NextFunction) {
    req.userId = undefined;
    req.role = "u";
    const auth = req.header("Authorization");
    if (auth && auth.startsWith("Bearer ")) {
        try {
            const jwtString = auth.substring("Bearer ".length);
            const result = verifyJWT(jwtString);
            req.userId = result.userId
            req.role = result.role;
            next();
        } catch (error) {
            res.status(401); // Unauthorized
            res.setHeader("WWW-Authenticate", ['Bearer', 'realm="app"', 'error="invalid_token"']);
            next(error);
        }

    } else {
        res.status(401); // Unauthorized
        res.setHeader("WWW-Authenticate", ['Bearer', 'realm="app"']);
        next("Authentication required");
    }
}

/**
 * Checks authentication and writes userId with the Mongo ID of the user and role with the abbreviation of the role into the request. 
 * If no JSON Webtoken is present in the request header, no error will be generated and nothing will be written into the request. 
 * In case authentication fails, an error (401) is generated.
 */
export async function optionalAuthentication(req: Request, res: Response, next: NextFunction) {
    if (req.header("Authorization")) {
        requiresAuthentication(req, res, next);
    } else {
        next();
    }
}