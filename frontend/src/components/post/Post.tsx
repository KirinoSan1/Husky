import { Button } from "react-bootstrap";
import { PostResource, AuthorResource } from "../../types/Resources";
import { useContext, useState } from "react";
import { LoginContext } from "../login/LoginContext";
import { EditPostDialog } from "./EditPostDialog";
import { DeletePostDialog } from "./DeletePostDialog";
import { UserContext } from "../settings/UserContext";
import { votePost } from "../../api/api";
import { ThreadPageContext } from "../thread/Thread";

export default function Post({ user, post, postNum, avatar }: { user: AuthorResource, post: PostResource, postNum: number, avatar: string }) {
    const [loginInfo] = useContext(LoginContext);
    const [userInfo, setUserInfo] = useContext(UserContext);
    const [threadPage] = useContext(ThreadPageContext);
    const [showEditDialog, setShowEditDialog] = useState(false);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [upvotes, setUpvotes] = useState(post.upvotes);
    const [downvotes, setDownvotes] = useState(post.downvotes);

    const gotModified = post.modified && post.modified === "m";
    const gotDeleted = post.modified && post.modified === "d";

    const to2DigitFormat = (n: number): string => {
        return ("0" + n).slice(-2);
    };

    const handleVote = async (vote: boolean, remove: boolean) => {
        console.log("handleVote");
        try {
            const res = await votePost(userInfo.id, post.id, threadPage.id, postNum, vote, remove);
            setUserInfo({ ...userInfo, votedPosts: res.votedPosts });
            setUpvotes(res.upvotes);
            setDownvotes(res.downvotes);
        } catch (error) {
            console.log(error);
        }
    };

    return (
        <>
            <div id={`post${postNum}-div1`}>
                <img id={`post${postNum}-div1-img`} src={avatar || "/images/logo.png"} alt={"Profile Pic"} width="100" height="100" />
                <p id={`post${postNum}-div1-p1`}>{user.name}</p>
                {user.mod && !user.admin && <p id={`post${postNum}-div1-p3`}>Moderator</p>}
                {user.admin && <p id={`post${postNum}-div1-p4`}>Admin</p>}
                <p id={`post${postNum}-div1-p2`}>{`Member since: ${user.createdAt.toLocaleDateString()}`}</p>
            </div>
            <div className="post-vertical-line" />
            <div id={`post${postNum}-div2`}>
                <div id={`post${postNum}-div2-div`}>
                    <p id={`post${postNum}-div2-div-p2`}>
                        {`Written on ${post.createdAt.toLocaleDateString()} at ${to2DigitFormat(post.createdAt.getHours())}:${to2DigitFormat(post.createdAt.getMinutes())}`}
                        {gotModified ? " - (modified)" : (gotDeleted && " - (deleted)")}
                    </p>
                    <p id={`post${postNum}-div2-div-p3`}>{`#${postNum + 1}`}</p>
                </div>
                <p id={`post${postNum}-div2-p4`}>{post.content}</p>
                <div className="post-horizontal-line" />
                {loginInfo && loginInfo.userID === post.author && (!post.modified || post.modified === "m") &&
                    <>
                        <Button id={`post${postNum}-div2-div-button1`} onClick={() => { setShowEditDialog(true); }}>Edit</Button>
                        {showEditDialog && <EditPostDialog contentPost={post.content} postNum={postNum} setShowEditDialog={setShowEditDialog} />}
                        <Button id={`post${postNum}-div2-div-button2`} onClick={() => { setShowDeleteDialog(true); }}>Delete</Button>
                        {showDeleteDialog && <DeletePostDialog postNum={postNum} setShowDeleteDialog={setShowDeleteDialog} />}
                    </>
                }
                {loginInfo && loginInfo.userID !== post.author &&
                    <>{
                        userInfo && userInfo.votedPosts && userInfo.votedPosts.get(post.id) !== undefined ?
                            <>{
                                userInfo.votedPosts.get(post.id) === true ?
                                    <>
                                        <div className="vote-button upvote">
                                            <Button id={`post${postNum}-div2-div-button3`} variant="secondary" onClick={() => { handleVote(true, true); }}>{thumbsUpIcon}</Button>
                                            <div className="votes">{upvotes}</div>
                                        </div>
                                        <div className="vote-button downvote">
                                        <Button id={`post${postNum}-div2-div-button4`} onClick={() => { handleVote(false, false); }}>{thumbsDownIcon}</Button>
                                            <div className="votes">{downvotes}</div>
                                        </div>
                                    </>
                                    :
                                    <>
                                        <div className="vote-button upvote">
                                            <Button id={`post${postNum}-div2-div-button5`} onClick={() => { handleVote(true, false); }}>{thumbsUpIcon}</Button>
                                            <div className="votes">{upvotes}</div>
                                        </div>
                                        <div className="vote-button downvote">
                                        <Button id={`post${postNum}-div2-div-button6`} variant="secondary" onClick={() => { handleVote(false, true); }}>{thumbsDownIcon}</Button>
                                            <div className="votes">{downvotes}</div>
                                        </div>
                                    </>
                            }
                            </>
                            :
                            <>
                                <div className="vote-button upvote">
                                    <Button id={`post${postNum}-div2-div-button7`} onClick={() => { handleVote(true, false); }}>{thumbsUpIcon}</Button>
                                    <div className="votes">{upvotes}</div>
                                </div>
                                <div className="vote-button downvote">
                                    <Button id={`post${postNum}-div2-div-button8`} onClick={() => { handleVote(false, false); }}>{thumbsDownIcon}</Button>
                                    <div className="votes">{downvotes}</div>
                                </div>
                            </>
                    }</>
                }
            </div>
        </>
    );
}

// taken from https://feathericons.com/ | Icon name: 'thumbs-up'
const thumbsUpIcon = (<svg
    xmlns="http://www.w3.org/2000/svg"
    width={24}
    height={24}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
>
    <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3" />
</svg >);

// taken from https://feathericons.com/ | Icon name: 'thumbs-down'
const thumbsDownIcon = (<svg
    xmlns="http://www.w3.org/2000/svg"
    width={24}
    height={24}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
>
    <path d="M10 15v4a3 3 0 0 0 3 3l4-9V2H5.72a2 2 0 0 0-2 1.7l-1.38 9a2 2 0 0 0 2 2.3zm7-13h2.67A2.31 2.31 0 0 1 22 4v7a2.31 2.31 0 0 1-2.33 2H17" />
</svg>);