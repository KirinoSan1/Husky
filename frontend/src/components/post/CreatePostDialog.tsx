import { KeyboardEvent, useContext, useEffect, useState } from "react";
import { LoginContext } from "../login/LoginContext";
import { Alert, Button } from "react-bootstrap";
import LoadingIndicator from "../util/LoadingIndicator";
import { createPost, getThread } from "../../api/api";
import { UserContext } from "../settings/UserContext";
import { PageNumContext, ThreadContext, ThreadPageContext } from "../thread/Thread";

export default function CreatePostDialog() {
    const [thread, setThread] = useContext(ThreadContext);
    const [threadPage] = useContext(ThreadPageContext);
    const [, setPageNum] = useContext(PageNumContext);

    const [loginInfo] = useContext(LoginContext);
    const [userInfo] = useContext(UserContext);
    const [showDialog, setShowDialog] = useState(false);
    const [content, setContent] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleOpen = () => { setShowDialog(true); };
    const handleClose = () => { setShowDialog(false); setContent(""); setError(""); };
    const handleUpdate = (e: any) => { setContent(e.target.value); };
    const handleSubmit = async () => {
        setLoading(true);
        try {
            await createPost(content, userInfo.id, thread.id, threadPage.id);
            const newThread = await getThread(thread.id);
            setThread(newThread);
            setPageNum(newThread.pages.length - 1);
        } catch (error) {
            setError(String(error));
        }
        setLoading(false);
    };

    useEffect(() => {
        if (!loginInfo) {
            handleClose();
        } else {
            handleOpen();
        }
    }, [loginInfo]);

    if (!showDialog) {
        return <></>;
    }

    function handleKeyPress(e: KeyboardEvent<Element>): void {
        if (e.key === 'Enter') {
            handleSubmit();
        }
    }

    return (
        <>
            {error && <Alert id="createpostdialog-alert" variant="danger">{error}</Alert>}
            <div className="threadpage-horizontal-line" />
            <div id="create-post-container">
                <h4>Add new post</h4>
                <textarea id="createpostdialog-textarea" placeholder="Write something awesome!" onChange={handleUpdate} value={content} className="textarea" onKeyPress={(e: React.KeyboardEvent) => handleKeyPress(e)} />
                <div className="button-bar">
                    <Button id="createpostdialog-button2" onClick={handleSubmit} disabled={content.length === 0 || loading}>Submit</Button>
                </div>
            </div>
            <div className="threadpage-horizontal-line" />
            {loading && <LoadingIndicator />}
        </>
    );
}