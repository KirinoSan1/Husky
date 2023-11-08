import { JwtPayload, sign, verify } from "jsonwebtoken";
import { User } from "../user/UserModel";
import dotenv from "dotenv";
import { login } from "../authentication/AuthenticationService";
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
    const loginnn = await login(email, password)
    if((loginnn).success === false){
        return undefined
    }
    const timeInSec = Math.floor(Date.now() / 1000);
  
    const payload: JwtPayload = {
        sub: loginnn.id,
        iat: timeInSec,//Issued At	
        roles: loginnn.role
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
