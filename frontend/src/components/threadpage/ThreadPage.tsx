import { ThreadPageResource } from "../../types/Resources";
import Post from "../post/Post";
import { authors } from "../../data/testingData";

export default function ThreadPage({ pageNum, threadPage }: { pageNum: number, threadPage: ThreadPageResource }) {
    let postNum = 0;
    return (
        <div id={`threadpage${pageNum}-div`} style={{ backgroundColor: "white", width: "90%" }}>
            <p id={`threadpage${pageNum}-div-p`}>{`Seite: ${pageNum + 1}`}</p>
            {threadPage.posts.map((post) =>
                <>
                    <hr id={`threadpage${pageNum}-div-hr${(pageNum * 10) + postNum}`}></hr>
                    <Post user={authors.get(post.author)!} post={post} postNum={(pageNum * 10) + postNum} key={`threadpage${pageNum}-div-post${(pageNum * 10) + postNum++}`}></Post>
                </>
            )}
        </div>
    );
}