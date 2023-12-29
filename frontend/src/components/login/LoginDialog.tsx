import React, { useState } from "react";
import { Alert, Form, Modal } from "react-bootstrap";
import { Button } from 'react-bootstrap';
import LoadingIndicator from "../util/LoadingIndicator";
import { LoginContext, getLoginInfo, removeJWT, setJWT } from "./LoginContext";
import { login } from "../../api/api";
import { MAX_LENGTH_EMAIL_ADDRESS, MAX_LENGTH_PASSWORD, MIN_LENGTH_EMAIL_ADDRESS, MIN_LENGTH_PASSWORD } from "../../types/Constants";

export default function LoginDialog() {
    const [loginInfo, setLoginInfo] = React.useContext(LoginContext);
    const [showDialog, setShowDialog] = useState(false);
    const [loginData, setLoginData] = useState({ email: "", password: "" });
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [validated, setValidated] = useState(false);

    const handleShow = () => { setShowDialog(true); };
    const handleClose = () => { setShowDialog(false); setValidated(false); setLoginData({ email: "", password: "" }); setError(""); };
    const handleLogout = () => { removeJWT(); setLoginInfo(null); };
    const handleUpdate = (e: React.ChangeEvent<HTMLInputElement>) => { setLoginData({ ...loginData, [e.target.name]: e.target.value }); setValidated(true); };
    const handleSubmit = async (e: any) => {
        e.preventDefault();
        setError("");
        setValidated(true);
        if (e.currentTarget.checkValidity() === false)
            return;
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
    const handleKeyPress = (e: React.KeyboardEvent<Element>) => {
        if (e.key === 'Enter') {
            handleSubmit(e);
        }
    }

    if (loginInfo)
        return <Button variant="secondary" id="logindialog-button-logout" onClick={handleLogout}>Logout</Button>;

    return (
        <>
            <Button id="logindialog-button-login" onClick={handleShow}>Login</Button>

            <Modal id="logindialog-modal" show={showDialog} onEscapeKeyDown={handleClose}>
                <Modal.Header id="logindialog-modal-header" data-bs-theme="dark" onHide={handleClose} closeButton>
                    <Modal.Title id="logindialog-modal-header-title">Login</Modal.Title>
                </Modal.Header>
                <Form id="logindialog-modal-body-form" noValidate validated={validated} onSubmit={handleSubmit} onKeyDown={handleKeyPress}>
                    <Modal.Body id="logindialog-modal-body">
                        <Alert id="logindialog-modal-body-alert" show={!!error} variant="danger">{error}</Alert>
                        <Form.Group id="logindialog-modal-body-form-group1" >
                            <Form.Label id="logindialog-modal-body-form-group1-label">E-Mail</Form.Label>
                            <Form.Control
                                type="email"
                                name="email"
                                onChange={handleUpdate}
                                value={loginData.email}
                                placeholder="name@example.com"
                                autoFocus
                                required
                                minLength={MIN_LENGTH_EMAIL_ADDRESS}
                                maxLength={MAX_LENGTH_EMAIL_ADDRESS}
                                id="logindialog-modal-body-form-group1-control"
                            ></Form.Control>
                            <Form.Control.Feedback id="logindialog-modal-body-form-group1-feedback" type="invalid">Please enter your email address.</Form.Control.Feedback>
                        </Form.Group>
                        <Form.Group id="logindialog-modal-body-form-group2">
                            <Form.Label id="logindialog-modal-body-form-group2-label">Password</Form.Label>
                            <Form.Control
                                type="password"
                                name="password"
                                onChange={handleUpdate}
                                value={loginData.password}
                                placeholder="password"
                                required
                                minLength={MIN_LENGTH_PASSWORD}
                                maxLength={MAX_LENGTH_PASSWORD}
                                id="logindialog-modal-body-form-group2-control"
                            ></Form.Control>
                            <Form.Control.Feedback id="logindialog-modal-body-form-group2-feedback" type="invalid">Please enter your password. Passwords shorter than {MIN_LENGTH_PASSWORD} characters are not allowed.</Form.Control.Feedback>
                        </Form.Group>
                    </Modal.Body>
                    <Modal.Footer id="logindialog-modal-footer">
                        {loading ? <LoadingIndicator /> : <></>}
                        <Button id="logindialog-modal-footer-button-cancel" variant="secondary" onClick={handleClose}>Cancel</Button>
                        <Button id="logindialog-modal-footer-button-submit" type="submit" disabled={loading}>Submit</Button>
                    </Modal.Footer>
                </Form>
            </Modal>
        </>
    );
}
