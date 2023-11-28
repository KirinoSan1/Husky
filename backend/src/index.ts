import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import loginRouter from "./endpoints/login/LoginRouter";
import * as server from "./server";
import userRouter from "./endpoints/user/UserRoute";
import postRouter from "./endpoints/post/PostRoute";
import threadRouter from "./endpoints/thread/ThreadRoute";

const app: any = express();
const port: number = 3001;

app.use("*", express.json());
app.use(bodyParser.json());
app.use(cors({ origin: "http://localhost:3000" }));
app.use("/api/login", loginRouter);
app.use("/api/user", userRouter)
app.use("/api/post", postRouter)
app.use("/api/thread", threadRouter)

server.start(app, port);
