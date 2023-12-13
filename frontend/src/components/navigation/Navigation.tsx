import React, { useEffect } from "react";
import { NavDropdown, Navbar } from "react-bootstrap";
import CreateAccountDialog from "../registration/CreateAccountDialog";
import LoginDialog from "../login/LoginDialog";
import { Link } from "react-router-dom";
import { LoginContext } from "../login/LoginContext";
import { UserContext } from "../settings/UserContext";

export default function Navigation() {
    const [loginInfo] = React.useContext(LoginContext);
    const [userInfo] = React.useContext(UserContext);


    return (
        <Navbar expand="lg">
            <Link to="/">Home</Link>
            <Link to="/topics">Topics</Link>
            <Link to="/threads">Threads</Link>
            <Link to="/chats">Livechats</Link>
            <div id="account-section">{
                loginInfo ?
                    <NavDropdown
                        title={
                            userInfo ?
                                <><p>{userInfo?.name}</p>
                                    {userInfo?.avatar ? (
                                        <img
                                            key={userInfo.avatar}
                                            id="profile-section-avatar" src={userInfo.avatar} alt="Profile Picture" />
                                    ) : <img id="profile-section-avatar" src="/images/logo.png" alt="Profile Picture" />
                                    }</> : (<img id="profile-section-avatar" src="/images/logo.png" alt="Profile Picture" />)
                        }
                    >
                        <Link className="dropdown-item" to="/profile">Profile</Link>
                        <Link className="dropdown-item" to="/posts">Posts</Link>
                        <Link className="dropdown-item" to="/settings">Settings</Link>
                        <NavDropdown.Divider />
                        <LoginDialog />
                    </NavDropdown>
                    :
                    <div id="logincontext-provider-buttons">
                        <LoginDialog />
                        <CreateAccountDialog />
                    </div>
            }</div>
        </Navbar>
    );
}
