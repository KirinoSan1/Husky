import React, { useEffect, useState } from "react";
import { LoginContext } from "../login/LoginContext";
import Tab from 'react-bootstrap/Tab';
import Tabs from 'react-bootstrap/Tabs';
import { Alert, Button, Form, ListGroup } from "react-bootstrap";
import { UserContext } from "./UserContext";
import { converttobase64, updateUser, updateUserProfilePicture } from "../../api/api";
import LoadingIndicator from "../util/LoadingIndicator";
import LogoAs64base from "../../types/LogoAsString";

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
        const response = await updateUserProfilePicture(userInfo, selectedFile.myFile);
        const obj = Object.assign({}, response);
        setUserInfo(obj);
        setLoading(false)
    }
    const handleDeletePicture = async () => {
        setLoading(true)
        setSelectedFile({ myFile: LogoAs64base })
        setUserInfo({ ...userInfo, avatar: await updateUserProfilePicture(userInfo, LogoAs64base) })
        setLoading(false)
    }

    useEffect(() => {
        function handleLogout() {
            if (loginInfo)
                return;
            setError("");
            setSuccess("");
            setPageKey("Profile");
            clearData();
        }
        handleLogout();
    }, [loginInfo]); // if you see a warning here - ignore it  // temporary fix (nesting the function)

    const clearData = () => {
        setNameData({ newName: "", oldPassword: "" });
        setEmailData({ newEmail: "", oldPassword: "" });
        setPasswordData({ oldPassword: "", newPassword1: "", newPassword2: "" });
    };
    const handleSelect = (newPage: any) => {
        setPageKey(String(newPage));
        setError("");
        setSuccess("");
        clearData();
    };
    const handleUpdateName = (e: React.ChangeEvent<HTMLInputElement>) => { setNameData({ ...nameData, [e.target.name]: e.target.value }); };
    const handleUpdateEmail = (e: React.ChangeEvent<HTMLInputElement>) => { setEmailData({ ...emailData, [e.target.name]: e.target.value }); };
    const handleUpdatePassword = (e: React.ChangeEvent<HTMLInputElement>) => { setPasswordData({ ...passwordData, [e.target.name]: e.target.value }); };


    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
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
                setSuccess("changed profile");
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
                <Alert id="settings-tabs-tab1-alert-danger" show={!!error} variant="danger">{`An error occurred, please try again.\n${error}`}</Alert>
                <Alert id="settings-tabs-tab1-alert-success" show={!!success} variant="success">{`Success! Your ${success} has been successfully updated!`}</Alert>
                {userInfo ?
                    <ListGroup id="settings-tabs-tab1-listgroup">
                        <ListGroup.Item id="settings-tabs-tab1-listgroup-item0">{`ID: ${userInfo.id}`}</ListGroup.Item>
                        <ListGroup.Item id="settings-tabs-tab1-listgroup-item1">{`Name: ${userInfo.name}`}</ListGroup.Item>
                        <ListGroup.Item id="settings-tabs-tab1-listgroup-item2">{`E-Mail: ${userInfo.email}`}</ListGroup.Item>
                        <ListGroup.Item id="settings-tabs-tab1-listgroup-item3">{`Admin: ${userInfo.admin}`}</ListGroup.Item>
                        <ListGroup.Item id="settings-tabs-tab1-listgroup-item4">{`Moderator: ${userInfo.mod}`}</ListGroup.Item>
                    </ListGroup>
                    : <></>}
            </Tab>
            <Tab id="settings-tabs-tab2" eventKey="ChangeUsername" title="Change Username" onKeyPress={(e: React.KeyboardEvent) => handleKeyPress(e)}>
                <Alert id="settings-tabs-tab2-alert" show={!!error} variant="danger">{`An error occurred, please try again.\n${error}`}</Alert>
                <Form id="settings-tabs-tab2-form">
                    <Form.Group id="settings-tabs-tab2-form-group1">
                        <Form.Label id="settings-tabs-tab2-form-group1-label">New Username</Form.Label>
                        <Form.Control
                            type="text"
                            name="newName"
                            onChange={handleUpdateName}
                            placeholder="username"
                            value={nameData.newName}
                            autoFocus
                            id="settings-tabs-tab2-form-group1-control"
                        ></Form.Control>
                    </Form.Group>
                    <Form.Group id="settings-tabs-tab2-form-group2">
                        <Form.Label id="settings-tabs-tab2-form-group2-label">Password</Form.Label>
                        <Form.Control
                            type="password"
                            name="oldPassword"
                            onChange={handleUpdateName}
                            value={nameData.oldPassword}
                            placeholder="password"
                            id="settings-tabs-tab2-form-group2-control"
                        ></Form.Control>
                    </Form.Group>
                </Form>
                <Button id="settings-tabs-tab2-button" disabled={loading} onClick={handleSubmit}>Submit Changes</Button>
                {loading ? <LoadingIndicator></LoadingIndicator> : <></>}
            </Tab>
            <Tab eventKey="ChangeEmail" title="Change E-Mail" onKeyPress={(e: React.KeyboardEvent) => handleKeyPress(e)}>
                <Alert id="settings-tabs-tab3-alert" show={!!error} variant="danger">{`An error occurred, please try again.\n${error}`}</Alert>
                <Form id="settings-tabs-tab3-form">
                    <Form.Group id="settings-tabs-tab3-form-group1">
                        <Form.Label id="settings-tabs-tab3-form-group1-label">New E-Mail</Form.Label>
                        <Form.Control
                            type="text"
                            name="newEmail"
                            onChange={handleUpdateEmail}
                            value={emailData.newEmail}
                            placeholder="name@example.com"
                            autoFocus
                            id="settings-tabs-tab3-form-group1-control"
                        ></Form.Control>
                    </Form.Group>
                    <Form.Group id="settings-tabs-tab3-form-group2">
                        <Form.Label id="settings-tabs-tab3-form-group2-label">Password</Form.Label>
                        <Form.Control
                            type="password"
                            name="oldPassword"
                            onChange={handleUpdateEmail}
                            value={emailData.oldPassword}
                            placeholder="password"
                            id="settings-tabs-tab3-form-group2-control"
                        ></Form.Control>
                    </Form.Group>
                </Form>
                <Button id="settings-tabs-tab3-button" disabled={loading} onClick={handleSubmit}>Submit Changes</Button>
                {loading ? <LoadingIndicator></LoadingIndicator> : <></>}
            </Tab>
            <Tab eventKey="ChangePassword" title="Change Password" onKeyPress={(e: React.KeyboardEvent) => handleKeyPress(e)}>
                <Alert id="settings-tabs-tab4-alert" show={!!error} variant="danger">{`An error occurred, please try again.\n${error}`}</Alert>
                <Form id="settings-tabs-tab4-form" >
                    <Form.Group id="settings-tabs-tab4-form-group1">
                        <Form.Label id="settings-tabs-tab4-form-group1-label">Old Password</Form.Label>
                        <Form.Control
                            type="password"
                            name="oldPassword"
                            onChange={handleUpdatePassword}
                            value={passwordData.oldPassword}
                            placeholder="old password"
                            id="settings-tabs-tab4-form-group1-control"
                        ></Form.Control>
                    </Form.Group>
                    <Form.Group id="settings-tabs-tab4-form-group2">
                        <Form.Label id="settings-tabs-tab4-form-group2-label">New Password</Form.Label>
                        <Form.Control
                            type="password"
                            name="newPassword1"
                            onChange={handleUpdatePassword}
                            value={passwordData.newPassword1}
                            placeholder="new password"
                            id="settings-tabs-tab4-form-group2-control"
                        ></Form.Control>
                    </Form.Group>
                    <Form.Group id="settings-tabs-tab4-form-group3">
                        <Form.Label id="settings-tabs-tab4-form-group3-label">Confirm New Password</Form.Label>
                        <Form.Control
                            type="password"
                            name="newPassword2"
                            onChange={handleUpdatePassword}
                            value={passwordData.newPassword2}
                            placeholder="new password"
                            id="settings-tabs-tab4-form-group3-control"
                        ></Form.Control>
                    </Form.Group>
                </Form>
                <Button id="settings-tabs-tab4-button" disabled={loading} onClick={handleSubmit}>Submit Changes</Button>
                {loading ? <LoadingIndicator></LoadingIndicator> : <></>}
            </Tab>
            <Tab eventKey="ChangeProfile" title="Change Profile Picture" onKeyPress={(e: React.KeyboardEvent) => handleKeyPress(e)}>
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
                <Form encType="multipart/form-data" onSubmit={handleSubmit}>
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
                {/* Has to be a red button */}
                <Button id="settings-tabs-tab5-button" disabled={loading} onClick={handleDeletePicture} className="btn-danger">
                    Delete Picture
                </Button>
                {loading ? <LoadingIndicator /> : <></>}
            </Tab>
        </Tabs>
    );
}