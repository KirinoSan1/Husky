import { useContext, useEffect, useState } from "react";
import { LoginContext } from "../login/LoginContext";
import { Alert, Button, Dropdown, Form } from "react-bootstrap";
import LoadingIndicator from "../util/LoadingIndicator";
import { createThread } from "../../api/api";
import { UserContext } from "../settings/UserContext";
import { useNavigate } from "react-router-dom";
import { SubForumName } from "../../types/Resources";
import { MAX_LENGTH_POST_CONTENT, MAX_LENGTH_THREAD_TITLE, MIN_LENGTH_POST_CONTENT, MIN_LENGTH_THREAD_TITLE } from "../../types/Constants";

export function CreateThreadPage() {
    const [loginInfo] = useContext(LoginContext);
    const [userInfo] = useContext(UserContext);
    const [title, setTitle] = useState("");
    const [subForum, setSubForum] = useState<SubForumName>("");
    const [content, setContent] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [validated, setValidated] = useState(false);
    const [success, setSuccess] = useState(false);
    const navigate = useNavigate();

    const handleUpdateTitle = (e: React.ChangeEvent<HTMLInputElement>) => { setTitle(e.target.value); setValidated(true); };
    const handleUpdateContent = (e: any) => { setContent(e.target.value); setValidated(true); };
    const handleSubmit = async (e: any) => {
        e.preventDefault();
        setError("");
        setValidated(true);
        if (e.currentTarget.checkValidity() === false || subForum.length === 0)
            return;
        setLoading(true);
        try {
            const response = await createThread(userInfo.id, title, subForum, content);
            setSuccess(true);
            setTimeout(() => { navigate(`/threads/${response.id}`); }, 5000);
        } catch (error) {
            setError(String(error));
        }
        setLoading(false);
    };

    useEffect(() => {
        if (!loginInfo) {
            setTitle("");
            setSubForum("");
            setContent("");
            setError("");
            setSuccess(false);
            setValidated(false);
        }
    }, [loginInfo]);

    if (!loginInfo)
        return <Alert id="createthread-alert1" variant="danger">You don't have permission to access this page</Alert>;

    function handleKeyPress(e: React.KeyboardEvent<Element>): void {
        if (e.key === 'Enter') {
            handleSubmit(e);
        }
    }

    return (
        <>
            {error && <Alert id="createthread-alert2" variant="danger">{error}</Alert>}
            {success && <Alert variant="success">The thread was successfully created! You will be redirected shortly.</Alert>}
            <h3 id="createthread-h3">Create New Thread</h3>
            <Form noValidate validated={validated} onSubmit={handleSubmit} onKeyDown={handleKeyPress}>
                <Form.Group>
                    <Form.Label id="createthread-p1">Please enter the title:</Form.Label>
                    <Form.Control
                        id="createthread-input"
                        type="text"
                        className="form-control"
                        placeholder="Title..."
                        onChange={handleUpdateTitle}
                        value={title}
                        required
                        minLength={MIN_LENGTH_THREAD_TITLE}
                        maxLength={MAX_LENGTH_THREAD_TITLE}
                    />
                    <Form.Control.Feedback type="invalid">Please choose a meaningful title for the thread. The title must not be shorter than {MIN_LENGTH_THREAD_TITLE} characters.</Form.Control.Feedback>
                </Form.Group>
                <Form.Group>
                    <Dropdown id="createthread-dropdown">
                        <Dropdown.Toggle id="createthread-dropdown-toggle">{subForum.length === 0 ? "Choose Subforum" : subForum}</Dropdown.Toggle>
                        <Dropdown.Menu id="createthread-dropdown-menu">
                            <Dropdown.Item id="createthread-dropdown-menu-item1" onClick={() => { setSubForum("Cuisine"); setValidated(true); }}>Cuisine</Dropdown.Item>
                            <Dropdown.Item id="createthread-dropdown-menu-item2" onClick={() => { setSubForum("History"); setValidated(true); }}>History</Dropdown.Item>
                            <Dropdown.Item id="createthread-dropdown-menu-item3" onClick={() => { setSubForum("Mathematics"); setValidated(true); }}>Mathematics</Dropdown.Item>
                            <Dropdown.Item id="createthread-dropdown-menu-item4" onClick={() => { setSubForum("Philosophy"); setValidated(true); }}>Philosophy</Dropdown.Item>
                            <Dropdown.Item id="createthread-dropdown-menu-item5" onClick={() => { setSubForum("Science"); setValidated(true); }}>Science</Dropdown.Item>
                        </Dropdown.Menu>
                    </Dropdown>
                    <Alert show={validated === true && subForum.length === 0} variant="danger">Please choose an appropriate subforum for the thread.</Alert>
                </Form.Group>
                <Form.Group>
                    <Form.Label id="createthread-p2">
                        Please create the initial post:
                    </Form.Label>
                    <Form.Control
                        id="createthread-input"
                        type="text"
                        as="textarea"
                        rows={6}
                        className="textarea"
                        placeholder="Write something awesome!"
                        onChange={handleUpdateContent}
                        value={content}
                        required
                        minLength={MIN_LENGTH_POST_CONTENT}
                        maxLength={MAX_LENGTH_POST_CONTENT}
                    />
                    <Form.Control.Feedback type="invalid">The initial post must contain at least {MIN_LENGTH_POST_CONTENT} characters.</Form.Control.Feedback>
                </Form.Group>
                <div id="createthread-button-bar">
                    <Button id="createthread-button1" variant="secondary" onClick={() => { navigate("/threads"); }}>Go Back</Button>
                    <Button id="createthread-button2" type="submit" disabled={loading || success}>Submit</Button>
                </div>
            </Form>
            {loading && <LoadingIndicator />}
        </>
    );
}