import { JwtPayload, sign, verify } from "jsonwebtoken";
import { User } from "../user/UserModel";
import dotenv from "dotenv";
dotenv.config() 



export async function verifyPasswordAndCreateJWT(email: string, password: string): Promise<string | undefined> {
    const geheim = process.env.JWT_SECRET;
    if (!geheim) {
        throw Error("JWT_SECRET not set");
    }
    const ttl = process.env.JWT_TTL
    if (!ttl) {
        throw new Error("JWT_TTL is not set.")
    }
    const users = await User.find({ email: email }).exec();
    if (!users || users.length != 1) {
        return undefined;
    }
    const user = users[0];
    if (! await user.isPasswordCorrect(password)) {
        return undefined;
    }
    const timeInSec = Math.floor(Date.now() / 1000);
    let roles = "";
    if (user.admin) {
        roles = 'a'
    } else if (user.mod) {
        roles= 'm'
    } else {
        roles = 'u'
    }

    const payload: JwtPayload = {
        sub: user.id,
        iat: timeInSec,//Issued At	
        roles: roles
    }
    const jwtString = sign(payload, geheim!, { algorithm: "HS256", expiresIn: ttl });
    return jwtString;
}




export function verifyJWT(jwtString: string | undefined): { userId: string, role: "u" | "a" | "m" } {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
        throw Error("JWT_SECRET not set");
    }
    const ttl = process.env.JWT_TTL;
    if (!ttl) {
        throw new Error("JWT_TTL is not set.")
    }
    if (!jwtString) {
        throw new Error("invalid_token");
    } else {
        try {
            const payload = verify(jwtString, secret);
            if (typeof payload === 'object' && "sub" in payload && payload.sub) {
                return { userId: payload.sub, role: payload.roles };
            }
        } catch (err: any) {
            throw new Error(err.message)
        }
    }
    throw new Error("invalid_token");
}
