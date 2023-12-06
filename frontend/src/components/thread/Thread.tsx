import { useEffect, useState } from "react";
import ThreadPage from "../threadpage/ThreadPage";
import { Alert, Button } from "react-bootstrap";
import LoadingIndicator from "../util/LoadingIndicator";
import { getAuthors, getThread, getThreadPage } from "../../api/api";
import { AuthorResource, ThreadPageResource, ThreadResource } from "../../types/Resources";
import { useParams } from "react-router-dom";
import CreatePostDialog from "../post/CreatePostDialog";

export default function Thread() {
    const threadID = useParams().id ?? "";
    const [pageNum, setPageNum] = useState(0);
    const [thread, setThread] = useState<ThreadResource | null>(null);
    const [threadPage, setThreadPage] = useState<ThreadPageResource | null>(null);
    const [authors, setAuthors] = useState<Map<string, AuthorResource> | null>(null);
    const [error, setError] = useState("");

    useEffect(() => {
        async function loadThread() {
            try {
                setThread(await getThread(threadID));
            } catch (error) {
                setError(String(error));
            }
        }
        loadThread();
    }, []);
    useEffect(() => {
        async function loadThreadPage() {
            setThreadPage(null);
            if (!thread)
                return;
            try {
                setThreadPage(await getThreadPage(thread.pages[pageNum]));
            } catch (error) {
                setError(String(error));
            }
        }
        loadThreadPage();
    }, [pageNum, thread]);
    useEffect(() => {
        async function loadAuthors() {
            setAuthors(null);
            if (!thread || !threadPage || !threadPage.id)
                return;
            try {
                const arr = (await getAuthors(threadPage.id)).authors;
                const map = new Map<string, AuthorResource>();
                arr.forEach((author) => { map.set(author.id, author); });
                setAuthors(map);
            } catch (error) {
                setError(String(error));
            }
        }
        loadAuthors();
    }, [threadPage]);

    const handlePrevious = () => { setPageNum(pageNum - 1); };
    const handleNext = () => { setPageNum(pageNum + 1); };

    if (error)
        return <Alert id="thread-alert" variant="danger">{`An error occured when loading the page: ${error}`}</Alert>;

    if (!thread || !threadPage || !authors)
        return <LoadingIndicator />;

    return (
        <div id="thread-div">
            <p id={`thread-div-p1`}>{`Thema: ${thread.title}`}</p>
            <p id={`thread-div-p2`}>{`Seite: ${pageNum + 1}`}</p>
            {pageNum > 0 && <Button id="thread-div-button1" onClick={handlePrevious}>Previous</Button>}
            {pageNum < thread.pages.length - 1 && <Button id="thread-div-button2" onClick={handleNext}>Next</Button>}
            <ThreadPage pageNum={pageNum} threadPage={threadPage} authors={authors}></ThreadPage>
            {pageNum === thread.pages.length - 1 && <CreatePostDialog threadID={thread.id} threadPage={threadPage} setThread={setThread} setPageNum={setPageNum}></CreatePostDialog>}
            {pageNum > 0 && <Button id="thread-div-button3" onClick={handlePrevious}>Previous</Button>}
            {pageNum < thread.pages.length - 1 && <Button id="thread-div-button4" onClick={handleNext}>Next</Button>}
        </div>
    );
};