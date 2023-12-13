import express, { Express } from "express";
import bodyParser from "body-parser";
import cors from "cors";
import loginRouter from "./endpoints/login/LoginRouter";
import * as server from "./server";
import userRouter from "./endpoints/user/UserRoute";
import postRouter from "./endpoints/post/PostRoute";
import { threadPageRouter } from "./endpoints/threadpage/ThreadPageRoute";
import threadRouter from "./endpoints/thread/ThreadRoute";
import { subForumRouter } from "./endpoints/subforum/SubForumRoute";

const app: Express = express();
const port: number = 443;

app.use("*", cors({
    origin: [
        "https://127.0.0.1:3000",
        "https://localhost:3000"
    ]
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

server.start(app, port);
