import { Alert, Button, Form, Modal } from "react-bootstrap";
import { LoginContext } from "../login/LoginContext";
import React, { useState } from "react";
import LoadingIndicator from "../util/LoadingIndicator";
import { register } from "../../api/api";
import { MAX_LENGTH_EMAIL_ADDRESS, MAX_LENGTH_PASSWORD, MAX_LENGTH_USERNAME, MIN_LENGTH_EMAIL_ADDRESS, MIN_LENGTH_PASSWORD, MIN_LENGTH_USERNAME } from "../../types/Constants";

export default function CreateAccountDialog() {
    const [loginInfo] = React.useContext(LoginContext);
    const [showDialog, setShowDialog] = useState(false);
    const [registrationData, setRegistrationData] = useState({ username: "", email: "", password1: "", password2: "" });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [validated, setValidated] = useState(false);
    const [success, setSuccess] = useState(false);

    const handleShow = () => { setShowDialog(true); };
    const handleClose = () => { setShowDialog(false); setError(""); setValidated(false); setSuccess(false); setRegistrationData({ username: "", email: "", password1: "", password2: "" }); };
    const handleUpdate = (e: React.ChangeEvent<HTMLInputElement>) => { setRegistrationData({ ...registrationData, [e.target.name]: e.target.value }); setValidated(true); };
    const handleSubmit = async (e: any) => {
        e.preventDefault();
        setError("");
        setValidated(true);
        if (e.currentTarget.checkValidity() === false)
            return;
        setLoading(true);
        try {
            await register(registrationData);
            setSuccess(true);
            setTimeout(() => { handleClose(); }, 20000);
        } catch (error) {
            setError(String(error));
        }
        setLoading(false);
    };
    const handleKeyPress = (e: React.KeyboardEvent<Element>) => {
        if (e.key === 'Enter') {
            handleSubmit(e);
        }
    }

    if (loginInfo)
        return <></>;

    return (
        <>
            <Button id="createaccount-button" onClick={handleShow}>Create Account</Button>

            <Modal id="createaccount-modal" show={showDialog} onEscapeKeyDown={handleClose}>
                <Modal.Header id="createaccount-modal-header" data-bs-theme="dark" onHide={handleClose} closeButton>
                    <Modal.Title id="createaccount-modal-header-title">Create Account</Modal.Title>
                </Modal.Header>
                <Form id="createaccount-modal-body-form" noValidate validated={validated} onSubmit={handleSubmit} onKeyDown={handleKeyPress}>
                    <Modal.Body id="createaccount-modal-body">
                        <Alert id="createaccount-modal-body-alert" show={!!error} variant="danger">{error}</Alert>
                        <Alert id="createaccount-modal-body-success" show={!!success} variant="success">{`Success! If the provided email address is still available, a new account has been created for you. It is disabled until you have confirmed your email address by clicking on the link in the confirmation mail sent to your email address. You may now close this dialog, or wait for it to close automatically.`}</Alert>
                        <Form.Group id="createaccount-modal-body-form-group1">
                            <Form.Label id="createaccount-modal-body-form-group1-label">Username</Form.Label>
                            <Form.Control
                                type="text"
                                name="username"
                                onChange={handleUpdate}
                                value={registrationData.username}
                                placeholder="username"
                                autoFocus
                                required
                                minLength={MIN_LENGTH_USERNAME}
                                maxLength={MAX_LENGTH_USERNAME}
                                id="createaccount-modal-body-form-group1-control"
                            ></Form.Control>
                            <Form.Control.Feedback id="createaccount-modal-body-form-group1-feedback" type="invalid">Enter a username which is at least {MIN_LENGTH_USERNAME} but no more than {MAX_LENGTH_USERNAME} characters long.</Form.Control.Feedback>
                        </Form.Group>
                        <Form.Group id="createaccount-modal-body-form-group2">
                            <Form.Label id="createaccount-modal-body-form-group2-label">E-Mail</Form.Label>
                            <Form.Control
                                type="email"
                                name="email"
                                onChange={handleUpdate}
                                value={registrationData.email}
                                placeholder="name@example.com"
                                required
                                minLength={MIN_LENGTH_EMAIL_ADDRESS}
                                maxLength={MAX_LENGTH_EMAIL_ADDRESS}
                                id="createaccount-modal-body-form-group2-control"
                            ></Form.Control>
                            <Form.Control.Feedback id="createaccount-modal-body-form-group2-feedback" type="invalid">Enter a valid email address.</Form.Control.Feedback>
                        </Form.Group>
                        <Form.Group id="createaccount-modal-body-form-group3">
                            <Form.Label id="createaccount-modal-body-form-group3-label">Password</Form.Label>
                            <Form.Control
                                type="password"
                                name="password1"
                                onChange={handleUpdate}
                                value={registrationData.password1}
                                placeholder="password"
                                required
                                minLength={MIN_LENGTH_PASSWORD}
                                maxLength={MAX_LENGTH_PASSWORD}
                                // the following regular expression matches all strings which contain
                                // - at least one lowercase letter
                                // - at least one uppercase letter
                                // - at least one number
                                // - at least one symbol
                                // I stole this from here: https://stackoverflow.com/questions/2370015/regular-expression-for-password-validation
                                pattern='^.*(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!#$%&?@]).*$'
                                id="createaccount-modal-body-form-group3-control"
                            ></Form.Control>
                            <Form.Control.Feedback id="createaccount-modal-body-form-group3-feedback" type="invalid">Enter a strong password. The password must be no shorter than {MIN_LENGTH_PASSWORD} characters and must contain a lowercase letter, an uppercase letter, a number, and a symbol.</Form.Control.Feedback>
                        </Form.Group>
                        <Form.Group id="createaccount-modal-body-form-group4">
                            <Form.Label id="createaccount-modal-body-form-group4-label">Confirm Password</Form.Label>
                            <Form.Control
                                type="password"
                                name="password2"
                                onChange={handleUpdate}
                                value={registrationData.password2}
                                placeholder="password"
                                required
                                minLength={MIN_LENGTH_PASSWORD}
                                maxLength={MAX_LENGTH_PASSWORD}
                                id="createaccount-modal-body-form-group4-control"
                            ></Form.Control>
                            <Form.Control.Feedback id="createaccount-modal-body-form-group4-feedback" type="invalid">Please repeat the password from above.</Form.Control.Feedback>
                        </Form.Group>
                    </Modal.Body>
                    <Modal.Footer id="createaccount-modal-footer">
                        {loading ? <LoadingIndicator></LoadingIndicator> : <></>}
                        <Button id="createaccount-modal-footer-button-cancel" variant="secondary" onClick={handleClose}>Cancel</Button>
                        <Button id="createaccount-modal-footer-button-submit" type="submit" disabled={loading || success}>Submit</Button>
                    </Modal.Footer>
                </Form>
            </Modal>
        </>
    );
}