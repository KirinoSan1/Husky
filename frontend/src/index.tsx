import React from "react";
import ReactDOM from "react-dom/client";
import { Navigate, RouterProvider, createBrowserRouter } from "react-router-dom";
import "./index.css";
import App from "./App";

import "bootstrap/dist/css/bootstrap.min.css";
import "./styles/css/style.css"
import Settings from "./components/settings/Settings";
import LoadingIndicator from "./components/util/LoadingIndicator";
import Thread from "./components/thread/Thread";
import ThreadSearch from "./components/thread/ThreadSearch";
import FrontPage from "./components/frontpage/FrontPage";
import { CreateThreadPage } from "./components/thread/CreateThreadPage";
import Confirmation from "./components/registration/confirmation";


ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
    <React.StrictMode>
        <RouterProvider
            router={createBrowserRouter([{
                path: "/",
                element: <App />,
                children: [
                    { path: "", element: <FrontPage /> },
                    { path: "threads", element: <ThreadSearch /> },
                    { path: "threads/:id", element: <Navigate to="1" /> },
                    { path: "threads/:id/:page", element: <Thread /> },
                    { path: "threads/create", element: <CreateThreadPage /> },
                    { path: "settings", element: <Settings /> },
                    { path: "api/user/:id/verify/:token", element: <Confirmation /> }
                ],
                errorElement: <App /> /* TODO: create a nice looking error page */
            }])}
            fallbackElement={<LoadingIndicator />}
        />
    </React.StrictMode>
);