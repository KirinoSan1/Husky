import React, { useContext, useEffect } from "react";
import RoomsContainer from "./Containers/rooms";
import MessagesContainer from "./Containers/messages";
import { UserContext } from "../settings/UserContext";
import { LoginContext } from "../login/LoginContext";
import { Alert } from "react-bootstrap";

export default function Chats() {
    const [userInfo] = useContext(UserContext);
    const [loginInfo] = useContext(LoginContext);

    useEffect(() => {
    }, [loginInfo]);

    return (
        <div>
            {(!userInfo?.name || !loginInfo) && (
                <Alert key="danger" variant="danger">You have to be logged in to use the LiveChat.</Alert>
            )}
            {userInfo?.name && loginInfo && (
                <>
                    <RoomsContainer />
                    <MessagesContainer />
                </>
            )}
        </div>
    );
}
