import { useContext, useState } from "react";
import { LoginContext } from "../login/LoginContext";
import { Alert, Button, Modal } from "react-bootstrap";
import LoadingIndicator from "../util/LoadingIndicator";
import { editPost } from "../../api/api";
import { UserContext } from "../settings/UserContext";
import { ThreadPageContext } from "../thread/Thread";

export function DeletePostDialog({ postNum, setShowDeleteDialog }: { postNum: number, setShowDeleteDialog: Function }) {
    const [loginInfo] = useContext(LoginContext);
    const [userInfo] = useContext(UserContext);
    const [threadPage, setThreadPage] = useContext(ThreadPageContext);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleClose = () => { setShowDeleteDialog(false); };
    const handleSubmit = async () => {
        setLoading(true);
        try {
            setThreadPage(await editPost(userInfo.id, "This post has been deleted.", postNum % 10, threadPage.id, "d"));
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
                    <Modal.Title id="editpost-modal-header-title">Delete Post</Modal.Title>
                </Modal.Header>
                <Modal.Body id="editpost-modal-body">
                    <p id="editpost-modal-body-p">Do you wish to delete this post?</p>
                    <p id="editpost-modal-body-p">All contents will be lost.</p>
                    <p id="editpost-modal-body-p">Your post will be marked as deleted.</p>
                    <p id="editpost-modal-body-p">This cannot be reversed.</p>
                </Modal.Body>
                <Modal.Footer>
                    {error && <Alert id="editpost-modal-footer-alert" variant="danger">{error}</Alert>}
                    <Button variant="secondary" id="editpost-modal-footer-button1" onClick={handleClose}>Cancel</Button>
                    <Button id="editpost-modal-footer-button0" onClick={handleSubmit}>Delete</Button>
                    {loading && <LoadingIndicator />}
                </Modal.Footer>
            </Modal >
        </>
    );
}