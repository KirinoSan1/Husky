import React, { useContext, useEffect, useState } from "react";
import ThreadPage from "../threadpage/ThreadPage";
import { Alert, Button } from "react-bootstrap";
import LoadingIndicator from "../util/LoadingIndicator";
import { getAuthors, getThread, getThreadPage } from "../../api/api";
import { AuthorResource, ThreadPageResource, ThreadResource } from "../../types/Resources";
import { Location, NavigateFunction, useLocation, useNavigate, useParams } from "react-router-dom";
import Icon from "../util/Icon";
import { useSockets } from "../../Socket/context/socket.context";
import EVENTS from "../livechat/events";
import { UserContext } from "../settings/UserContext";

export const ThreadContext = React.createContext([] as any);
export const ThreadPageContext = React.createContext([] as any);
export const PageNumContext = React.createContext([] as any);

export default function Thread() {
    const threadID = useParams().id ?? "";
    const [pageNum, setPageNum] = useState(Number(useParams().page) - 1 ?? 1);
    const [thread, setThread] = useState<ThreadResource | null>(null);
    const [threadPage, setThreadPage] = useState<ThreadPageResource | null>(null);
    const [authors, setAuthors] = useState<Map<string, AuthorResource> | null>(null);
    const [error, setError] = useState("");
    const [showAlert, setShowAlert] = useState(false);
    const navigate: NavigateFunction = useNavigate();
    const route: Location = useLocation();
    const [searchInput, setSearchInput] = useState('');
    const [suggestions, setSuggestions] = useState<string[]>([]);
    const { rooms, socket, currentUseronline } = useSockets();
    const [userInfo] = useContext(UserContext);

    const setCurrentPageNum = (page: number) => {
        const currentPath: string = route.pathname;
        navigate(currentPath.substring(0, currentPath.length - 1) + (page + 1));
        setPageNum(page);
    }

    useEffect(() => {
        if (thread) {
            setSearchInput(thread.title);
            const threadtitle = thread.title.trim().split(" ").filter((key) => { return key.length > 3; });

            const filteredSuggestions = Object.keys(rooms).filter((key) => {
                const room = rooms[key];
                if (room && room.name) {
                    return threadtitle.some((title) => room.name.toLowerCase().includes(title.toLowerCase()));
                }
                return false;
            })

            setSuggestions(filteredSuggestions.slice(0, 3));
        } else {
            return;
        }
    }, [searchInput, rooms, thread, searchInput, route, error]);

    useEffect(() => {
        async function loadThread() {
            setThreadPage(null);
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

    const handlePrevious = () => { setCurrentPageNum(pageNum - 1); };
    const handleNext = () => { setCurrentPageNum(pageNum + 1); };


    const handleJoinRoom = (key: string) => {
        setShowAlert(true)
        if (currentUseronline[key].onlineUser >= rooms[key].userlimit) {
            setError("This room is already full.")
            return;
        }

        navigate(`/chats`);
        socket.emit(EVENTS.CLIENT.JOIN_ROOM, key, userInfo.id);
    };


    const handleClose = () => {
        setError("")
    }

    if (!thread || !threadPage || !authors)
        return <LoadingIndicator />;

    return (
        <ThreadContext.Provider value={[thread, setThread]}>
            <ThreadPageContext.Provider value={[threadPage, setThreadPage]}>
                <PageNumContext.Provider value={[pageNum, setPageNum]}>
                    {error && (
                        <Alert variant="danger" key="danger" onClose={handleClose} dismissible>
                            <p>{error}</p>
                        </Alert>
                    )}
                    {suggestions && suggestions.length > 0 && (
                        <Alert key="primary" variant="primary">
                            <>
                                <div style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
                                    You might be interested in these LiveChats:
                                    <br></br>
                                </div>
                                {suggestions.map((key) => (
                                    <div style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
                                        <React.Fragment key={key}>
                                            <Button style={{ marginLeft: '10px' }} onClick={() => handleJoinRoom(key)}>{rooms[key].name}</Button>
                                        </React.Fragment>
                                    </div>
                                ))}
                            </>
                        </Alert>
                    )}
                    <div id="thread-div">
                        <div>
                            <h3 id={`thread-div-p1`}>{`${thread.title}`}</h3>
                            <div className="h3-underline" />
                        </div>
                        <div className="button-bar">
                            <Button id="thread-div-button1" className={"previous" + (pageNum < 1 ? " hidden" : "")} onClick={handlePrevious}>
                                <Icon width={20} height={20} data="M11.354 1.646a.5.5 0 0 1 0 .708L5.707 8l5.647 5.646a.5.5 0 0 1-.708.708l-6-6a.5.5 0 0 1 0-.708l6-6a.5.5 0 0 1 .708 0z" />
                            </Button>
                            <p id={`threadpage${pageNum}-div-p`} className="threadpage-number">{`Page: ${pageNum + 1}`}</p>
                            <Button id="thread-div-button2" className={"next" + (pageNum > thread.pages.length - 2 ? " hidden" : "")} onClick={handleNext}>
                                <Icon width={20} height={20} data="M4.646 1.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1 0 .708l-6 6a.5.5 0 0 1-.708-.708L10.293 8 4.646 2.354a.5.5 0 0 1 0-.708z" />
                            </Button>
                        </div>
                        <ThreadPage authors={authors} pageCount={thread.pages.length} />
                        <div className="button-bar">
                            <Button id="thread-div-button3" className={"previous" + (pageNum < 1 ? " hidden" : "")} onClick={handlePrevious}>
                                <Icon width={20} height={20} data="M11.354 1.646a.5.5 0 0 1 0 .708L5.707 8l5.647 5.646a.5.5 0 0 1-.708.708l-6-6a.5.5 0 0 1 0-.708l6-6a.5.5 0 0 1 .708 0z" />
                            </Button>
                            <p id={`threadpage${pageNum}-div-p`} className="threadpage-number">{`Page: ${pageNum + 1}`}</p>
                            <Button id="thread-div-button4" className={"next" + (pageNum > thread.pages.length - 2 ? " hidden" : "")} onClick={handleNext}>
                                <Icon width={20} height={20} data="M4.646 1.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1 0 .708l-6 6a.5.5 0 0 1-.708-.708L10.293 8 4.646 2.354a.5.5 0 0 1 0-.708z" />
                            </Button>
                        </div>
                    </div>
                </PageNumContext.Provider>
            </ThreadPageContext.Provider>
        </ThreadContext.Provider>
    );
};
