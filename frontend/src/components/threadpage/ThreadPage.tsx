import { ThreadPageResource } from "../../types/Resources";
import Post from "../post/Post";
import { authors } from "../../data/testingData";

export default function ThreadPage({ pageNum, threadPage }: { pageNum: number, threadPage: ThreadPageResource }) {
    let postNum = 0;
    return (
        <div id={`threadpage${pageNum}-div`}>
            <p id={`threadpage${pageNum}-div-p`} className="threadpage-number">{`Seite: ${pageNum + 1}`}</p>
            {threadPage.posts.map((post) =>
                <div className="threadpage-post">
                    <Post 
                    user={authors.get(post.author)!} post={post} postNum={(pageNum * 10) + postNum} key={`threadpage${pageNum}-div-post${(pageNum * 10) + postNum++}`}></Post>
                </div>
            )}
        </div>
    );
}