import { User } from "../endpoints/user/UserModel";
import mongoose, { Connection } from "mongoose";

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

        await User.findOne({ admin: true }).then(async (user: any) => {
            if (user) { 
                return;
            }

            await User.create({
                email: "admin@husky.de",
                name: "Husky Admin",
                password: "123",
                admin: true
            });
            console.log("Successfully created default admin");
        });
    });
}

export function disconnect() {
    if (connection) {
        connection.close();
    }
}
