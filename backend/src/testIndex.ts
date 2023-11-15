import express from "express";
import loginRouter from "./endpoints/login/LoginRouter";
import bodyParser from "body-parser";
import cors from "cors";
import userRouter from "./endpoints/user/UserRoute";

const app = express();

app.use("*", express.json());
app.use(bodyParser.json());
app.use(cors({ origin: "http://localhost:3000" }));
app.use("/api/login", loginRouter);
app.use("/api/user", userRouter)

export default app;