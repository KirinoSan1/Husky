import mongoose, { Connection } from "mongoose";
import { prefillAdmin, prefillPineappleThread, prefillSubforums } from "./prefill";

const connectionString: string = "mongodb://127.0.0.1/Husky";

let connection: Connection;

export function connect() {
    if (connection) {
        throw new Error("Database connection has already been established");
    }

    mongoose.connect(connectionString);
    connection = mongoose.connection;

    connection.on("error", console.error.bind(console, "MongoDB connection error: "));
    connection.once("open", async function() {
        console.log("Successfully connected to MongoDB: " + connectionString);
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
