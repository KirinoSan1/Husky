import { useContext } from "react";
import { AuthorResource, PostResource } from "../../types/Resources";
import Post from "../post/Post";
import { PageNumContext, ThreadPageContext } from "../thread/Thread";

export default function ThreadPage({ authors }: { authors: Map<string, AuthorResource> }) {
    const [threadPage] = useContext(ThreadPageContext);
    const [pageNum] = useContext(PageNumContext);
    
    let postNum = 0;
    return (
        <div id={`threadpage${pageNum}-div`}>
            <p id={`threadpage${pageNum}-div-p`} className="threadpage-number">{`Seite: ${pageNum + 1}`}</p>
            {threadPage.posts.map((post: PostResource) =>
                <div className="threadpage-post" key={`threadpage${pageNum}-div-post${(pageNum * 10) + postNum++}`}>
                    <Post
                        user={authors.get(post.author)!}
                        post={post}
                        postNum={(pageNum * 10) + postNum}
                    />
                </div>
            )}
            {postNum > 0 && <div id={`threadpage${pageNum}-div-hr`} className="threadpage-horizontal-line"></div>}
        </div>
    );
}