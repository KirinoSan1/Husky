import { useEffect, useState } from 'react';
import './App.css';
import { LoginContext, getLoginInfo } from './components/login/LoginContext';
import Navigation from './components/navigation/Navigation';
import { UserContext } from './components/settings/UserContext';
import { getUser } from './api/api';
import { UserResource } from './types/Resources';
import { Outlet, useLocation } from 'react-router-dom';

export default function App() {
    const [loginInfo, setLoginInfo] = useState(getLoginInfo());
    const [userInfo, setUserInfo] = useState<UserResource | null>(null);

    useEffect(() => {
        async function getUserData() {
            if (!loginInfo)
                return;
            try {
                setUserInfo(await getUser(loginInfo.userID));
            } catch (error) { }
        }
        getUserData();
    }, [loginInfo]);

    const routeName: string = useLocation().pathname.substring(1);

    return (
        <>
            <div id="app-background">
                <div id="app-background-gradient"></div>
            </div>
            <LoginContext.Provider value={[loginInfo, setLoginInfo]}>
                <UserContext.Provider value={[userInfo, setUserInfo]}>
                    <Navigation />
                    <main id={(routeName.length > 0 ? routeName : "home") + "-page-container"}>
                        <Outlet />
                    </main>
                </UserContext.Provider>
            </LoginContext.Provider>
        </>
    );
}
