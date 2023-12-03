import { Button } from "react-bootstrap";
import { PostResource, AuthorResource } from "../../types/Resources";
import { useContext } from "react";
import { LoginContext } from "../login/LoginContext";

export default function Post({ postNum, post, user }: { post: PostResource, user: AuthorResource, postNum: number }) {
    const [loginInfo] = useContext(LoginContext);

    return (
        <>
            <div id={`post${postNum}-div1`}>
                <img id={`post${postNum}-div1-img`} src="/images/logo.png" alt={"Profile Pic"} width="100" height="100"></img>
                <p id={`post${postNum}-div1-p1`}>{user.name}</p>
                <p id={`post${postNum}-div1-p2`}>{`Member since: ${user.createdAt.toLocaleDateString()}`}</p>
                {user.mod && !user.admin && <p id={`post${postNum}-div1-p3`}>Moderator</p>}
                {user.admin && <p id={`post${postNum}-div1-p4`}>Admin</p>}
            </div>
            <div className="post-vertical-line"></div>
            <div id={`post${postNum}-div2`}>
                <div id={`post${postNum}-div2-div`}>
                    <p id={`post${postNum}-div2-div-p1`}>{`Written on ${post.createdAt.toLocaleDateString()} at ${post.createdAt.getHours()}:${post.createdAt.getMinutes()}`}</p>
                    {loginInfo && loginInfo.userID === post.author &&
                        <>
                            <Button id={`post${postNum}-div2-div-button1`}>Edit</Button>
                            <Button id={`post${postNum}-div2-div-button2`}>Delete</Button>
                        </>
                    }
                    <p id={`post${postNum}-div2-div-p2`}>{`#${postNum + 1}`}</p>
                </div>
                <p id={`post${postNum}-div2-p3`}>{post.content}</p>
            </div>
        </>
    );
}