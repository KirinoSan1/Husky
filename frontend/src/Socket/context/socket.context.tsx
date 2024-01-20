import io, { Socket } from 'socket.io-client'
import { createContext, useContext, useEffect, useState } from 'react'
import EVENTS from '../../components/livechat/events'

const SOCKET_URL = String(process.env.REACT_APP_BACKEND_URL);

interface SocketInterface {
    socket: Socket
    roomId?: string
    rooms: Record<string, { name: string, messages: { message: string, name: string, time: string, avatar: string }[], ttl: number, reopen: boolean, creatorId: string, userlimit: number, creatorname: string}>;
    messages?: { message: string, time: string, name: string, avatar: string }[]
    setMessages: Function;
    currentUseronline: Record<string, { onlineUser: number }>;
    setRoomId: Function
}



const socket = io(SOCKET_URL)


const SocketContext = createContext<SocketInterface>({
    socket,
    setMessages: () => false,
    rooms: {},
    messages: [],
    currentUseronline: {},
    setRoomId: () => false,
})

function SocketsProvider(props: any) {
    const [roomId, setRoomId] = useState("");
    const [rooms, setRooms] = useState({});
    const [messages, setMessages] = useState<Array<{ message: any; name: any; time: any, avatar: any }>>([]);
    const [currentUseronline, setcurrentUseronline] = useState({})


    useEffect(() => {
        window.onfocus = function () {
            document.title = "Husky"
        }
    }, [])

    socket.on(EVENTS.SERVER.ROOMS, (value) => {
        setRooms(value)
    })

    socket.on(EVENTS.SERVER.JOINED_ROOM, ({ roomId, messages }) => {
        setRoomId(roomId)
        if (messages === null || undefined) {
            setMessages([])
            return;
        }
        setMessages(messages)
    })

    socket.on(EVENTS.SERVER.ROOM_MESSAGE, ({ message, name, time, avatar }: { message: any; name: any; time: any, avatar: any }) => {

        if (!document.hasFocus()) {
            document.title = "New Message..."
        }

        setMessages([...messages, { message, name, time, avatar }])
    });

    socket.on(EVENTS.SERVER.CURRENT_USER, (value) => {
        setcurrentUseronline(value)

    })


    return <SocketContext.Provider value={{ socket, rooms, roomId, messages, setMessages, currentUseronline, setRoomId }} {...props} />
}


export const useSockets = () => useContext(SocketContext)

export default SocketsProvider

