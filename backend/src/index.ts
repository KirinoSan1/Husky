import express, { Express } from "express";
import bodyParser from "body-parser";
import cors from "cors";
import loginRouter from "./endpoints/login/LoginRouter";
import * as serverModul from "./server";
import userRouter from "./endpoints/user/UserRoute";
import postRouter from "./endpoints/post/PostRoute";
import { threadPageRouter } from "./endpoints/threadpage/ThreadPageRoute";
import threadRouter from "./endpoints/thread/ThreadRoute";
import { subForumRouter } from "./endpoints/subforum/SubForumRoute";
import { Server } from "socket.io";
import socket from "./Socket/socket";
import dotenv from "dotenv";
dotenv.config();

const USE_HTTPS = String(process.env.USE_HTTPS) === "true";
const SERVER_PORT = Number(process.env.SERVER_PORT);

const app: Express = express();

const origins = [
    "https://127.0.0.1:3000",
    "https://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:3000",
    "https://husky.lehre.ris.bht-berlin.de",
    "http://husky.lehre.ris.bht-berlin.de",
    "https://husky.lehre.ris.bht-berlin.de:3000",
    "http://husky.lehre.ris.bht-berlin.de:3000"
];

app.use("*", cors({
    origin: origins
}));
app.use(function (request, response, next) {
    response.header("Access-Control-Allow-Origin", "*");
    response.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    response.header("Access-Control-Expose-Headers", "Authorization");
    next();
});

app.use("*", express.json({ limit: "5mb" }));
app.use(bodyParser.json());

app.use("/api/login", loginRouter);
app.use("/api/user", userRouter)
app.use("/api/post", postRouter)
app.use("/api/threadpage", threadPageRouter)
app.use("/api/thread", threadRouter)
app.use("/api/subforum", subForumRouter)
// const io = new Server(server,{});
// server.start(app, SERVER_PORT);

const server = serverModul.start(app, SERVER_PORT, USE_HTTPS, () => {
    socket({ io })
});

app.get("/", (_, res) => { res.send('Server is up and running.') })

const io = new Server(server, {
    cors: { origin: origins }
})

