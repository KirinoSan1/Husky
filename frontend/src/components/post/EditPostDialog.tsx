import { useContext, useState } from "react";
import { LoginContext } from "../login/LoginContext";
import { Alert, Button, Modal } from "react-bootstrap";
import LoadingIndicator from "../util/LoadingIndicator";
import { editPost } from "../../api/api";
import { UserContext } from "../settings/UserContext";
import { ThreadPageContext } from "../thread/Thread";

export function EditPostDialog({ contentPost, postNum, setShowEditDialog }: { contentPost: string, postNum: number, setShowEditDialog: Function }) {
    const [loginInfo] = useContext(LoginContext);
    const [userInfo] = useContext(UserContext);
    const [threadPage, setThreadPage] = useContext(ThreadPageContext);
    const [content, setContent] = useState(contentPost);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleUpdateContent = (e: any) => { setContent(e.target.value); };
    const handleClose = () => { setShowEditDialog(false); };
    const handleSubmit = async () => {
        setLoading(true);
        try {
            setThreadPage(await editPost(userInfo.id, content, postNum % 10, threadPage.id));
        } catch (error) {
            setError(String(error));
        }
        setLoading(false);
    };

    if (!loginInfo)
        return <></>;

    return (
        <>
            <Modal id="editpost-modal" show={true} onHide={handleClose}>
                <Modal.Header id="editpost-modal-header" data-bs-theme="dark" closeButton>
                    <Modal.Title id="editpost-modal-header-title">Edit Post</Modal.Title>
                </Modal.Header>
                <Modal.Body id="editpost-modal-body">
                    <p id="editpost-modal-body-p">If you modify your post, it will be permanently marked as edited!</p>
                    <textarea id="editpost-modal-body-textarea" placeholder="Empty post" onChange={handleUpdateContent} value={content} className="textarea"></textarea>
                </Modal.Body>
                <Modal.Footer>
                    {error && <Alert id="editpost-modal-footer-alert" variant="danger">{error}</Alert>}
                    <Button variant="secondary" id="editpost-modal-footer-button1" onClick={handleClose}>Cancel</Button>
                    <Button id="editpost-modal-footer-button0" disabled={content.length === 0} onClick={handleSubmit}>Submit</Button>
                    {loading && <LoadingIndicator />}
                </Modal.Footer>
            </Modal >
        </>
    );
}