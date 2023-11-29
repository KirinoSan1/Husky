import { Button } from "react-bootstrap";
import { PostResource, AuthorResource } from "../../types/Resources";
import { useContext } from "react";
import { LoginContext } from "../login/LoginContext";

export default function Post({ postNum, post, user }: { post: PostResource, user: AuthorResource, postNum: number }) {
    const [loginInfo] = useContext(LoginContext);

    return (
        <>
            <div id={`post${postNum}-div1`} style={{ backgroundColor: "white" }}>
                <img id={`post${postNum}-div1-img`} src="images/logo.png" alt={"Profile Pic"} width="100" height="100"></img>
                <p id={`post${postNum}-div1-p1`}>{user.name}</p>
                <p id={`post${postNum}-div1-p2`}>{`Mitglied seit: ${user.createdAt.toLocaleDateString()}`}</p>
                {user.mod && !user.admin && <p id={`post${postNum}-div1-p3`}>Moderator</p>}
                {user.admin && <p id={`post${postNum}-div1-p4`}>Admin</p>}
            </div>
            <div id={`post${postNum}-div2`} style={{ backgroundColor: "white" }}>
                <div id={`post${postNum}-div2-div`}>
                    <p id={`post${postNum}-div2-div-p1`}>{`Geschrieben am ${post.createdAt.toLocaleDateString()} um ${post.createdAt.getHours()}:${post.createdAt.getMinutes()} Uhr`}</p>
                    {loginInfo && loginInfo.userID === post.author &&
                        <>
                            <Button id={`post${postNum}-div2-div-button1`}>Edit</Button>
                            <Button id={`post${postNum}-div2-div-button2`}>Delete</Button>
                        </>
                    }
                    <p id={`post${postNum}-div2-div-p2`}>{`#${postNum}`}</p>
                </div>
                <hr id={`post${postNum}-div2-hr`}></hr>
                <p id={`post${postNum}-div2-p`}>{post.content}</p>
            </div>
        </>
    );
}