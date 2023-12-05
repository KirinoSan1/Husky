import { useState } from "react";
import { useNavigate } from "react-router-dom";

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
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="bi bi-search"
                        width="16"
                        height="16"
                        viewBox="0 0 16 16"
                        fill="currentColor"
                    >
                        <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007 1.007 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0"/>
                    </svg>
                </span>
            </label>
        </>
    );
}
