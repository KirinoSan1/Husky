import { IUser, User } from "../endpoints/user/UserModel";

const mgoose = require("mongoose");

const connectionString: string = "mongodb://127.0.0.1/Husky";
const connectionOptions: {
    useNewUrlParser: boolean,
    useUnifiedTopology: boolean
} = {
    "useNewUrlParser": true,
    "useUnifiedTopology": true
};

let databaseConnection: any;

export function connect() {
    if (databaseConnection) {
        throw new Error("Database connection has already been established");
    }

    mgoose.connect(connectionString, connectionOptions);
    databaseConnection = mgoose.connection;
    databaseConnection.on("error", console.error.bind(console, "MongoDB connection error: "));

    databaseConnection.once("open", async function() {
        console.log("Successfully connected to MongoDB: " + connectionString);
        await User.findOne({ admin: true }).then(async (user: any) => {
            if (user) { 
                return;
            }
            await User.create({
                email:"admin@husky.de", name: "Husky Admin", password: "123", admin: true
            })
        });
    });
}

export function disconnect() {
    if (databaseConnection) {
        databaseConnection.close();
    }
}