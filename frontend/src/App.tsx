import { useEffect, useState } from 'react';
import './App.css';
import { LoginContext, getLoginInfo } from './components/login/LoginContext';
import CreateAccountDialog from './components/registration/CreateAccountDialog';
import LoginDialog from './components/login/LoginDialog';
import Settings from './components/settings/Settings';
import { UserContext } from './components/settings/UserContext';
import { getUser } from './api/api';
import { UserResource } from './types/Resources';

export default function App() {
    const [loginInfo, setLoginInfo] = useState(getLoginInfo());
    const [userInfo, setUserInfo] = useState<UserResource | null>(null);
    async function getUserData() {
        if (!loginInfo)
            return;
        try {
            setUserInfo(await getUser(loginInfo.userID));
        } catch (error) { }
    }
    useEffect(() => { getUserData(); }, [loginInfo]); // if you see a warning here - ignore it

    return (
        <>
            <div id="app-background">
                <div id="app-background-gradient"></div>
            </div>
            <LoginContext.Provider value={[loginInfo, setLoginInfo]}>
                <UserContext.Provider value={[userInfo, setUserInfo]}>
                    <div id="logincontext-provider-buttons">
                        <CreateAccountDialog></CreateAccountDialog>
                        <LoginDialog></LoginDialog>
                    </div>
                    <Settings></Settings>
                </UserContext.Provider>
            </LoginContext.Provider>
        </>
    );
}
