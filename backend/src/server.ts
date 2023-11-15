import * as database from "./database/database";
import http from "http";

export function start(app: any, port: number) {
    database.connect();
    http.createServer(app).listen(port, () => {
        console.log(`Listening for HTTP at http://localhost:${port}`);
    });
}
