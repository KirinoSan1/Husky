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

export async function register(registrationData: { username: string, email: string, password1: string, password2: string }): Promise<LoginResource> {
    try {
        if (!registrationData.username)
            throw new Error("username not defined");
        if (!registrationData.email)
            throw new Error("email not defined");
        if (!registrationData.password1)
            throw new Error("first password not defined");
        if (!registrationData.password2)
            throw new Error("second password not defined");
        if (registrationData.password1 !== registrationData.password2)
            throw new Error("passwords do not match");

        const response = await fetch(`${BASE_URL}/api/user/`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ name: registrationData.username, email: registrationData.email, password: registrationData.password1 })
        });

        if (!response || !response.ok)
        throw new Error("network response was not OK");

        const result: LoginResource = await response.json();
        if (!result.access_token || !result.token_type)
            throw new Error("invalid result from server");
        return result;

    } catch (error) {
        throw new Error("Error occurred during registration: " + error);
    }
}
