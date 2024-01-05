import mongoose, { Connection } from "mongoose";
import { prefillAdmin, prefillPineappleThread, prefillSubforums } from "./prefill";
import dotenv from "dotenv";
dotenv.config();

const DB_URL = String(process.env.DB_URL);

let connection: Connection;

export function connect() {
    if (connection) {
        throw new Error("Database connection has already been established");
    }

    mongoose.connect(DB_URL);
    connection = mongoose.connection;

    connection.on("error", console.error.bind(console, "MongoDB connection error: "));
    connection.once("open", async function() {
        console.log("Successfully connected to MongoDB: " + DB_URL);
        await prefillAdmin();
        await prefillSubforums();
        await prefillPineappleThread();
    });
}

export function disconnect() {
    if (connection) {
        connection.close();
    }
}
