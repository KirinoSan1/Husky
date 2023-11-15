import express from "express";
import * as database from "./database/database";
import http from "http";
import loginRouter from "./endpoints/login/LoginRouter";
import bodyParser from "body-parser";
import cors from "cors";
import userRouter from "./endpoints/user/UserRoute";

const PORTNUM = "3001";
const app = express();

app.use("*", express.json());
app.use(bodyParser.json());
app.use(cors({ origin: "http://localhost:3000" }));
app.use("/api/login", loginRouter);
app.use("/api/user", userRouter)

//database.connect();

const httpServer = http.createServer(app);
httpServer.listen(PORTNUM, () => {
    console.log(`Listening for HTTP at http://localhost:${PORTNUM}`);
});
export default app;