import { Button } from "react-bootstrap";
import { PostResource, AuthorResource } from "../../types/Resources";
import { useContext, useState } from "react";
import { LoginContext } from "../login/LoginContext";
import { EditPostDialog } from "./EditPostDialog";
import { DeletePostDialog } from "./DeletePostDialog";

export default function Post({ user, post, postNum, avatar }: { user: AuthorResource, post: PostResource, postNum: number, avatar: string }) {
    const [loginInfo] = useContext(LoginContext);
    const [showEditDialog, setShowEditDialog] = useState(false);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);

    const gotModified = post.modified && post.modified === "m";
    const gotDeleted = post.modified && post.modified === "d";

    const to2DigitFormat = (n: number): string => {
        return ("0" + n).slice(-2);
    };

    return (
        <>
            <div id={`post${postNum}-div1`}>
                <img id={`post${postNum}-div1-img`} src={avatar || "/images/logo.png"} alt={"Profile Pic"} width="100" height="100"></img>
                <p id={`post${postNum}-div1-p1`}>{user.name}</p>
                {user.mod && !user.admin && <p id={`post${postNum}-div1-p3`}>Moderator</p>}
                {user.admin && <p id={`post${postNum}-div1-p4`}>Admin</p>}
                <p id={`post${postNum}-div1-p2`}>{`Member since: ${user.createdAt.toLocaleDateString()}`}</p>
            </div>
            <div className="post-vertical-line"></div>
            <div id={`post${postNum}-div2`}>
                <div id={`post${postNum}-div2-div`}>
                    <p id={`post${postNum}-div2-div-p2`}>
                        {`Written on ${post.createdAt.toLocaleDateString()} at ${to2DigitFormat(post.createdAt.getHours())}:${to2DigitFormat(post.createdAt.getMinutes())}`}
                        {gotModified ? " - (modified)" : (gotDeleted && " - (deleted)")}
                    </p>
                    <p id={`post${postNum}-div2-div-p3`}>{`#${postNum + 1}`}</p>
                </div>
                <p id={`post${postNum}-div2-p3`}>{post.content}</p>
                {loginInfo && loginInfo.userID === post.author && (!post.modified || post.modified === "m") &&
                    <>
                        <Button id={`post${postNum}-div2-div-button1`} onClick={() => { setShowEditDialog(true); }}>Edit</Button>
                        {showEditDialog && <EditPostDialog contentPost={post.content} postNum={postNum} setShowEditDialog={setShowEditDialog}></EditPostDialog>}
                        <Button id={`post${postNum}-div2-div-button2`} onClick={() => { setShowDeleteDialog(true); }}>Delete</Button>
                        {showDeleteDialog && <DeletePostDialog postNum={postNum} setShowDeleteDialog={setShowDeleteDialog}></DeletePostDialog>}
                    </>
                }
            </div>
        </>
    );
}