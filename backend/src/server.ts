import * as database from "./database/database";
import https from "https";
import http from "http";
import { readFileSync } from "fs";
import swaggerDocs from "./util/swagger";

export function start(app: any, port: number, useHttps: boolean, callback: () => void) {
    database.connect();
    if (useHttps) {
        const server = https.createServer(
            {
                key: readFileSync("./certificates/private.key"),
                cert: readFileSync("./certificates/public.crt")
            },
            app
        ).listen(port, () => {
            console.log(`Listening for HTTPS at https://127.0.0.1:${port}`);
            callback();
            swaggerDocs(app, port);
        });
        return server;
    }
    const server = http.createServer(app).listen(port, () => {
        console.log(`Listening for HTTP at http://127.0.0.1:${port}`);
        callback();
        swaggerDocs(app, port);
    });
    return server;
}
