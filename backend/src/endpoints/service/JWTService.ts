import { JwtPayload, sign, verify } from "jsonwebtoken";
import dotenv from "dotenv";
import { login } from "../authentication/AuthenticationService";

dotenv.config();

export async function verifyPasswordAndCreateJWT(email: string, password: string): Promise<string | undefined> {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
        throw Error("JWT_SECRET not set");
    }

    const ttl = process.env.JWT_TTL;
    if (!ttl) {
        throw new Error("JWT_TTL not set");
    }

    const loginResult = await login(email, password);
    if ((loginResult).success === false) {
        return undefined;
    }

    const timeInSec = Math.floor(Date.now() / 1000);
    const payload: JwtPayload = {
        sub: loginResult.id,
        iat: timeInSec, //Issued At	
        role: loginResult.role
    };

    return sign(payload, secret, { algorithm: "HS256", expiresIn: ttl });
}

export function verifyJWT(jwtString: string | undefined): { userId: string, role: "u" | "a" | "m" } {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
        throw Error("JWT_SECRET not set");
    }

    const ttl = process.env.JWT_TTL;
    if (!ttl) {
        throw new Error("JWT_TTL not set");
    }

    if (!jwtString) {
        throw new Error("invalid_token");
    }

    try {
        const payload = verify(jwtString, secret);
        if (typeof payload === 'object' && "sub" in payload && payload.sub && "role" in payload && payload.role) {
            return { userId: payload.sub, role: payload.role };
        }
        throw new Error("Invalid Payload."); 
    } catch (err: any) {
        throw new Error(err.message)
    }
}
