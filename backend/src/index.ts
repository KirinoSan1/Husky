import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import loginRouter from "./endpoints/login/LoginRouter";
import * as server from "./server";
import userRouter from "./endpoints/user/UserRoute";

const app: any = express();
const port: number = 3001;

app.use("*", express.json());
app.use(bodyParser.json());
app.use(cors({ origin: "http://localhost:3000" }));
app.use("/api/login", loginRouter);
app.use("/api/user", userRouter)

server.start(app, port);
