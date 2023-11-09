import { LoginResource } from "../types/Resources";

const BASE_URL = "http://localhost:3001";

export async function login(loginData: { email: string, password: string }): Promise<LoginResource> {
    try {
        if (!loginData.email)
            throw new Error("email not defined");
        if (!loginData.password)
            throw new Error("password not defined");

        const response = await fetch(`${BASE_URL}/api/login`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(loginData),
        });

        if (!response || !response.ok)
            throw new Error("network response was not OK");

        const result: LoginResource = await response.json();
        if (!result.access_token || !result.token_type)
            throw new Error("invalid result from server");
        return result;

    } catch (error) {
        throw new Error("Error occurred during login: " + error);
    }
}
