import { useContext, useEffect, useState } from "react";
import { LoginContext } from "../login/LoginContext";
import { Alert, Button, Dropdown } from "react-bootstrap";
import LoadingIndicator from "../util/LoadingIndicator";
import { createThread } from "../../api/api";
import { UserContext } from "../settings/UserContext";
import { useNavigate } from "react-router-dom";
import { SubForumName } from "../../types/Resources";

export function CreateThreadPage() {
    const [loginInfo] = useContext(LoginContext);
    const [userInfo] = useContext(UserContext);
    const [title, setTitle] = useState("");
    const [subForum, setSubForum] = useState<SubForumName>("");
    const [content, setContent] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const navigate = useNavigate();

    const handleUpdateTitle = (e: React.ChangeEvent<HTMLInputElement>) => { setTitle(e.target.value); };
    const handleUpdateContent = (e: any) => { setContent(e.target.value); };
    const handleSubmit = async () => {
        setLoading(true);
        try {
            const response = await createThread(userInfo.id, title, subForum, content);
            navigate(`/threads/${response.id}`);
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
        }
    }, [loginInfo]);

    if (!loginInfo)
        return <Alert id="createthread-alert1" variant="danger">Error: You don't have permission to access this page</Alert>;

    return (
        <>
            {error && <Alert id="createthread-alert2" variant="danger">{error}</Alert>}
            <h3 id="createthread-h3">Create New Thread</h3>
            <p id="createthread-p1">Please enter the title:</p>
            <input id="createthread-input" className="form-control" type="search" placeholder="Title..." onChange={handleUpdateTitle} value={title}></input>
            <Dropdown id="createthread-dropdown">
                <Dropdown.Toggle id="createthread-dropdown-toggle">{subForum.length === 0 ? "Choose Subforum" : subForum}</Dropdown.Toggle>
                <Dropdown.Menu id="createthread-dropdown-menu">
                    <Dropdown.Item id="createthread-dropdown-menu-item1" onClick={() => { setSubForum("Cuisine"); }}>Cuisine</Dropdown.Item>
                    <Dropdown.Item id="createthread-dropdown-menu-item2" onClick={() => { setSubForum("History"); }}>History</Dropdown.Item>
                    <Dropdown.Item id="createthread-dropdown-menu-item3" onClick={() => { setSubForum("Mathematics"); }}>Mathematics</Dropdown.Item>
                    <Dropdown.Item id="createthread-dropdown-menu-item4" onClick={() => { setSubForum("Philosophy"); }}>Philosophy</Dropdown.Item>
                    <Dropdown.Item id="createthread-dropdown-menu-item5" onClick={() => { setSubForum("Science"); }}>Science</Dropdown.Item>
                </Dropdown.Menu>
            </Dropdown>
            <p id="createthread-p2">Please create the initial post:</p>
            <textarea id="createthread-textarea" className="textarea" placeholder="Write something awesome!" onChange={handleUpdateContent} value={content}></textarea>
            <div id="createthread-button-bar">
                <Button id="createthread-button1" variant="secondary" onClick={() => { navigate("/threads"); }}>Go Back</Button>
                <Button id="createthread-button2" onClick={handleSubmit} disabled={title.length === 0 || subForum === "" || content.length === 0 || loading}>Submit</Button>
            </div>
            {loading && <LoadingIndicator></LoadingIndicator>}
        </>
    );
}