import { useContext } from "react";
import { AuthorResource, PostResource } from "../../types/Resources";
import Post from "../post/Post";
import { PageNumContext, ThreadPageContext } from "../thread/Thread";
import CreatePostDialog from "../post/CreatePostDialog";

export default function ThreadPage({ authors, pageCount }: { authors: Map<string, AuthorResource>, pageCount: number }) {
    const [threadPage] = useContext(ThreadPageContext);
    const [pageNum] = useContext(PageNumContext);
    
    let postNum = 0;
    return (
        <div id={`threadpage${pageNum}-div`}>
            {threadPage.posts.map((post: PostResource) =>
                <div className="threadpage-post" key={`threadpage${pageNum}-div-post${(pageNum * 10) + postNum++}`}>
                    <Post
                        user={authors.get(post.author)!}
                        post={post}
                        postNum={(pageNum * 10) + postNum}
                        avatar={authors.get(post.author)?.avatar!}
                    />
                </div>
            )}
            {pageNum === pageCount - 1 && <CreatePostDialog />}
        </div>
    );
}