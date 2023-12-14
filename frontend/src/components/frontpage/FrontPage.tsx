import { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import Icon from "../util/Icon";
import { getUsersThreads, getSubforumsThreads } from "../../api/api";
import { ThreadResource } from "../../types/Resources";
import React from "react";
import { LoginContext } from '../../components/login/LoginContext';
import LoadingIndicator from "../util/LoadingIndicator";

export default function FrontPage() {
    const [loginInfo] = useContext(LoginContext);
    const [searchInput, setSearchInput] = useState("");
    const [loading, setLoading] = useState(false);
    const [threads, setThreads] = useState(new Map<string, ThreadResource[]>());
    const navigate = useNavigate();

    const handleUpdate = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSearchInput(event.currentTarget.value);
    };

    const handleSearch = async () => {
        setLoading(true);

        if (searchInput.length < 2) {
            console.log("short");
            return;
        }

        /* TODO: transfer input to threads tab and execute automatically */
        navigate("/threads");

        setLoading(false);
    };

    const handleSearchEnter = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (!loading && event.key === "Enter") {
            event.preventDefault();
            handleSearch();
        }
    };

    useEffect(() => {
        if (!loginInfo) {
            return;
        }

        setLoading(true);

        const loadThreadRecommendations = async (): Promise<Map<string, ThreadResource[]>> => {
            const threadMap: Map<string, ThreadResource[]> = new Map();
            const subforumSlots: number = 2;
            const threadSlots: number = 4;
            let ownThreadsCount: number = 0;

            const ownThreads = await getUsersThreads(loginInfo.userID, threadSlots);
            ownThreadsCount = ownThreads.length;
            ownThreads.forEach(thread => {
                const subForumName: string = thread.subForum;
                const entries: ThreadResource[] | undefined = threadMap.get(subForumName);
                threadMap.set(subForumName, entries ? [...entries, thread] : [thread]);
            });

            if (threadMap.size > subforumSlots) {
                // TODO cut map
            }

            const emptySlots: number = threadSlots - ownThreadsCount;

            if (emptySlots < 1) {
                return threadMap;
            }

            const avgSubforumThreadSlots: number = Math.round(emptySlots / threadMap.size);

            if (avgSubforumThreadSlots < 1) {
                return threadMap;
            }

            // fill empty slots with threads of the same topic/subforum
            for (const entry of threadMap.entries()) {
                const subforumName: string = entry[0];
                const subforumsThreads: ThreadResource[] = await getSubforumsThreads(subforumName, avgSubforumThreadSlots);
                threadMap.set(subforumName, [...entry[1], ...subforumsThreads]);
            }

            return threadMap;
        }

        const getThreadRecommendations = async () => {
            const threads: Map<string, ThreadResource[]> = await loadThreadRecommendations();
            setThreads(threads);
        }

        getThreadRecommendations();
        setLoading(false);
    }, [loginInfo]);

    const handleClickThread = (event: React.MouseEvent) => {
        navigate("/threads/" + event.currentTarget.id);
    };

    return (
        <>
            <img id="banner-logo" src="/images/logo.png" alt="Big Husky logo" />
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
            {loading && <LoadingIndicator />}
            {loginInfo && !loading && Array.from(threads.entries()).map(entry => {
                const subforumName: string = entry[0];
                let keyCounter: number = 0;

                return (
                    <section key={subforumName}>
                        <h4>{subforumName}</h4>
                        <ul>
                            {entry[1].map((thread: any) => {
                                return (
                                    <li key={++keyCounter} id={thread.id} onClick={handleClickThread}>
                                        <Icon
                                            data="M8.39 12.648a1.32 1.32 0 0 0-.015.18c0 .305.21.508.5.508.266 0 .492-.172.555-.477l.554-2.703h1.204c.421 0 .617-.234.617-.547 0-.312-.188-.53-.617-.53h-.985l.516-2.524h1.265c.43 0 .618-.227.618-.547 0-.313-.188-.524-.618-.524h-1.046l.476-2.304a1.06 1.06 0 0 0 .016-.164.51.51 0 0 0-.516-.516.54.54 0 0 0-.539.43l-.523 2.554H7.617l.477-2.304c.008-.04.015-.118.015-.164a.512.512 0 0 0-.523-.516.539.539 0 0 0-.531.43L6.53 5.484H5.414c-.43 0-.617.22-.617.532 0 .312.187.539.617.539h.906l-.515 2.523H4.609c-.421 0-.609.219-.609.531 0 .313.188.547.61.547h.976l-.516 2.492c-.008.04-.015.125-.015.18 0 .305.21.508.5.508.265 0 .492-.172.554-.477l.555-2.703h2.242l-.515 2.492zm-1-6.109h2.266l-.515 2.563H6.859l.532-2.563z"
                                            width={24}
                                            height={24}
                                        />
                                        <p className="topic-entry-preview-title">{thread.title}</p>
                                        <p>{thread.numPosts + (thread.numPosts === 1 ? " post" : " posts")}</p>
                                        <div>
                                            <img
                                                src="/images/logo.png"
                                                alt={"Profile avatar of " + thread.creatorName}
                                                width={24}
                                                height={24}
                                            />
                                            <p>{thread.creatorName}</p>
                                        </div>
                                    </li>
                                );
                            })}
                        </ul>
                    </section>
                );
            })}
        </>
    );
}
