import React from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider, createBrowserRouter } from "react-router-dom";
import "./index.css";
import App from "./App";

import "bootstrap/dist/css/bootstrap.min.css";
import "./styles/css/style.css"
import Settings from "./components/settings/Settings";
import LoadingIndicator from "./components/util/LoadingIndicator";
import Thread from "./components/thread/Thread";
import ThreadSearch from "./components/thread/ThreadSearch";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
    <React.StrictMode>
        <RouterProvider
            router={createBrowserRouter([{
                path: "/",
                element: <App />,
                children: [
                    { path: "threads", element: <ThreadSearch /> },
                    { path: "threads/:id", element: <Thread /> },
                    { path: "settings", element: <Settings /> }
                ],
                errorElement: <App /> /* TODO: create a nice looking error page */
            }])}
            fallbackElement={<LoadingIndicator />}
        />
    </React.StrictMode>
);