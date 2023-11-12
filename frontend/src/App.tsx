import { useState } from 'react';
import './App.css';
import { LoginContext, getLoginInfo } from './components/login/LoginContext';
import LoginDialog from './components/login/LoginDialog';

export default function App() {
    const [loggedIn, setLoggedIn] = useState(!!getLoginInfo());

    return (
        <>
            <div id="app-background">
                <div id="app-background-gradient"></div>
            </div>
            <LoginContext.Provider value={[loggedIn, setLoggedIn]}>
                <LoginDialog></LoginDialog>
            </LoginContext.Provider>
        </>
    );
}
