import React, { useEffect, useState } from "react";
import { LoginContext } from "../login/LoginContext";
import Tab from 'react-bootstrap/Tab';
import Tabs from 'react-bootstrap/Tabs';
import { Alert, Button, Form, ListGroup } from "react-bootstrap";
import { UserContext } from "./UserContext";
import { converttobase64, updateUser, updateUserProfilePicture } from "../../api/api";
import LoadingIndicator from "../util/LoadingIndicator";
import LogoAs64base from "../../types/LogoAsString";
import { MAX_LENGTH_EMAIL_ADDRESS, MAX_LENGTH_PASSWORD, MAX_LENGTH_USERNAME, MIN_LENGTH_EMAIL_ADDRESS, MIN_LENGTH_PASSWORD, MIN_LENGTH_USERNAME } from "../../types/Constants";

export default function Settings() {
    const [loginInfo] = React.useContext(LoginContext);
    const [userInfo, setUserInfo] = React.useContext(UserContext);
    const [pageKey, setPageKey] = useState("Profile");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [loading, setLoading] = useState(false);
    const [nameData, setNameData] = useState({ newName: "", oldPassword: "" });
    const [emailData, setEmailData] = useState({ newEmail: "", oldPassword: "" });
    const [passwordData, setPasswordData] = useState({ oldPassword: "", newPassword1: "", newPassword2: "" });
    const [selectedFile, setSelectedFile] = useState({ myFile: LogoAs64base });
    const [validated, setValidated] = useState(false);

    const handleFileChange = async (event: any) => {
        const file = event.target.files?.[0];
        if (file == null) {
            return;
        }
        const base64 = await converttobase64(file);
        setSelectedFile({ myFile: base64 as string });
    };

    const handleSubmitPicture = async () => {
        setLoading(true);
        setUserInfo({ ...userInfo, avatar: await updateUserProfilePicture(userInfo, selectedFile.myFile) });
        setLoading(false);
    }
    const handleDeletePicture = async () => {
        setLoading(true);
        setSelectedFile({ myFile: LogoAs64base });
        setUserInfo({ ...userInfo, avatar: await updateUserProfilePicture(userInfo, LogoAs64base) });
        setLoading(false);
    }

    useEffect(() => {
        function handleLogout() {
            if (loginInfo)
                return;
            setError("");
            setSuccess("");
            setValidated(false);
            setPageKey("Profile");
            clearData();
        }
        handleLogout();
    }, [loginInfo]);

    const clearData = () => {
        setNameData({ newName: "", oldPassword: "" });
        setEmailData({ newEmail: "", oldPassword: "" });
        setPasswordData({ oldPassword: "", newPassword1: "", newPassword2: "" });
    };
    const handleSelect = (newPage: any) => {
        setError("");
        setSuccess("");
        setValidated(false);
        setPageKey(String(newPage));
        clearData();
    };
    const handleUpdateName = (e: React.ChangeEvent<HTMLInputElement>) => { setNameData({ ...nameData, [e.target.name]: e.target.value }); setValidated(true); };
    const handleUpdateEmail = (e: React.ChangeEvent<HTMLInputElement>) => { setEmailData({ ...emailData, [e.target.name]: e.target.value }); setValidated(true); };
    const handleUpdatePassword = (e: React.ChangeEvent<HTMLInputElement>) => { setPasswordData({ ...passwordData, [e.target.name]: e.target.value }); setValidated(true); };
    const handleSubmit = async (e: any) => {
        e.preventDefault();
        setError("");
        setSuccess("");
        setValidated(true);
        if (e.currentTarget.checkValidity() === false)
            return;
        setLoading(true);
        try {
            if (pageKey === "ChangeUsername") {
                setUserInfo(await updateUser(userInfo, nameData, "name"));
                handleSelect("Profile");
                setSuccess("username");
            } else if (pageKey === "ChangeEmail") {
                setUserInfo(await updateUser(userInfo, emailData, "email"));
                handleSelect("Profile");
                setSuccess("email");
            } else if (pageKey === "ChangePassword") {
                setUserInfo(await updateUser(userInfo, passwordData, "password"));
                handleSelect("Profile");
                setSuccess("password");
            } else if (pageKey === "ChangeProfile") {
                setUserInfo(await updateUserProfilePicture(userInfo, selectedFile.myFile));
                handleSelect("Profile");
                setSuccess("profile picture");
            }
        } catch (error) {
            setError(String(error));
        }
        setLoading(false);
    };

    if (!loginInfo)
        return <></>;

    function handleKeyPress(e: any): void {
        if (e.key === 'Enter') {
            handleSubmit(e);
        }
    };

    return (
        <Tabs
            id="settings-tabs"
            activeKey={pageKey}
            onSelect={handleSelect}
        >
            <Tab id="settings-tabs-tab1" eventKey="Profile" title="Profile">
                <Alert id="settings-tabs-tab1-alert-danger" show={!!error} variant="danger">{error}</Alert>
                <Alert id="settings-tabs-tab1-alert-success" show={!!success} variant="success">{`Your ${success} has been successfully updated!`}</Alert>
                {userInfo ?
                    <ListGroup id="settings-tabs-tab1-listgroup">
                        <ListGroup.Item id="settings-tabs-tab1-listgroup-item0">{`Name: ${userInfo.name}`}</ListGroup.Item>
                        <ListGroup.Item id="settings-tabs-tab1-listgroup-item1">{`E-Mail: ${userInfo.email}`}</ListGroup.Item>
                        <ListGroup.Item id="settings-tabs-tab1-listgroup-item2">{`Admin: ${userInfo.admin ? "yes" : "no"}`}</ListGroup.Item>
                        <ListGroup.Item id="settings-tabs-tab1-listgroup-item3">{`Moderator: ${userInfo.mod ? "yes" : "no"}`}</ListGroup.Item>
                    </ListGroup>
                    : <></>}
            </Tab>
            <Tab id="settings-tabs-tab2" eventKey="ChangeUsername" title="Change Username">
                <Alert id="settings-tabs-tab2-alert" show={!!error} variant="danger">{error}</Alert>
                <Form id="settings-tabs-tab2-form" noValidate validated={validated} onSubmit={handleSubmit} onKeyDown={handleKeyPress}>
                    <Form.Group id="settings-tabs-tab2-form-group1">
                        <Form.Label id="settings-tabs-tab2-form-group1-label">New Username</Form.Label>
                        <Form.Control
                            type="text"
                            name="newName"
                            onChange={handleUpdateName}
                            placeholder="username"
                            value={nameData.newName}
                            autoFocus
                            required
                            minLength={MIN_LENGTH_USERNAME}
                            maxLength={MAX_LENGTH_USERNAME}
                            id="settings-tabs-tab2-form-group1-control"
                        ></Form.Control>
                        <Form.Control.Feedback id="settings-tabs-tab2-form-group1-feedback" type="invalid">Please enter a new username. A username should be at least {MIN_LENGTH_USERNAME} but no more than {MAX_LENGTH_USERNAME} characters long.</Form.Control.Feedback>
                    </Form.Group>
                    <Form.Group id="settings-tabs-tab2-form-group2">
                        <Form.Label id="settings-tabs-tab2-form-group2-label">Password</Form.Label>
                        <Form.Control
                            type="password"
                            name="oldPassword"
                            onChange={handleUpdateName}
                            value={nameData.oldPassword}
                            placeholder="password"
                            required
                            minLength={MIN_LENGTH_PASSWORD}
                            maxLength={MAX_LENGTH_PASSWORD}
                            id="settings-tabs-tab2-form-group2-control"
                        ></Form.Control>
                        <Form.Control.Feedback id="settings-tabs-tab2-form-group2-feedback" type="invalid">Please enter your password. Passwords shorter than {MIN_LENGTH_PASSWORD} characters are not allowed.</Form.Control.Feedback>
                    </Form.Group>
                    <Button id="settings-tabs-tab2-button" type="submit" disabled={loading}>Submit Changes</Button>
                    {loading ? <LoadingIndicator></LoadingIndicator> : <></>}
                </Form>
            </Tab>
            <Tab eventKey="ChangeEmail" title="Change E-Mail">
                <Alert id="settings-tabs-tab3-alert" show={!!error} variant="danger">{error}</Alert>
                <Form id="settings-tabs-tab3-form" noValidate validated={validated} onSubmit={handleSubmit} onKeyDown={handleKeyPress}>
                    <Form.Group id="settings-tabs-tab3-form-group1">
                        <Form.Label id="settings-tabs-tab3-form-group1-label">New E-Mail</Form.Label>
                        <Form.Control
                            type="text"
                            name="newEmail"
                            onChange={handleUpdateEmail}
                            value={emailData.newEmail}
                            placeholder="name@example.com"
                            autoFocus
                            required
                            minLength={MIN_LENGTH_EMAIL_ADDRESS}
                            maxLength={MAX_LENGTH_EMAIL_ADDRESS}
                            id="settings-tabs-tab3-form-group1-control"
                        ></Form.Control>
                        <Form.Control.Feedback id="settings-tabs-tab3-form-group1-feedback" type="invalid">Please a new valid email address.</Form.Control.Feedback>
                    </Form.Group>
                    <Form.Group id="settings-tabs-tab3-form-group2">
                        <Form.Label id="settings-tabs-tab3-form-group2-label">Password</Form.Label>
                        <Form.Control
                            type="password"
                            name="oldPassword"
                            onChange={handleUpdateEmail}
                            value={emailData.oldPassword}
                            placeholder="password"
                            required
                            minLength={MIN_LENGTH_PASSWORD}
                            maxLength={MAX_LENGTH_PASSWORD}
                            id="settings-tabs-tab3-form-group2-control"
                        ></Form.Control>
                        <Form.Control.Feedback id="settings-tabs-tab3-form-group2-feedback" type="invalid">Please enter your password. Passwords shorter than {MIN_LENGTH_PASSWORD} characters are not allowed.</Form.Control.Feedback>
                    </Form.Group>
                    <Button id="settings-tabs-tab3-button" type="submit" disabled={loading}>Submit Changes</Button>
                    {loading ? <LoadingIndicator></LoadingIndicator> : <></>}
                </Form>
            </Tab>
            <Tab eventKey="ChangePassword" title="Change Password">
                <Alert id="settings-tabs-tab4-alert" show={!!error} variant="danger">{error}</Alert>
                <Form id="settings-tabs-tab4-form" noValidate validated={validated} onSubmit={handleSubmit} onKeyDown={handleKeyPress}>
                    <Form.Group id="settings-tabs-tab4-form-group1">
                        <Form.Label id="settings-tabs-tab4-form-group1-label">Old Password</Form.Label>
                        <Form.Control
                            type="password"
                            name="oldPassword"
                            onChange={handleUpdatePassword}
                            value={passwordData.oldPassword}
                            placeholder="old password"
                            required
                            minLength={MIN_LENGTH_PASSWORD}
                            maxLength={MAX_LENGTH_PASSWORD}
                            id="settings-tabs-tab4-form-group1-control"
                        ></Form.Control>
                        <Form.Control.Feedback id="settings-tabs-tab4-form-group1-feedback" type="invalid">Please enter your old password. Passwords shorter than {MIN_LENGTH_PASSWORD} characters are not allowed.</Form.Control.Feedback>
                    </Form.Group>
                    <Form.Group id="settings-tabs-tab4-form-group2">
                        <Form.Label id="settings-tabs-tab4-form-group2-label">New Password</Form.Label>
                        <Form.Control
                            type="password"
                            name="newPassword1"
                            onChange={handleUpdatePassword}
                            value={passwordData.newPassword1}
                            placeholder="new password"
                            required
                            minLength={MIN_LENGTH_PASSWORD}
                            maxLength={MAX_LENGTH_PASSWORD}
                            pattern='^.*(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!#$%&?@]).*$'
                            id="settings-tabs-tab4-form-group2-control"
                        ></Form.Control>
                        <Form.Control.Feedback id="settings-tabs-tab4-form-group1-feedback" type="invalid">Please enter a new strong password. The password must be no shorter than {MIN_LENGTH_PASSWORD} characters and must contain a lowercase letter, an uppercase letter, a number, and a symbol.</Form.Control.Feedback>
                    </Form.Group>
                    <Form.Group id="settings-tabs-tab4-form-group3">
                        <Form.Label id="settings-tabs-tab4-form-group3-label">Confirm New Password</Form.Label>
                        <Form.Control
                            type="password"
                            name="newPassword2"
                            onChange={handleUpdatePassword}
                            value={passwordData.newPassword2}
                            placeholder="new password"
                            required
                            minLength={MIN_LENGTH_PASSWORD}
                            maxLength={MAX_LENGTH_PASSWORD}
                            id="settings-tabs-tab4-form-group3-control"
                        ></Form.Control>
                        <Form.Control.Feedback id="settings-tabs-tab4-form-group1-feedback" type="invalid">Please repeat the password from above.</Form.Control.Feedback>
                    </Form.Group>
                    <Button id="settings-tabs-tab4-button" type="submit" disabled={loading}>Submit Changes</Button>
                    {loading ? <LoadingIndicator></LoadingIndicator> : <></>}
                </Form>
            </Tab>
            <Tab eventKey="ChangeProfile" title="Change Profile Picture">
                <Alert id="settings-tabs-tab5-alert" show={!!error} variant="danger">{`An error occurred, please try again.\n${error}`}</Alert>
                {selectedFile && (
                    <div>
                        <p>Selected Image:</p>
                        <img
                            src={userInfo?.avatar || selectedFile.myFile}
                            alt="Avatar"
                            loading="lazy"
                        />
                    </div>
                )}
                <Form encType="multipart/form-data" noValidate validated={validated} onSubmit={handleSubmit} onKeyDown={handleKeyPress}>
                    <Form.Group id="settings-tabs-tab5-form-group1">
                        <Form.Label id="settings-tabs-tab5-form-group1-label">New Profile Picture</Form.Label>
                        <Form.Control
                            type="file"
                            name="newProfilePicture"
                            onChange={handleFileChange}
                            accept="image/*"
                            id="settings-tabs-tab5-form-group1-control"
                        />
                    </Form.Group>
                </Form>
                <Button id="settings-tabs-tab5-button" disabled={loading} onClick={handleSubmitPicture} style={{ marginRight: '10px' }}>
                    Submit Changes
                </Button>
                <Button id="settings-tabs-tab5-button" variant="danger" disabled={loading} onClick={handleDeletePicture}>
                    Delete Picture
                </Button>
                {loading ? <LoadingIndicator /> : <></>}
            </Tab>
        </Tabs>
    );
}