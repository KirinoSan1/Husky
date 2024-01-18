import { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import Icon from "../util/Icon";
import { getUsersThreads, getSubforumsThreads, getLatestThreads, getUsersAvatar } from "../../api/api";
import { ThreadResource } from "../../types/Resources";
import React from "react";
import { LoginContext } from '../../components/login/LoginContext';
import LoadingIndicator from "../util/LoadingIndicator";
import { UserContext } from "../settings/UserContext";
import { useSockets } from "../../Socket/context/socket.context";
import EVENTS from "../livechat/events";
import { Alert, Button } from "react-bootstrap";
import { formatOnlineUsersCount, formatTimeToClose } from "../util/Formatter";

export default function FrontPage() {
    const [loginInfo] = useContext(LoginContext);
    const [userInfo] = useContext(UserContext);
    const [searchInput, setSearchInput] = useState("");
    const [threads, setThreads] = useState<Map<string, ThreadResource[]> | null>(null);

    const navigate = useNavigate();
    const { rooms, currentUseronline, socket } = useSockets()
    const [liveChats, setLiveChat] = useState<any[]>([]);
    const [error, setError] = useState("")

    const handleUpdate = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSearchInput(event.currentTarget.value);
    };

    const handleSearch = async () => {
        if (searchInput.length < 2) {
            return new Error("Please enter at least 2 characters.");
        }

        navigate("/threads", { replace: true, state: searchInput });
    };

    const handleSearchEnter = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key === "Enter") {
            event.preventDefault();
            handleSearch();
        }
    };

    useEffect(() => {
        const fetchChats = async () => {
            const chatPromises = Object.keys(rooms).map(async (key) => {
                const room = rooms[key];
                const onlineUser = currentUseronline[key]?.onlineUser || 0;
                const ava = await getUsersAvatar(room.creatorId);
                return { ...room, onlineUser, ava, key };
            });

            const combinedChats = await Promise.all(chatPromises);
            setLiveChat(combinedChats.slice(0, 5));
        };

        fetchChats();
    }, [rooms, currentUseronline]);


    useEffect(() => {
        const loadThreadRecommendations = async (): Promise<Map<string, ThreadResource[]>> => {
            const subforumSlots: number = 3;
            const threadSlotsPerSubforum: number = 2;
            const threadSlots: number = subforumSlots * threadSlotsPerSubforum;

            const threadMap: Map<string, ThreadResource[]> = new Map();

            if (loginInfo && userInfo) {
                const ownThreads: ThreadResource[] = await getUsersThreads(loginInfo.userID, threadSlots);

                // add some threads of the currently logged in user
                ownThreads.forEach((thread: ThreadResource) => {
                    thread.creatorName = userInfo.name;
                    thread.creatorAvatar = userInfo.avatar;

                    const subforum: string = thread.subForum;
                    const entries: ThreadResource[] | undefined = threadMap.get(subforum);

                    if (!entries && threadMap.size >= subforumSlots) {
                        return;
                    }

                    if (entries && entries.length >= threadSlotsPerSubforum) {
                        return;
                    }

                    threadMap.set(subforum, entries ? [...entries, thread] : [thread]);
                });

                // fill empty slots of the already existing topics
                threadMap.forEach(async (threads: ThreadResource[], subforum: string) => {
                    let emptySlots: number = threadSlotsPerSubforum - threads.length;

                    if (emptySlots < 1) {
                        return;
                    }

                    // taking the maximum amount of threads as second argument due to possible duplications
                    const subforumsThreads: ThreadResource[] = await getSubforumsThreads(subforum, threadSlotsPerSubforum);

                    subforumsThreads.filter((thread: ThreadResource) => thread.creator !== loginInfo.userID).forEach((thread: ThreadResource) => {
                        if (--emptySlots > -1) {
                            threads.push(thread);
                        }
                    });
                });
            }

            const emptySubforumSlots: number = subforumSlots - threadMap.size;

            if (emptySubforumSlots < 1) {
                return threadMap;
            }

            const latestThreads: ThreadResource[] = await getLatestThreads(subforumSlots, threadSlotsPerSubforum);

            latestThreads.filter((thread: ThreadResource) => !threadMap.has(thread.subForum)).forEach((thread: ThreadResource) => {
                const entries: ThreadResource[] | undefined = threadMap.get(thread.subForum);
                threadMap.set(thread.subForum, entries ? [thread, ...entries] : [thread]);
            });

            return threadMap;
        };

        const getThreadRecommendations = async () => {
            const threads: Map<string, ThreadResource[]> = await loadThreadRecommendations();
            setThreads(threads);
        };

        getThreadRecommendations();
    }, [loginInfo, userInfo]);

    const handleClickThread = (event: React.MouseEvent) => {
        navigate("/threads/" + event.currentTarget.id);
    };

    const handleClickChat = (key: string) => {

        if (!loginInfo) {
            setError("You have to be logged in to join a LiveChat.")
            return;
        }

        if (currentUseronline[key].onlineUser >= rooms[key].userlimit) {
            setError("This room is already full.")
            return;
        }
        navigate(`/chats/`);
        socket.emit(EVENTS.CLIENT.JOIN_ROOM, key);
    };

    const handleClose = () => {
        setError("")
    }

    return (
        <>
            <img id="banner-logo" src="/images/logo.png" alt="Big Husky logo" loading="lazy" />
            <label>
                <input
                    type="search"
                    placeholder="Type here to search ..."
                    onChange={handleUpdate}
                    onKeyDown={handleSearchEnter}
                />
                <span onClick={handleSearch}>
                    <Icon data="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007 1.007 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0" />
                </span>
            </label>
            {!threads && <LoadingIndicator />}
            <div id="thread-recommendation-container">
                {threads && Array.from(threads.entries()).map(entry => {
                    const subforumName: string = entry[0];
                    let keyCounter: number = 0;

                    return (
                        <><section key={subforumName}>
                            <h4>{subforumName}</h4>
                            <ul>
                                {entry[1].map((thread: ThreadResource) => {
                                    const creatorName: string = thread.creatorName;
                                    const creatorAvatar: string | undefined = thread.creatorAvatar;

                                    return (
                                        <li key={++keyCounter} id={thread.id} className={userInfo && userInfo.name === creatorName ? "own-thread" : undefined} onClick={handleClickThread}>
                                            <Icon data="M8.39 12.648a1.32 1.32 0 0 0-.015.18c0 .305.21.508.5.508.266 0 .492-.172.555-.477l.554-2.703h1.204c.421 0 .617-.234.617-.547 0-.312-.188-.53-.617-.53h-.985l.516-2.524h1.265c.43 0 .618-.227.618-.547 0-.313-.188-.524-.618-.524h-1.046l.476-2.304a1.06 1.06 0 0 0 .016-.164.51.51 0 0 0-.516-.516.54.54 0 0 0-.539.43l-.523 2.554H7.617l.477-2.304c.008-.04.015-.118.015-.164a.512.512 0 0 0-.523-.516.539.539 0 0 0-.531.43L6.53 5.484H5.414c-.43 0-.617.22-.617.532 0 .312.187.539.617.539h.906l-.515 2.523H4.609c-.421 0-.609.219-.609.531 0 .313.188.547.61.547h.976l-.516 2.492c-.008.04-.015.125-.015.18 0 .305.21.508.5.508.265 0 .492-.172.554-.477l.555-2.703h2.242l-.515 2.492zm-1-6.109h2.266l-.515 2.563H6.859l.532-2.563z" />
                                            <p className="topic-entry-preview-title">{thread.title}</p>
                                            <p>{thread.numPosts + (thread.numPosts === 1 ? " post" : " posts")}</p>
                                            <div>
                                                <img
                                                    src={creatorAvatar ? creatorAvatar : "/images/logo.png"}
                                                    alt={"Profile avatar of " + creatorName}
                                                    loading="lazy"
                                                />
                                                <p>{creatorName}</p>
                                            </div>
                                        </li>
                                    );
                                })}
                            </ul>
                        </section>
                        </>
                    );
                })}
                {liveChats.length >= 1 && <section>
                    <h4>LiveChats</h4>
                    {error && (
                        <Alert variant="danger" key="danger" onClose={handleClose} dismissible>
                            <p>{error}</p>
                        </Alert>
                    )}
                    <ul>
                        {liveChats.map((room, index) => (
                            <li key={index} className={userInfo && userInfo.id === room.creatorId ? "own-thread" : undefined} onClick={() => handleClickChat(room.key)}>
                                   <img
                                        src= "/images/live_logo.svg"
                                        alt={"Profile avatar of " + room.creatorname}
                                        loading="lazy"
                                    />
                                <p className="topic-entry-preview-title">{room.name}</p>

                                <p>{room.onlineUser}/{room.userlimit} online </p>
                                <div>
                                    <img
                                        src={room.ava ? room.ava : "/images/logo.png"}
                                        alt={"Profile avatar of " + room.creatorname}
                                        loading="lazy"
                                    />
                                    <p>{room.creatorname}</p>
                                  
                                </div>
                            </li>
                        ))}
                    </ul>
                </section>}
            </div>
        </>
    );
}
