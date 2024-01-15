import { useContext, useEffect, useState } from "react";
import { SubforumResource, ThreadResource } from '../../types/Resources';
import { getSubforums, getSubforumsThreads } from "../../api/api";
import Icon from "../util/Icon";
import LoadingIndicator from "../util/LoadingIndicator";
import { useNavigate } from "react-router-dom";
import { UserContext } from "../settings/UserContext";

export default function TopicsPage() {

    const [userInfo] = useContext(UserContext);

    const [topics, setTopics] = useState<SubforumResource[]>([]);
    const [topicThreads, setTopicThreads] = useState(new Map<string, ThreadResource[]>());

    const navigate = useNavigate();

    useEffect(() => {
        const loadSubforums = async () => {
            setTopics(await getSubforums());
        };
        loadSubforums();
    }, []);

    const getTopicThreads = (topic: string) => {
        if (topicThreads.has(topic)) {
            return;
        }

        const loadSubforumsThreads = async () => {
            setTopicThreads(new Map(topicThreads.set(topic, await getSubforumsThreads(topic, 100))));
        };

        loadSubforumsThreads();
    };

    const handleClickThread = (event: React.MouseEvent) => {
        navigate("/threads/" + event.currentTarget.id);
    };

    return (
        <>
            <h2>Topics</h2>
            <section id="topics-container">
                {topics.map((topic: SubforumResource, index) => {
                    const threads: ThreadResource[] | undefined = topicThreads.get(topic.name);

                    return (
                        <div className="topic-container" key={index}>
                            <input type="checkbox" className="topic-toggle" id={"topic-header-" + topic.name} title={topic.name} />
                            <label htmlFor={"topic-header-" + topic.name} onClick={() => { getTopicThreads(topic.name); }}>
                                <p>{topic.name}</p>
                                <small>{topic.description}</small>
                            </label>
                            <ul>
                                {!threads && <LoadingIndicator />}
                                {threads && (threads.length > 0 ? threads.map((thread, index) => {
                                    return (
                                        <li key={index} id={thread.id} className={userInfo && userInfo.name === thread.creatorName ? "own-thread" : undefined} onClick={handleClickThread}>
                                            <Icon data="M8.39 12.648a1.32 1.32 0 0 0-.015.18c0 .305.21.508.5.508.266 0 .492-.172.555-.477l.554-2.703h1.204c.421 0 .617-.234.617-.547 0-.312-.188-.53-.617-.53h-.985l.516-2.524h1.265c.43 0 .618-.227.618-.547 0-.313-.188-.524-.618-.524h-1.046l.476-2.304a1.06 1.06 0 0 0 .016-.164.51.51 0 0 0-.516-.516.54.54 0 0 0-.539.43l-.523 2.554H7.617l.477-2.304c.008-.04.015-.118.015-.164a.512.512 0 0 0-.523-.516.539.539 0 0 0-.531.43L6.53 5.484H5.414c-.43 0-.617.22-.617.532 0 .312.187.539.617.539h.906l-.515 2.523H4.609c-.421 0-.609.219-.609.531 0 .313.188.547.61.547h.976l-.516 2.492c-.008.04-.015.125-.015.18 0 .305.21.508.5.508.265 0 .492-.172.554-.477l.555-2.703h2.242l-.515 2.492zm-1-6.109h2.266l-.515 2.563H6.859l.532-2.563z" />
                                            <p className="topic-entry-preview-title">{thread.title}</p>
                                            <p>{thread.numPosts + (thread.numPosts === 1 ? " post" : " posts")}</p>
                                            <div>
                                                <img
                                                    src={"/images/logo.png"}
                                                    alt={"Profile avatar of " + thread.creatorName}
                                                    loading="lazy"
                                                />
                                                <p>{thread.creatorName}</p>
                                            </div>
                                        </li>
                                    );
                                }) : <li className="no-threads-found"><p>{"No threads matching the " + topic.name + " topic"}</p></li>)}
                            </ul>
                        </div>
                    );
                })}
            </section>
        </>
    );
}
