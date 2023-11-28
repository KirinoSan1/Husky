import React, { useEffect, useState } from "react";
import { NavDropdown, Navbar } from "react-bootstrap";
import CreateAccountDialog from "../registration/CreateAccountDialog";
import LoginDialog from "../login/LoginDialog";
import { Link, useLocation } from "react-router-dom";
import { LoginContext } from "../login/LoginContext";
import { UserContext } from "../settings/UserContext";

export default function Navigation() {
    const [loginInfo] = React.useContext(LoginContext);
    const [userInfo] = React.useContext(UserContext);
    const [isDropdownOpen, setDropdownOpen] = useState(false);
    const { pathname } = useLocation();

    useEffect(() => setDropdownOpen(false), [pathname]);

    return (
        <Navbar expand="lg">
            <Link to="/">Home</Link>
            <Link to="/threads">Threads</Link>
            <Link to="/chats">Livechats</Link>
            <div id="account-section">{
                loginInfo ?
                    <NavDropdown
                        show={isDropdownOpen}
                        onClick={() => setDropdownOpen(!isDropdownOpen)}
                        title={<>
                            {userInfo?.name}
                            <img id="profile-section-avatar" src="images/logo.png" alt="Your profile avatar" />
                        </>}
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
