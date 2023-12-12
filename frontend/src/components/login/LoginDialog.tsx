import React, { useState } from "react";
import { Alert, Form, Modal } from "react-bootstrap";
import { Button } from 'react-bootstrap';
import LoadingIndicator from "../util/LoadingIndicator";
import { LoginContext, getLoginInfo, removeJWT, setJWT } from "./LoginContext";
import { login } from "../../api/api";

export default function LoginDialog() {
    const [loginInfo, setLoginInfo] = React.useContext(LoginContext);
    const [showDialog, setShowDialog] = useState(false);
    const [loginData, setLoginData] = useState({ email: "", password: "" });
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleShow = () => { setShowDialog(true); };
    const handleClose = () => { setShowDialog(false); setLoginData({ email: "", password: "" }); setError(""); };
    const handleLogout = () => { removeJWT(); setLoginInfo(null); };
    const handleUpdate = (e: React.ChangeEvent<HTMLInputElement>) => { setLoginData({ ...loginData, [e.target.name]: e.target.value }); };
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const response = await login(loginData);
            setJWT(response.access_token);
            setLoginInfo(getLoginInfo());
            handleClose();
        } catch (error) {
            setError(String(error));
        }
        setLoading(false);
    }

    if (loginInfo)
        return <Button variant="secondary" id="logindialog-button-logout" onClick={handleLogout}>Logout</Button>;

    return (
        <>
            <Button id="logindialog-button-login" onClick={handleShow}>Login</Button>

            <Modal id="logindialog-modal" show={showDialog} onHide={handleClose}>
                <Modal.Header id="logindialog-modal-header" data-bs-theme="dark" closeButton>
                    <Modal.Title id="logindialog-modal-header-title">Login</Modal.Title>
                </Modal.Header>
                <Modal.Body id="logindialog-modal-body">
                    <Alert id="logindialog-modal-body-alert" show={!!error} variant="danger">{"An error occurred, please try again.\n" + error}</Alert>
                    <Form id="logindialog-modal-body-form">
                        <Form.Group id="logindialog-modal-body-form-group1">
                            <Form.Label id="logindialog-modal-body-form-group1-label">E-Mail</Form.Label>
                            <Form.Control
                                type="email"
                                name="email"
                                onChange={handleUpdate}
                                value={loginData.email}
                                placeholder="name@example.com"
                                autoFocus
                                id="logindialog-modal-body-form-group1-control"
                            ></Form.Control>
                        </Form.Group>
                        <Form.Group id="logindialog-modal-body-form-group2">
                            <Form.Label id="logindialog-modal-body-form-group2-label">Password</Form.Label>
                            <Form.Control
                                type="password"
                                name="password"
                                onChange={handleUpdate}
                                value={loginData.password}
                                placeholder="password"
                                id="logindialog-modal-body-form-group2-control"
                            ></Form.Control>
                        </Form.Group>
                    </Form>
                </Modal.Body>
                <Modal.Footer id="logindialog-modal-footer">
                    {loading ? <LoadingIndicator /> : <></>}
                    <Button id="logindialog-modal-footer-button-cancel" variant="secondary" onClick={handleClose}>Cancel</Button>
                    <Button id="logindialog-modal-footer-button-submit" disabled={loading} onClick={handleSubmit}>Submit</Button>
                </Modal.Footer>
            </Modal>
        </>
    );
}
