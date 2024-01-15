import { useContext, useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { ThreadResource } from "../../types/Resources";
import { searchThreadsByTitle } from "../../api/api";
import LoadingIndicator from "../util/LoadingIndicator";
import { Alert, Button } from "react-bootstrap";
import { LoginContext } from "../login/LoginContext";
import { MAX_LENGTH_THREAD_SEARCH_QUERY, MIN_LENGTH_THREAD_SEARCH_QUERY } from "../../types/Constants";

export default function ThreadSearch() {
    const [loginInfo] = useContext(LoginContext);
    const [title, setTitle] = useState("");
    const [threads, setThreads] = useState<Array<ThreadResource> | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const navigate = useNavigate();
    const location = useLocation();

    const handleUpdate = (e: React.ChangeEvent<HTMLInputElement>) => { setTitle(e.target.value); };
    const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            handleSearch();
        }
    };
    const handleSearch = async () => {
        setLoading(true);
        setThreads(null);
        setError("");
        try {
            if (title.length < MIN_LENGTH_THREAD_SEARCH_QUERY) {
                throw String(`Your query must contain at least ${MIN_LENGTH_THREAD_SEARCH_QUERY} characters.`);
            } else if (title.length > MAX_LENGTH_THREAD_SEARCH_QUERY) {
                throw String(`Your query must contain no more than ${MAX_LENGTH_THREAD_SEARCH_QUERY} characters.`);
            }
            setThreads(await searchThreadsByTitle(title));
        } catch (error) {
            setError(String(error));
        }
        setLoading(false);
    };


    useEffect(() => {
        async function search() {
            if (location.state) {
                setTitle(location.state);
                setThreads(await searchThreadsByTitle(location.state));
            }
        }
        search();
    }, []);

    let count = 0;
    return (
        <div id="threadsearch-div">
            {loginInfo && <>
                <Button id="threadsearch-div-button1" onClick={() => { navigate("/threads/create"); }}>Create New Thread</Button>
                <div className="threadsearch-horizontal-line" />
            </>}
            <p id="threadsearch-div-p0">Search for threads by title:</p>
            <input id="threadsearch-div-input" className="form-control" type="search" placeholder="Title..." onChange={handleUpdate} value={title} onKeyDown={handleKeyPress} />
            <Button id="threadsearch-div-button2" onClick={handleSearch}>Search</Button>
            {loading && <LoadingIndicator />}
            {(error || threads) && <div className="threadsearch-horizontal-line" />}
            {error && <Alert id="threadsearch-div-alert" variant="danger">{`${error}`}</Alert>}
            {threads && threads.length === 0 && <p id="threadsearch-div-p1">Nothing found</p>}
            {threads && threads.length > 0 && threads.map((thread) => (
                <div id={`threadsearch-div-div${count}`} className="threadsearch-single-result" key={`threadsearch-div-div${count}`}>
                    <Link id={`threadsearch-div-div${count}-link`} key={`threadsearch-div-div${count}-link`} to={`/threads/${thread.id}`}>{thread.title}</Link>
                    <p id={`threadsearch-div-div${count}-p0`} key={`threadsearch-div-div${count}-p0`}>{`Posts: ${thread.numPosts}`}</p>
                    <p id={`threadsearch-div-div${count}-p1`} key={`threadsearch-div-div${count}-p1`}>{`Subforum: ${thread.subForum}`}</p>
                    <p id={`threadsearch-div-div${count}-p2`} key={`threadsearch-div-div${count++}-p2`}>{`Created At: ${thread.createdAt.toLocaleDateString()}`}</p>
                </div>
            ))}
        </div>
    );
}