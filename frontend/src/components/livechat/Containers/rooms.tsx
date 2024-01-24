import React, { useContext, useEffect, useRef, useState } from 'react';
import { useSockets } from '../../../Socket/context/socket.context';
import EVENTS from '../events';
import { Form, Button, Alert } from 'react-bootstrap';
import { formatTimeToClose, formatOnlineUsersCount } from '../../util/Formatter';
import { UserContext } from '../../settings/UserContext';
import { LoginContext } from '../../login/LoginContext';

function RoomsContainer() {
    const { socket, roomId, rooms, currentUseronline, userinChat } = useSockets();
    const newRoomRef = useRef<any>(null);
    const userlimitRef = useRef<any>(null);
    const subforumRef = useRef<any>(null);
    const [prevRoomId, setPrevRoomId] = useState<string | null>(null);
    const [searchInput, setSearchInput] = useState('');
    const [suggestions, setSuggestions] = useState<string[]>([]);
    const [userInfo] = useContext(UserContext);
    const [userLiveChats, setUserLiveChats] = useState<string[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [loginInfo] = useContext(LoginContext)
    const [userinChatState, setUserinChatState] = useState(userinChat);


    useEffect(() => {
        // Update userLiveChats when rooms change
        const userRooms = Object.keys(rooms).filter((key) => rooms[key].creatorId === userInfo.id);
        setUserLiveChats(userRooms);
    }, [rooms, userInfo.id, loginInfo]);

    useEffect(() => {
        setPrevRoomId(roomId!);
    }, [roomId]);

    useEffect(() => {
        const handleBeforeUnload = (event: any) => {
            socket.emit(EVENTS.CLIENT.DISCONNECT_ROOM, roomId);
        };

        window.addEventListener('beforeunload', handleBeforeUnload);

        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload);
        };
    }, [prevRoomId, socket, roomId]);

    useEffect(() => {
        if (prevRoomId && prevRoomId !== roomId) {
            socket.emit(EVENTS.CLIENT.DISCONNECT_ROOM, prevRoomId);
        }
    }, [roomId, prevRoomId, socket, rooms]);

    useEffect(() => {
        setSuggestions(
            Object.keys(rooms).filter((key) =>
                rooms[key].name.toLowerCase().includes(searchInput.trim().toLowerCase())
            )
        );
    }, [searchInput, rooms]);


    function handleCreateRoom() {
        const roomName = newRoomRef.current.value.trim();
        const userlimit = userlimitRef.current.value.trim();
        const subforum = subforumRef.current.value.trim();
        if (!roomName || !userlimit) {
            setError('Room name is required.');
            return;
        }
        if (!subforum) {
            setError('Room name and user limit are required.');
            return;
        }
        setPrevRoomId(roomId!);


        socket.emit(EVENTS.CLIENT.CREATE_ROOM, { roomName, userid: userInfo.id, userlimit, creatorname: userInfo.name, subforum });

        newRoomRef.current.value = '';
        setError(null)
    }

    function handleJoinRoom(key: string) {
        if (key === roomId) {
            return;
        }
        if (roomId) {
            setPrevRoomId(roomId);
        }

        const userInChat = userinChatState.includes(userInfo.id);
        const roomUserLimitReached = currentUseronline[key].onlineUser >= rooms[key].userlimit;

        console.log(`user found: ${rooms[key].inChat.includes(userInfo.id)} | current user: ${currentUseronline[key].onlineUser} | room user limit: ${rooms[key].userlimit}`);
        if (!userInChat && roomUserLimitReached) {
            setError("This room is already full.")
            return;
        }

        socket.emit(EVENTS.CLIENT.JOIN_ROOM, key, userInfo.id);
        setError(null)
    }

    function EnterJoin(e: any) {
        if (e.key === 'Enter') {
            e.preventDefault();
            // Check if the user has reached the maximum limit of live chats
            if (userLiveChats.length < 3) {
                handleCreateRoom();
            } else {
                return;
            }
        }
    }

    if (roomId) {
        // Don't render anything if roomId is null
        return null;
    }

    const subforums = [
        'Cuisine',
        'History',
        'Mathematics',
        'Philosophy',
        'Science'
    ];
    return (
        <>
            {error && (
                <Alert key="primary" variant="primary">
                    {error}
                </Alert>
            )}

            <div>
                <Form>
                    <h4>Create a room:</h4>
                    <Form.Control
                        type="text"
                        placeholder="Room name..."
                        ref={newRoomRef}
                        className="mb-2"
                        onKeyPress={(e) => EnterJoin(e)}
                    />
                    <h4>Set a User limit:</h4>

                    <Form.Control as="select" ref={userlimitRef} className="custom-select">
                        {!userlimitRef.current?.value && (
                            <option value="" disabled hidden>
                                Set a User limit
                            </option>
                        )}

                        {Array.from({ length: 19 }, (_, index) => index + 2).map((limit) => (
                            <option key={limit} value={limit}>
                                {limit}
                            </option>
                        ))}

                    </Form.Control>

                    <h4>Choose your Subforum :</h4>

                    <Form.Control as="select" ref={subforumRef} className="custom-select">
                        {subforums.map((subforum, index) => (
                            <option key={index} value={subforum}>
                                {subforum}
                            </option>
                        ))}

                    </Form.Control>
                    {/* <h4>Subforum: </h4> */}
                    {userLiveChats.length < 3 ? (
                        <Button variant="primary" onClick={handleCreateRoom}>
                            Create New Room
                        </Button>
                    ) : (
                        <Alert key="primary" variant="primary">
                            You already have 3 Chatrooms open. Please delete them to open another.
                        </Alert>
                    )}

                </Form>
            </div>
            <div className="livechat-horizontal-line" />
            <Form>
                <h4>Search for rooms by title:</h4>
                <Form.Control
                    type="text"
                    value={searchInput}
                    placeholder="Room name..."
                    className="mb-2"
                    onChange={(e) => setSearchInput(e.target.value)}
                />
            </Form>

            {searchInput && suggestions.length > 0 && (
                <ul className="list-group suggestions-list bg-dark">
                    {suggestions.map((key) => (
                        <li key={key} className="list-group-item bg-dark">
                            <button className="btn btn-primary w-50 text-light" onClick={() => handleJoinRoom(key)}>
                                {rooms[key] && rooms[key].name}
                            </button>
                        </li>
                    ))}
                </ul>
            )}

            <ul className="list-group">
                <h4>Rooms to join: </h4>
                {Object.keys(rooms).map((key) => (
                    <li key={key} className="list-group-item bg-dark" style={{ color: 'white' }}>
                        <div className="room-info">
                            <div className="room-name">
                                <Button
                                    variant={key === roomId ? 'secondary' : 'primary'}
                                    disabled={key === roomId}
                                    title={`Join ${rooms[key].name}`}
                                    onClick={() => handleJoinRoom(key)}
                                    className="w-100"
                                >
                                    {rooms[key].name}
                                </Button>
                            </div>
                            <div className="room-details">
                                <span style={{ color: 'white' }}>{formatOnlineUsersCount(currentUseronline[key]?.onlineUser)}</span>
                                <br />
                                <span style={{ color: 'white' }}>Room will be closed in : {formatTimeToClose(rooms[key].ttl)}</span>
                            </div>
                        </div>
                    </li>
                ))}
            </ul>
        </>
    );
}

export default RoomsContainer;
