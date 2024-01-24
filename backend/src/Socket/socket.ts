import { Server, Socket } from "socket.io";
import { nanoid } from "nanoid"

const EVENTS = {
    connection: 'connection',
    CLIENT: {
        CREATE_ROOM: "CREATE_ROOM",
        SEND_ROOM_MESSAGE: "SEND_ROOM_MESSAGE",
        JOIN_ROOM: "JOIN_ROOM",
        DISCONNECT_ROOM: "DISCONNECT_ROOM",
        REOPEN_ROOM: "REOPEN_ROOM",
        DELETE_ROOM: "DELETE_ROOM",
        CONFIRM_DELETE_ROOM: "CONFIRM_DELETE_ROOM",
        USER_LIMIT: "USER_LIMIT"
    },
    SERVER: {
        ROOMS: "ROOMS",
        JOINED_ROOM: "JOINED_ROOM",
        ROOM_MESSAGE: "ROOM_MESSAGE",
        CURRENT_USER: "CURRENT_USER",
        DELETE_ROOM_CONFIRMATION: "DELETE_ROOM_CONFIRMATION",
        IN_CHAT: "IN_CHAT"
    },
}

/**
 *
 * Timeformatter
 */
export function formatTime(value: number): string {
    return value < 10 ? `0${value}` : `${value}`;
}

let rooms: Record<string, {
    name: string,
    messages: {
        message: string,
        name: string,
        time: string,
        avatar: string
    }[],
    ttl: number,
    reopen: boolean,
    creatorId: string,
    userlimit: number,
    creatorname: string,
    subForum: string,
    inChat: string[]
}> = {};
const currentUser: Record<string, { onlineUser: number }> = {}

// The plus one is for the time to display 48
const defaultTTL = 48 * 60 * 60 * 1000 + 1;

function socket({ io }: { io: Server }) {
    console.log("Socket enabled");

    
    /**
     * When A User creates a new room.
     */
    io.on(EVENTS.connection, (socket: Socket) => {

        socket.on(EVENTS.CLIENT.CREATE_ROOM, async ({ roomName, userid, userlimit, creatorname, subForum }) => {

            // create a roomId
            const roomId = nanoid();
            // add a new room to the rooms object
            rooms[roomId] = {
                name: roomName,
                messages: [],
                ttl: Date.now() + defaultTTL,
                reopen: false,
                creatorId: userid,
                creatorname,
                userlimit,
                subForum,
                inChat: [userid]
            };

            currentUser[roomId] = {
                onlineUser: 1
            };

            await socket.join(roomId);

            socket.broadcast.emit(EVENTS.SERVER.CURRENT_USER, currentUser);
            // broadcast an event saying there is a new room
            socket.broadcast.emit(EVENTS.SERVER.ROOMS, rooms);
            // send the current Array of Userids
            socket.emit(EVENTS.SERVER.IN_CHAT, { inChat: rooms[roomId].inChat })
            socket.emit(EVENTS.SERVER.CURRENT_USER, currentUser);
            // emit back to the room creator with all the rooms
            socket.emit(EVENTS.SERVER.ROOMS, rooms);
            // emit event back the room creator saying they have joined a room
            socket.emit(EVENTS.SERVER.JOINED_ROOM, { roomId, messages: rooms[roomId].messages || [] });
            // emit the current Viewer count.
            io.emit(EVENTS.SERVER.CURRENT_USER, currentUser);
        });


        socket.on(EVENTS.CLIENT.REOPEN_ROOM, ({ roomId, ttl }) => {
            // Update the room information when reopening is requested
            rooms[roomId].ttl = ttl;
            rooms[roomId].reopen = true;

            // Broadcast the updated room information to all clients
            io.emit(EVENTS.SERVER.ROOMS, rooms);

        });

        /**
         * * When a user Sends a Message
        */

        socket.on(EVENTS.CLIENT.SEND_ROOM_MESSAGE, ({ roomId, message, name, avatar }) => {

            const date = new Date()
            rooms[roomId].messages.push({
                message,
                name,
                time: `${formatTime(date.getHours())}:${formatTime(date.getMinutes())}`,
                avatar
            });

            socket.to(roomId).emit(EVENTS.SERVER.ROOM_MESSAGE, {
                message,
                name,
                time: `${formatTime(date.getHours())}:${formatTime(date.getMinutes())}`,
                avatar
            })
        })



        /**
         * When a user joins a room
         */

        socket.on(EVENTS.CLIENT.JOIN_ROOM, async (roomId: string, userId: string) => {
            if (rooms[roomId].inChat.includes(userId)) {
                await socket.join(roomId);
                socket.emit(EVENTS.SERVER.JOINED_ROOM, { roomId, messages: rooms[roomId].messages || [] });
                socket.emit(EVENTS.SERVER.IN_CHAT, { inChat: rooms[roomId].inChat })
                io.emit(EVENTS.SERVER.IN_CHAT, { inChat: rooms[roomId].inChat })
                return;
            }
            rooms[roomId].inChat.push(userId);
            await socket.join(roomId);
            socket.emit(EVENTS.SERVER.IN_CHAT, { inChat: rooms[roomId].inChat })
            io.emit(EVENTS.SERVER.IN_CHAT, { inChat: rooms[roomId].inChat })
            let current = 0;
            if (currentUser[roomId]) {
                current = rooms[roomId].inChat.length || 0;
                currentUser[roomId] = { onlineUser: current }
                socket.emit(EVENTS.SERVER.CURRENT_USER, currentUser);
                io.emit(EVENTS.SERVER.CURRENT_USER, currentUser);
            }
            socket.emit(EVENTS.SERVER.JOINED_ROOM, { roomId, messages: rooms[roomId].messages || [] });
        });




        socket.on(EVENTS.CLIENT.DISCONNECT_ROOM, async (roomId: string, userId: string) => {
            if (rooms[roomId]) {
                rooms[roomId].inChat = rooms[roomId].inChat.filter((elem) => elem !== userId);
                let inChatArray = rooms[roomId].inChat;
                socket.emit(EVENTS.SERVER.IN_CHAT, { inChat: inChatArray });
                io.to(roomId).emit(EVENTS.SERVER.IN_CHAT, { inChat: inChatArray });
            }
        
            if (currentUser[roomId]) {
                let current = rooms[roomId].inChat.length;
                currentUser[roomId] = { onlineUser: current };
                socket.emit(EVENTS.SERVER.CURRENT_USER, currentUser);
                io.emit(EVENTS.SERVER.CURRENT_USER, currentUser);
            } else {
                socket.emit(EVENTS.SERVER.CURRENT_USER, currentUser);
            }
        });
        

        socket.on(EVENTS.CLIENT.CONFIRM_DELETE_ROOM, ({ roomId, confirmed }) => {
            if (confirmed) {
                delete rooms[roomId];
                delete currentUser[roomId];
                // Broadcast the updated room information to all clients
                io.emit(EVENTS.SERVER.ROOMS, rooms);
                io.emit(EVENTS.SERVER.CURRENT_USER, currentUser);
                io.to(roomId).emit(EVENTS.SERVER.JOINED_ROOM, { roomId: null, messages: [] });
            }
        });
        socket.emit(EVENTS.SERVER.CURRENT_USER, currentUser);
        socket.emit(EVENTS.SERVER.ROOMS, rooms)
    });

}


export default socket;
