import React, { useState } from "react";
import { Alert, Form, Modal } from "react-bootstrap";
import { Button } from 'react-bootstrap';
import LoadingIndicator from "../util/LoadingIndicator";
import { LoginContext, removeJWT, setJWT } from "./LoginContext";
import { login } from "../../api/api";

export default function LoginDialog() {
    const [loggedIn, setLoggedIn] = React.useContext(LoginContext);
    const [showDialog, setShowDialog] = useState(false);
    const [loginData, setLoginData] = useState({ email: "", password: "" });
    const [loggingIn, setLoggingIn] = useState(false);
    const [showError, setShowError] = useState(false);
    const [error, setError] = useState("");

    const handleShow = () => { setShowDialog(true); };
    const handleClose = () => { setShowDialog(false); setShowError(false); setLoginData({ email: "", password: "" }); setError(""); };
    const handleLogout = () => { removeJWT(); setLoggedIn(false); };
    const handleUpdate = (e: React.ChangeEvent<HTMLInputElement>) => { setLoginData({ ...loginData, [e.target.name]: e.target.value }); };
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoggingIn(true);
        try {
            const response = await login(loginData);
            setJWT(response.access_token);
            setLoggedIn(true);
            handleClose();
        } catch (error) {
            setShowError(true);
            setError(String(error));
        }
        setLoggingIn(false);
    }

    if (loggedIn)
        return <Button variant="secondary" id="LoginDialog.Button.Logout" onClick={handleLogout}>Logout</Button>;

    return (
        <>
            <Button id="LoginDialog.Button.Login" onClick={handleShow}>Login</Button>

            <Modal id="LoginDialog.Modal" show={showDialog} onHide={handleClose}>
                <Modal.Header id="LoginDialog.Modal.Header" closeButton>
                    <Modal.Title id="LoginDialog.Modal.Header.Title">Login</Modal.Title>
                </Modal.Header>
                <Modal.Body id="LoginDialog.Modal.Body">
                    <Alert id="LoginDialog.Modal.Body.Alert" show={showError} variant="danger">{"An error occurred, please try again.\n" + error}</Alert>
                    <Form id="LoginDialog.Modal.Body.Form">
                        <Form.Group id="LoginDialog.Modal.Body.Form.Group1">
                            <Form.Label id="LoginDialog.Modal.Body.Form.Group1.Label">E-Mail</Form.Label>
                            <Form.Control
                                type="email"
                                name="email"
                                onChange={handleUpdate}
                                placeholder="name@example.com"
                                autoFocus
                                id="LoginDialog.Modal.Body.Form.Group1.Control"
                            ></Form.Control>
                        </Form.Group>
                        <Form.Group id="LoginDialog.Modal.Body.Form.Group2">
                            <Form.Label id="LoginDialog.Modal.Body.Form.Group2.Label">Passwort</Form.Label>
                            <Form.Control
                                type="password"
                                name="password"
                                onChange={handleUpdate}
                                placeholder="password"
                                id="LoginDialog.Modal.Body.Form.Group2.Control"
                            ></Form.Control>
                        </Form.Group>
                    </Form>
                </Modal.Body>
                <Modal.Footer id="LoginDialog.Modal.Footer">
                    {loggingIn ? <LoadingIndicator></LoadingIndicator> : <></>}
                    <Button id="LoginDialog.Modal.Footer.Button.Cancel" variant="secondary" onClick={handleClose}>Cancel</Button>
                    <Button id="LoginDialog.Modal.Footer.Button.Submit" disabled={loggingIn} onClick={handleSubmit}>Submit</Button>
                </Modal.Footer>
            </Modal>
        </>
    );
}
