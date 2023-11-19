import React from "react";
import { UserResource } from "../../types/Resources";

export interface UserInfo {
    id: string,
    name: string,
    email: string,
    admin: boolean,
    mod: boolean
}

const USERINFO_NAME = "userinfo";

export const UserContext = React.createContext([] as any);

export function setUserInfo(user: UserResource): void {
    if (!user)
        throw new Error("invalid user");
    const userInfo = {
        id: user.id,
        name: user.name,
        email: user.email,
        admin: user.admin,
        mod: user.mod
    }
    localStorage.setItem(USERINFO_NAME, JSON.stringify(userInfo));
}

export function getUserInfo(): UserInfo | null {
    const userInfo = localStorage.getItem(USERINFO_NAME);
    if (!userInfo)
        return null;
    return JSON.parse(userInfo);
}

export function removeUserInfo(): void {
    localStorage.removeItem(USERINFO_NAME);
}