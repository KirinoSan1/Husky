import express from "express";
import loginRouter from "./endpoints/login/LoginRouter";
import bodyParser from "body-parser";
import cors from "cors";
import userRouter from "./endpoints/user/UserRoute";
import postRouter from "./endpoints/post/PostRoute";
import { threadPageRouter } from "./endpoints/threadpage/ThreadPageRoute";
import threadRouter from "./endpoints/thread/ThreadRoute";
import { subForumRouter } from "./endpoints/subforum/SubForumRoute";

const app = express();

app.use("*", express.json());
app.use(bodyParser.json());
app.use(cors({ origin: "http://127.0.0.1:3000" }));
app.use("/api/login", loginRouter);
app.use("/api/user", userRouter);
app.use("/api/post", postRouter);
app.use("/api/threadpage", threadPageRouter);
app.use("/api/thread", threadRouter);
app.use("/api/subforum", subForumRouter);

export default app;
