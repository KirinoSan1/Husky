import { useState } from "react";
import { Link } from "react-router-dom";
import { ThreadResource } from "../../types/Resources";
import { searchThreadsByTitle } from "../../api/api";
import LoadingIndicator from "../util/LoadingIndicator";
import { Alert, Button } from "react-bootstrap";

export default function ThreadSearch() {
    const [title, setTitle] = useState("");
    const [threads, setThreads] = useState<Array<ThreadResource> | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleUpdate = (e: React.ChangeEvent<HTMLInputElement>) => { setTitle(e.target.value); };
    const handleSearch = async () => {
        setLoading(true);
        setThreads(null);
        setError("");
        try {
            if (title.length < 3)
                throw new Error("query must contain at least 3 characters");
            setThreads(await searchThreadsByTitle(title));
        } catch (error) {
            setError(String(error));
        }
        setLoading(false);
    };

    let count = 0;
    return (
        <div id="threadsearch-div">
            <p id="threadsearch-div-p0">Search for threads by title</p>
            <input id="threadsearch-div-input" type="search" placeholder="Title..." onChange={handleUpdate} value={title}></input>
            <Button id="threadsearch-div-button" onClick={handleSearch}>Search</Button>
            {loading && <LoadingIndicator />}
            {error && <Alert id="threadsearch-div-alert">{`${error}`}</Alert>}
            {threads && threads.length === 0 && <p id="threadsearch-div-p1">Nothing found</p>}
            {threads && threads.length > 0 && threads.map((thread) => (
                <div id={`threadsearch-div-div${count}`} key={`threadsearch-div-div${count}`}>
                    <Link id={`threadsearch-div-div${count}-link`} key={`threadsearch-div-div${count}-link`} to={`/threads/${thread.id}`}>{thread.title}</Link>
                    <p id={`threadsearch-div-div${count}-p0`} key={`threadsearch-div-div${count}-p0`}>{`Posts: ${thread.numPosts}`}</p>
                    <p id={`threadsearch-div-div${count}-p1`} key={`threadsearch-div-div${count}-p1`}>{`Subforum: ${thread.subForum}`}</p>
                    <p id={`threadsearch-div-div${count}-p2`} key={`threadsearch-div-div${count}-p2`}>{`Created At: ${thread.createdAt.toLocaleDateString()}`}</p>
                </div>
            ))}
        </div>
    );
}