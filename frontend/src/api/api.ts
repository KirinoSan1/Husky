import { getJWT, getLoginInfo } from "../components/login/LoginContext";
import { LoginResource, UserResource } from "../types/Resources";

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

export async function getUser(userID: string): Promise<UserResource> {
    try {
        if (!userID)
            throw new Error("userID not defined");

        const jwt = getJWT();
        if (!jwt)
            throw new Error("no jwt found");

        const response = await fetch(`${BASE_URL}/api/user/${userID}`, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${jwt}`
            }
        });

        if (!response || !response.ok)
            throw new Error("network response was not OK");

        const result: UserResource = await response.json();
        if (!result)
            throw new Error("invalid result from server");
        if (!result.id || !result.email || !result.name)
            throw new Error("result from server is missing fields");
        return result;

    } catch (error) {
        throw new Error("Error occurred during get: " + error);
    }
}

export async function updateUser(user: UserResource, data: {
    newName?: string, newEmail?: string, oldPassword: string, newPassword1?: string, newPassword2?: string
}, toUpdate: "name" | "email" | "password"): Promise<UserResource> {
    user = Object.assign({}, user);
    try {
        if (!user)
            throw new Error("user not defined");
        if (!user.id || !user.name || !user.email)
            throw new Error("user is missing fields");
        if (!data)
            throw new Error("data not defined");
        if (!toUpdate)
            throw new Error("toUpdate not defined");
        if (toUpdate !== "name" && toUpdate !== "email" && toUpdate !== "password")
            throw new Error("toUpdate contains invalid value");
        if (toUpdate === "name" && (!data.newName || !data.oldPassword))
            throw new Error("invalid data for updating username");
        if (toUpdate === "email" && (!data.newEmail || !data.oldPassword))
            throw new Error("invalid data for updating email");
        if (toUpdate === "password" && (!data.oldPassword || !data.newPassword1 || !data.newPassword2 || data.newPassword1 !== data.newPassword2))
            throw new Error("invalid data for updating password");

        const jwt = getJWT();
        if (!jwt)
            throw new Error("no jwt found");
        const loginInfo = getLoginInfo();
        if (!loginInfo || !loginInfo.userID)
            throw new Error("cannot find userID");
        if (user.id !== loginInfo.userID)
            throw new Error("userIDs do not match");

        const bodyData = user as any;
        if (toUpdate === "name") {
            bodyData["name"] = data.newName;
            bodyData["password"] = data.oldPassword;
        } else if (toUpdate === "email") {
            bodyData["email"] = data.newEmail;
            bodyData["password"] = data.oldPassword;
        } else if (toUpdate === "password") {
            bodyData["password"] = data.newPassword1;
        }

        const response = await fetch(`${BASE_URL}/api/user/${bodyData.id}`, {
            method: "PUT",
            headers: {
                "Authorization": `Bearer ${jwt}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify(bodyData)
        });

        if (!response || !response.ok)
            throw new Error("network response was not OK");

        const result: UserResource = await response.json();
        if (!result)
            throw new Error("invalid result from server");
        if (!result.id || !result.email || !result.name)
            throw new Error("result from server is missing fields");
        return result;

    } catch (error) {
        throw new Error("Error occurred during update: " + error);
    }
}
