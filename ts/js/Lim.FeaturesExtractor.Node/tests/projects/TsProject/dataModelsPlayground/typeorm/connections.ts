import {Connection, createConnection} from "typeorm";
import {User} from "./entities/user";

const firstConnection: Connection = await createConnection({
    type: "mysql",
    host: "localhost",
    port: 3306,
    username: "test",
    password: "test",
    database: "test",
    entities: [User]
});

const secondConnection: Connection = await createConnection({
    type: "mysql",
    host: "localhost",
    port: 3306,
    username: "test",
    password: "test",
    database: "test2",
    entities: ["entities/*.ts"]
});
