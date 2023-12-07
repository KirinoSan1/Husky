import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Icon from "../util/Icon";

export default function FrontPage() {
    const [searchInput, setSearchInput] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleUpdate = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchInput(e.currentTarget.value);
    };

    const handleSearch = async () => {
        setLoading(true);

        if (searchInput.length < 3) {
            console.log("short");
            return;
        }

        /* TODO: show search results (with query?) */
        navigate("/threads");

        setLoading(false);
    };

    const handleSearchEnter = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (!loading && event.key === "Enter") {
            event.preventDefault();
            handleSearch();
        }
    };

    const topicName = "Mathematics";

    const entryTitle = "Is there anybody who could explain to me why the least squares method for linear regression is only used when an asteroid destroys the earth";
    const posts = 4;
    const answers = 2;
    const creatorName = "Christoph G.";

    const entryTitle2 = "Hilbert's paradox of the Grant Hotel";
    const posts2 = 8;
    const answers2 = 3;
    const creatorName2 = "Malina73";

    const topicName2 = "Programming";

    const entryTitle3 = "How do I convert a C# object into a JSON object?";
    const posts3 = 1;
    const answers3 = 0;
    const creatorName3 = "CenedrilGod";

    const entryTitle4 = "Let's discuss the upcoming changes of Java 21";
    const posts4 = 7;
    const answers4 = 2;
    const creatorName4 = "Bearman";

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
            <section>
                <h4>{topicName}</h4>
                <ul>
                    <li>
                        <Icon
                            data="M8.39 12.648a1.32 1.32 0 0 0-.015.18c0 .305.21.508.5.508.266 0 .492-.172.555-.477l.554-2.703h1.204c.421 0 .617-.234.617-.547 0-.312-.188-.53-.617-.53h-.985l.516-2.524h1.265c.43 0 .618-.227.618-.547 0-.313-.188-.524-.618-.524h-1.046l.476-2.304a1.06 1.06 0 0 0 .016-.164.51.51 0 0 0-.516-.516.54.54 0 0 0-.539.43l-.523 2.554H7.617l.477-2.304c.008-.04.015-.118.015-.164a.512.512 0 0 0-.523-.516.539.539 0 0 0-.531.43L6.53 5.484H5.414c-.43 0-.617.22-.617.532 0 .312.187.539.617.539h.906l-.515 2.523H4.609c-.421 0-.609.219-.609.531 0 .313.188.547.61.547h.976l-.516 2.492c-.008.04-.015.125-.015.18 0 .305.21.508.5.508.265 0 .492-.172.554-.477l.555-2.703h2.242l-.515 2.492zm-1-6.109h2.266l-.515 2.563H6.859l.532-2.563z"
                            width={24}
                            height={24}
                        />
                        <p className="topic-entry-preview-title">{entryTitle}</p>
                        <p>
                            {posts + " posts"}<br />
                            {answers + " answers"}
                        </p>
                        <div>
                            <img
                                src="/images/dummies/christoph_g.jpg"
                                alt={"Profile avatar of " + creatorName}
                                width={24}
                            />
                            <p>{creatorName}</p>
                        </div>
                    </li>
                    <li>
                        <Icon
                            data="M8.39 12.648a1.32 1.32 0 0 0-.015.18c0 .305.21.508.5.508.266 0 .492-.172.555-.477l.554-2.703h1.204c.421 0 .617-.234.617-.547 0-.312-.188-.53-.617-.53h-.985l.516-2.524h1.265c.43 0 .618-.227.618-.547 0-.313-.188-.524-.618-.524h-1.046l.476-2.304a1.06 1.06 0 0 0 .016-.164.51.51 0 0 0-.516-.516.54.54 0 0 0-.539.43l-.523 2.554H7.617l.477-2.304c.008-.04.015-.118.015-.164a.512.512 0 0 0-.523-.516.539.539 0 0 0-.531.43L6.53 5.484H5.414c-.43 0-.617.22-.617.532 0 .312.187.539.617.539h.906l-.515 2.523H4.609c-.421 0-.609.219-.609.531 0 .313.188.547.61.547h.976l-.516 2.492c-.008.04-.015.125-.015.18 0 .305.21.508.5.508.265 0 .492-.172.554-.477l.555-2.703h2.242l-.515 2.492zm-1-6.109h2.266l-.515 2.563H6.859l.532-2.563z"
                            width={24}
                            height={24}
                        />
                        <p className="topic-entry-preview-title">{entryTitle2}</p>
                        <p>
                            {posts2 + " posts"}<br />
                            {answers2 + " answers"}
                        </p>
                        <div>
                            <img
                                src="/images/dummies/malina73.jpg"
                                alt={"Profile avatar of " + creatorName2}
                                width={24}
                            />
                            <p>{creatorName2}</p>
                        </div>
                    </li>
                </ul>
            </section>
            <section>
                <h4>{topicName2}</h4>
                <ul>
                    <li>
                        <Icon
                            data="M8.39 12.648a1.32 1.32 0 0 0-.015.18c0 .305.21.508.5.508.266 0 .492-.172.555-.477l.554-2.703h1.204c.421 0 .617-.234.617-.547 0-.312-.188-.53-.617-.53h-.985l.516-2.524h1.265c.43 0 .618-.227.618-.547 0-.313-.188-.524-.618-.524h-1.046l.476-2.304a1.06 1.06 0 0 0 .016-.164.51.51 0 0 0-.516-.516.54.54 0 0 0-.539.43l-.523 2.554H7.617l.477-2.304c.008-.04.015-.118.015-.164a.512.512 0 0 0-.523-.516.539.539 0 0 0-.531.43L6.53 5.484H5.414c-.43 0-.617.22-.617.532 0 .312.187.539.617.539h.906l-.515 2.523H4.609c-.421 0-.609.219-.609.531 0 .313.188.547.61.547h.976l-.516 2.492c-.008.04-.015.125-.015.18 0 .305.21.508.5.508.265 0 .492-.172.554-.477l.555-2.703h2.242l-.515 2.492zm-1-6.109h2.266l-.515 2.563H6.859l.532-2.563z"
                            width={24}
                            height={24}
                        />
                        <p className="topic-entry-preview-title">{entryTitle3}</p>
                        <p>
                            {posts3 + " posts"}<br />
                            {answers3 + " answers"}
                        </p>
                        <div>
                            <img
                                src="/images/dummies/cenedrilgod.jpg"
                                alt={"Profile avatar of " + creatorName3}
                                width={24}
                            />
                            <p>{creatorName3}</p>
                        </div>
                    </li>
                    <li>
                        <Icon
                            data="M8.39 12.648a1.32 1.32 0 0 0-.015.18c0 .305.21.508.5.508.266 0 .492-.172.555-.477l.554-2.703h1.204c.421 0 .617-.234.617-.547 0-.312-.188-.53-.617-.53h-.985l.516-2.524h1.265c.43 0 .618-.227.618-.547 0-.313-.188-.524-.618-.524h-1.046l.476-2.304a1.06 1.06 0 0 0 .016-.164.51.51 0 0 0-.516-.516.54.54 0 0 0-.539.43l-.523 2.554H7.617l.477-2.304c.008-.04.015-.118.015-.164a.512.512 0 0 0-.523-.516.539.539 0 0 0-.531.43L6.53 5.484H5.414c-.43 0-.617.22-.617.532 0 .312.187.539.617.539h.906l-.515 2.523H4.609c-.421 0-.609.219-.609.531 0 .313.188.547.61.547h.976l-.516 2.492c-.008.04-.015.125-.015.18 0 .305.21.508.5.508.265 0 .492-.172.554-.477l.555-2.703h2.242l-.515 2.492zm-1-6.109h2.266l-.515 2.563H6.859l.532-2.563z"
                            width={24}
                            height={24}
                        />
                        <p className="topic-entry-preview-title">{entryTitle4}</p>
                        <p>
                            {posts4 + " posts"}<br />
                            {answers4 + " answers"}
                        </p>
                        <div>
                            <img
                                src="/images/dummies/bearman.jpg"
                                alt={"Profile avatar of " + creatorName4}
                                width={24}
                            />
                            <p>{creatorName4}</p>
                        </div>
                    </li>
                </ul>
            </section>
        </>
    );
}
