import React, { useContext, useEffect, useRef, useState } from 'react';
import { useSockets } from '../../../Socket/context/socket.context';
import EVENTS from '../events';
import { Form, Button, Col, Alert } from 'react-bootstrap';
import { formatTimeToClose, formatOnlineUsersCount } from '../../util/Formatter';
import { UserContext } from '../../settings/UserContext';
import { LoginContext } from '../../login/LoginContext';

function RoomsContainer() {
    const { socket, roomId, rooms, currentUseronline } = useSockets();
    const newRoomRef = useRef<any>(null);
    const userlimitRef = useRef<any>(null);
    const [prevRoomId, setPrevRoomId] = useState<string | null>(null);
    const [searchInput, setSearchInput] = useState('');
    const [suggestions, setSuggestions] = useState<string[]>([]);
    const [userInfo] = useContext(UserContext);
    const [userLiveChats, setUserLiveChats] = useState<string[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [loginInfo] = useContext(LoginContext)


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

        if (!roomName || !userlimit) {
            setError('Room name and user limit are required.');
            return;
        }
        setPrevRoomId(roomId!);
        socket.emit(EVENTS.CLIENT.CREATE_ROOM, { roomName, userid: userInfo.id, userlimit });

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
        if (currentUseronline[key].onlineUser >= rooms[key].userlimit) {
            setError("This room is already full.")
            return;
        }
        socket.emit(EVENTS.CLIENT.JOIN_ROOM, key);
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

    return (
        <Col xs={3} className="sidebar bg-dark text-light">
            {error && (
                <Alert key="primary" variant="primary">
                    {error}
                </Alert>
            )}
            <Form>
                <h3>Search a Room</h3>
                <Form.Control
                    type="text"
                    value={searchInput}
                    placeholder="Search a Roomname..."
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
            <div className="mb-3">
                <Form>
                    <h3>Create a Room</h3>
                    <Form.Control
                        type="text"
                        placeholder="Room name"
                        ref={newRoomRef}
                        className="mb-2"
                        onKeyPress={(e) => EnterJoin(e)}
                    />
                    <Form.Control as="select" ref={userlimitRef} className="custom-select" size="sm">
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

                    {userLiveChats.length < 3 ? (
                        <Button variant="primary" onClick={handleCreateRoom} className="w-100">
                            CREATE ROOM
                        </Button>
                    ) : (
                        <Alert key="primary" variant="primary">
                            You already have 3 Chatrooms open. Please delete them to open another.
                        </Alert>
                    )}
                </Form>
            </div>

            <ul className="list-group">
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
        </Col>
    );
}

export default RoomsContainer;
