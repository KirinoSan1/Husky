import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import loginRouter from "./endpoints/login/LoginRouter";
import * as server from "./server";

const app: any = express();
const port: number = 3001;

app.use("*", express.json());
app.use(bodyParser.json());
app.use(cors({ origin: "http://localhost:3000" }));
app.use("/api/login", loginRouter);

server.start(app, port);