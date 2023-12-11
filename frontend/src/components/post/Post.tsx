import { Button } from "react-bootstrap";
import { PostResource, AuthorResource } from "../../types/Resources";
import { useContext, useState } from "react";
import { LoginContext } from "../login/LoginContext";
import { EditPostDialog } from "./EditPostDialog";

export default function Post({ user, post, postNum }: { user: AuthorResource, post: PostResource, postNum: number }) {
    const [loginInfo] = useContext(LoginContext);
    const [showEditDialog, setShowEditDialog] = useState(false);

    return (
        <>
            <div id={`post${postNum}-div1`}>
                <img id={`post${postNum}-div1-img`} src="/images/logo.png" alt={"Profile Pic"} width="100" height="100"></img>
                <p id={`post${postNum}-div1-p1`}>{user.name}</p>
                {user.mod && !user.admin && <p id={`post${postNum}-div1-p3`}>Moderator</p>}
                {user.admin && <p id={`post${postNum}-div1-p4`}>Admin</p>}
                <p id={`post${postNum}-div1-p2`}>{`Member since: ${user.createdAt.toLocaleDateString()}`}</p>
            </div>
            <div className="post-vertical-line"></div>
            <div id={`post${postNum}-div2`}>
                <div id={`post${postNum}-div2-div`}>
                    <p id={`post${postNum}-div2-div-p2`}>{`Written on ${post.createdAt.toLocaleDateString()} at ${post.createdAt.getHours()}:${post.createdAt.getMinutes()}`}</p>
                    {post.modified && post.modified === "m" && <p id={`post${postNum}-div2-div-p0`}>(modified)</p>}
                    {post.modified && post.modified === "d" && <p id={`post${postNum}-div2-div-p1`}>(deleted)</p>}
                    <p id={`post${postNum}-div2-div-p3`}>{`#${postNum + 1}`}</p>
                </div>
                <p id={`post${postNum}-div2-p3`}>{post.content}</p>
                {loginInfo && loginInfo.userID === post.author && (!post.modified || post.modified === "m") &&
                    <>
                        <Button id={`post${postNum}-div2-div-button1`} onClick={() => { setShowEditDialog(true); }}>Edit</Button>
                        {showEditDialog && <EditPostDialog contentPost={post.content} postNum={postNum} setShowEditDialog={setShowEditDialog}></EditPostDialog>}
                        <Button id={`post${postNum}-div2-div-button2`}>Delete</Button>
                    </>
                }
            </div>
        </>
    );
}