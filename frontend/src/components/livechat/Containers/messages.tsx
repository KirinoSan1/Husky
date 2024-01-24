import { useRef, useContext, KeyboardEvent, useEffect, useState } from "react";
import { useSockets } from "../../../Socket/context/socket.context";
import EVENTS from "../events";
import { UserContext } from "../../settings/UserContext";
import { Button, Form, Row, Col } from 'react-bootstrap';
import { formatTimeToClose } from "../../util/Formatter";
import { LoginContext } from "../../login/LoginContext";

function MessagesContainer() {
  const { socket, messages, roomId, setMessages, currentUseronline, rooms, setRoomId, userinChat } = useSockets();
  const newMessageRef = useRef<any>(null);
  const messageEndRef = useRef<any>(null);
  const [userInfo] = useContext(UserContext);
  const [roomClosed, setRoomClosed] = useState<boolean>(false);
  const [leaveButtonDisabled, setLeaveButtonDisabled] = useState(false);
  const [isRoomReopen, setIsRoomReopen] = useState<boolean>(false);
  const [loginInfo] = useContext(LoginContext)
  const [userinChatState, setUserinChatState] = useState(userinChat);

  useEffect(() => { }, [socket, messages, roomId, setMessages, currentUseronline, roomClosed, userinChat])

  useEffect(() => {
    if (!roomId || !rooms[roomId] || !rooms[roomId].ttl) {
      return;
    }

    const intervalId = setInterval(() => {
      if (formatTimeToClose(rooms[roomId].ttl) === "Closed") {
        setRoomClosed(true);
      } else {
        setRoomClosed(false);
      }
    }, 1000);

    return () => clearInterval(intervalId);
  }, [roomId, rooms, isRoomReopen, roomClosed]);

  useEffect(() => {
    messageEndRef.current?.scrollIntoView();
  }, [messages]);

  useEffect(() => {
    setUserinChatState(userinChat);
  }, [userinChat])

  useEffect(() => {
    if (!loginInfo.role === null) {
      socket.emit(EVENTS.CLIENT.DISCONNECT_ROOM, roomId, userInfo.id);
    } else {
      return;
    }

  }, [roomId, loginInfo])


  if (!roomId) {
    return <div />;
  }


  function handleReopenRoom() {
    if (isRoomReopen) {
      return;
    }
    const date = Date.now() + 24 * 60 * 60 * 1000;
    if (!rooms[roomId!].reopen) {
      rooms[roomId!].ttl = date;
      rooms[roomId!].reopen = true;
      setIsRoomReopen(true)
      // Emit the reopening event to the server
      socket.emit(EVENTS.CLIENT.REOPEN_ROOM, { roomId, ttl: date });
      setRoomClosed(false);
    } else {
      return;
    }
  }

  function handleSendMessage() {
    if (newMessageRef.current) {
      const message = newMessageRef.current.value;
      const name = userInfo.name;
      const avatar = userInfo.avatar || "";
      if (message === "" || message.trim() === "") {
        newMessageRef.current.value = "";
        return;
      }
      socket.emit(EVENTS.CLIENT.SEND_ROOM_MESSAGE, { roomId, message, name, avatar });

      const date = new Date();
      setMessages((prevMessages: any) => [
        ...prevMessages,
        {
          name: name,
          message,
          time: `${date.getHours()}:${date.getMinutes()}`,
        },
      ]);
      newMessageRef.current.value = "";
    } else {
      return;
    }
  }

  function handleSendKey(e: KeyboardEvent<any>) {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSendMessage()
    }
    return;
  }

  function handleDeleteRoom() {

    if (roomId && rooms[roomId]) {
      const confirmDelete = window.confirm("Möchten Sie diesen Raum wirklich löschen?");

      if (confirmDelete) {
        socket.emit(EVENTS.CLIENT.CONFIRM_DELETE_ROOM, { roomId, confirmed: true });
        setRoomId(null)
      }
    }
  }

  function handleLeaveRoom() {
    if (leaveButtonDisabled) {
      return;
    }
    socket.emit(EVENTS.CLIENT.DISCONNECT_ROOM, roomId, userInfo.id)
    setLeaveButtonDisabled(true);
    window.location.reload();
    setTimeout(() => {
      setLeaveButtonDisabled(false);
    }, 1000);
  }

  return (
    <Row>
      <Col xs={12} id="chats-page-messages">
        {roomId && rooms[roomId] && rooms[roomId].name && (
          <>
            <div className="h3-title">
              <h3 className="room-heading">{rooms[roomId].name}</h3>
              <div className="h3-underline" />
            </div>
            <div className="room-details">
              <span className="room-userlimit">Users online: {currentUseronline[roomId].onlineUser}/{rooms[roomId].userlimit}</span>
              <span> | </span>
              <span>Room will be closed in: {formatTimeToClose(rooms[roomId].ttl)}</span>
              {/* {rooms[roomId] && rooms[roomId].inChat.join(",")}
              <span> | </span>
              {rooms[roomId] && userinChatState.join(",")}
              <span> | Länge </span>
              {rooms[roomId] && userinChatState.length} */}
            </div>
          </>
        )}
        <div className="messages-container">
          {messages !== undefined && messages!.map(({ message, name, time, avatar }, index) => (
            <div
              key={index}
              className={`d-flex align-items-end justify-content-${name === userInfo.name ? 'end' : 'start'}`}
              style={{ marginBottom: '10px', marginTop: '10px' }}
            >
              {name !== userInfo.name && avatar && (
                <img src={avatar} alt={`${name}'s Avatar`} style={{ width: '30px', height: '30px', borderRadius: '50%', marginRight: '5px' }} />
              )}
              <div className="single-message">
                <div className="single-message-details">
                  <span className="single-message-name">{name}</span>
                  <span className="single-message-time"> {time}</span>
                </div>
                <span className="single-message-content">
                  {message}
                </span>
              </div>
            </div>
          ))}

          <div ref={messageEndRef} />
        </div>
      </Col>
      <Col xs={12} className="mb-3">
        <Form.Control
          as="textarea"
          rows={1}
          placeholder={roomClosed ? "Can't send a message because the room is closed" : "Send a message..."}
          ref={newMessageRef}
          onKeyPress={(e) => handleSendKey(e)}
          disabled={roomClosed}
        />
      </Col>
      <Col xs={12}>
        <Button onClick={handleSendMessage} variant="primary" >
          Send
        </Button>

        {roomId && rooms[roomId] && rooms[roomId].creatorId === userInfo.id && (
          <Button
            variant={!isRoomReopen ? "primary" : "danger"}
            disabled={!roomClosed || isRoomReopen}
            onClick={handleReopenRoom}
            title={!isRoomReopen ? "You can reopen this Chat one more time, once the Timer is done." : "Room has already been Reopend. "}
          >
            Reopen
          </Button>
        )}
        {roomId && <Button variant="danger" disabled={leaveButtonDisabled} onClick={handleLeaveRoom}> Leave Room </Button>}
        {roomId && rooms[roomId] && rooms[roomId].creatorId === userInfo.id && (
          <Button
            variant="danger"
            onClick={handleDeleteRoom}
          >
            Delete Room
          </Button>
        )}

      </Col>
    </Row>
  );
}

export default MessagesContainer;