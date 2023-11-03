import mongoose from "mongoose"
import { MongoMemoryServer } from "mongodb-memory-server"

/**
 * Helper class for connecting to in-memory mongo server for tests.
 * 
 * Idea:  
 * - https://javascript.plainenglish.io/unit-testing-node-js-mongoose-using-jest-106a39b8393d
 * - https://dev.to/paulasantamaria/testing-node-js-mongoose-with-an-in-memory-database-32np 
 * 
 * Fixes:
 * - https://nodkz.github.io/mongodb-memory-server/docs/guides/migration/migrate7/#no-function-other-than-start-create-ensureinstance-will-be-starting-anything
 * - https://nodkz.github.io/mongodb-memory-server/ 
 */
export default class TestDB {
    private static mongo: MongoMemoryServer | undefined
    private static connected = false;

    static async connect() {
        if (TestDB.connected) {
            throw new Error("MongoSB already connected.")
        }

        // External Server: (Anleitung siehe Blatt 01, Zusatzaufgabe)
        // await mongoose.connect("mongodb://localhost:27017/test");

        // MongoDB-Memory-Server:
        TestDB.mongo = await MongoMemoryServer.create();
        const uri = TestDB.mongo.getUri();
        await mongoose.connect(uri);

        TestDB.connected = true;
    }

    static async close() {
        if (TestDB.connected) {

            await mongoose.connection.close();

            // MongoDB-Memory-Server:
            if (TestDB.mongo) {
                TestDB.mongo.stop();
                TestDB.mongo = undefined;
            }

            TestDB.connected = false;
        }

    }

    static async clear() {
        if (!TestDB.connected) {
            throw new Error("MongoSB not connected.")
        }
        // await mongoose.connection.dropDatabase();
        // no drop in order to not delete indexes:
        const collections = Object.values(mongoose.connection.collections);
        for (const collection of collections) {
            await collection.deleteMany({});
        }
    }
}


