import { AuthorResource, ThreadPageResource } from "../../types/Resources";
import Post from "../post/Post";

export default function ThreadPage({ pageNum, threadPage, authors }: { pageNum: number, threadPage: ThreadPageResource, authors: Map<string, AuthorResource> }) {
    let postNum = 0;
    return (
        <div id={`threadpage${pageNum}-div`}>
            <p id={`threadpage${pageNum}-div-p`} className="threadpage-number">{`Seite: ${pageNum + 1}`}</p>
            {threadPage.posts.map((post) =>
                <div className="threadpage-post" key={`threadpage${pageNum}-div-post${(pageNum * 10) + postNum++}`}>
                    <Post
                        user={authors.get(post.author)!}
                        post={post}
                        postNum={(pageNum * 10) + postNum}
                    />
                </div>
            )}
            {postNum > 0 && <hr id={`threadpage${pageNum}-div-hr`}></hr>}
        </div>
    );
}