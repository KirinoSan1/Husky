import { Alert, Button, Form, Modal } from "react-bootstrap";
import { LoginContext, getLoginInfo, setJWT } from "../login/LoginContext";
import React, { useState } from "react";
import LoadingIndicator from "../util/LoadingIndicator";
import { register } from "../../api/api";

export default function CreateAccountDialog() {
    const [loginInfo, setLoginInfo] = React.useContext(LoginContext);
    const [showDialog, setShowDialog] = useState(false);
    const [registrationData, setRegistrationData] = useState({ username: "", email: "", password1: "", password2: "" });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleShow = () => { setShowDialog(true); };
    const handleClose = () => { setShowDialog(false); setError(""); setRegistrationData({ username: "", email: "", password1: "", password2: "" }); };
    const handleUpdate = (e: React.ChangeEvent<HTMLInputElement>) => { setRegistrationData({ ...registrationData, [e.target.name]: e.target.value }); };
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const response = await register(registrationData);
            setJWT(response.access_token);
            setLoginInfo(getLoginInfo());
            handleClose();
        } catch (error) {
            setError(String(error));
        }
        setLoading(false);
    };

    if (loginInfo)
        return <></>;

    return (
        <>
            <Button id="createaccount-button" onClick={handleShow}>Create Account</Button>

            <Modal id="createaccount-modal" show={showDialog} onHide={handleClose}>
                <Modal.Header id="createaccount-modal-header" data-bs-theme="dark" closeButton>
                    <Modal.Title id="createaccount-modal-header-title">Create Account</Modal.Title>
                </Modal.Header>
                <Modal.Body id="createaccount-modal-body">
                    <Alert id="createaccount-modal-body-alert" show={!!error} variant="danger">{`An error occurred, please try again.\n${error}`}</Alert>
                    <Form id="createaccount-modal-body-form">
                        <Form.Group id="createaccount-modal-body-form-group1">
                            <Form.Label id="createaccount-modal-body-form-group1-label">Username</Form.Label>
                            <Form.Control
                                type="text"
                                name="username"
                                onChange={handleUpdate}
                                value={registrationData.username}
                                placeholder="username"
                                autoFocus
                                id="createaccount-modal-body-form-group1-control"
                            ></Form.Control>
                        </Form.Group>
                        <Form.Group id="createaccount-modal-body-form-group2">
                            <Form.Label id="createaccount-modal-body-form-group2-label">E-Mail</Form.Label>
                            <Form.Control
                                type="email"
                                name="email"
                                onChange={handleUpdate}
                                value={registrationData.email}
                                placeholder="name@example.com"
                                id="createaccount-modal-body-form-group2-control"
                            ></Form.Control>
                        </Form.Group>
                        <Form.Group id="createaccount-modal-body-form-group3">
                            <Form.Label id="createaccount-modal-body-form-group3-label">Password</Form.Label>
                            <Form.Control
                                type="password"
                                name="password1"
                                onChange={handleUpdate}
                                value={registrationData.password1}
                                placeholder="password"
                                id="createaccount-modal-body-form-group3-control"
                            ></Form.Control>
                        </Form.Group>
                        <Form.Group id="createaccount-modal-body-form-group4">
                            <Form.Label id="createaccount-modal-body-form-group4-label">Confirm Password</Form.Label>
                            <Form.Control
                                type="password"
                                name="password2"
                                onChange={handleUpdate}
                                value={registrationData.password2}
                                placeholder="password"
                                id="createaccount-modal-body-form-group4-control"
                            ></Form.Control>
                        </Form.Group>
                    </Form>
                </Modal.Body>
                <Modal.Footer id="createaccount-modal-footer">
                    {loading ? <LoadingIndicator></LoadingIndicator> : <></>}
                    <Button id="createaccount-modal-footer-button-cancel" variant="secondary" onClick={handleClose}>Cancel</Button>
                    <Button id="createaccount-modal-footer-button-submit" disabled={loading} onClick={handleSubmit}>Submit</Button>
                </Modal.Footer>
            </Modal>
        </>
    );
}