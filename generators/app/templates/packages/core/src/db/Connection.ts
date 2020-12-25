require("dotenv-flow").config()
import { Connection, ConnectionManager, ConnectionOptions, createConnection, getConnectionManager } from "typeorm"
import { SnakeNamingStrategy } from "typeorm-naming-strategies/snake-naming.strategy"
import { User } from "../model/User"
import * as pg from "pg"
import { LoggerOptions } from "typeorm/logger/LoggerOptions"

// instrument queries with xray
// if (!process.env.USE_LOCAL_DB) {
//     const AWSXRay = require("aws-xray-sdk")
//     AWSXRay.capturePostgres(pg)
// }

// list of entities from core go here
const ALL_ENTITIES = [User]

const CONNECTION_NAME = "default"

/**
 * Database manager class
 * Taken from https://medium.com/safara-engineering/wiring-up-typeorm-with-serverless-5cc29a18824f
 * This MAY NOT BE THE BEST WAY TO GET/CACHE DB CONNECTIONS!
 */
export class Database {
    private connectionManager: ConnectionManager

    constructor() {
        this.connectionManager = getConnectionManager()
    }

    public async getConnection(): Promise<Connection> {
        let connection: Connection

        if (this.connectionManager.has(CONNECTION_NAME)) {
            connection = await this.connectionManager.get(CONNECTION_NAME)

            if (!connection.isConnected) {
                connection = await connection.connect()
            }
        } else {
            connection = await createConnection(getConnectionOptions())
        }

        return connection
    }
}

export function getConnectionOptions(): ConnectionOptions {
    let connectionOptions: ConnectionOptions
    let logging: LoggerOptions
    if (process.env.SQL_ECHO) {
        logging = ["query", "error"]
    }
    else {
        logging = ["error"]
    }

    if (process.env.USE_LOCAL_DB) {
        console.debug("Using local database...")
        // local DB
        connectionOptions = {
            entities: ALL_ENTITIES,
            type: `postgres`,
            port: 5432,
            database: process.env.DB_NAME,
            host: process.env.DB_HOST,
            namingStrategy: new SnakeNamingStrategy(),
            logging: logging, // log queries
        }
    }
    else if (process.env.USE_TEST_DB) {
        console.debug("Using test database")

        // test DB
        connectionOptions = {
            entities: ALL_ENTITIES,
            type: `postgres`,
            port: 5432,
            database: "<%= title %>_test",
            synchronize: true,
            dropSchema: true,  // dropDB with every connection
            host: "localhost",
            namingStrategy: new SnakeNamingStrategy(),
            logging: true,
        }
    }
    else {
        console.debug("Using remote database...")
        if (!process.env.AURORA_SECRET_ARN || !process.env.AURORA_ARN || !process.env.AURORA_REGION) {
            console.error("AURORA_SECRET_ARN or AURORA_ARN or AURORA_REGION not defined")
            throw new Error("Couldn't get RDS ARNs from environment.")
        }
        // aurora sls
        connectionOptions = {
            entities: ALL_ENTITIES,
            type: "aurora-data-api-pg",
            database: "<%= title %>",
            secretArn: process.env.AURORA_SECRET_ARN,
            resourceArn: process.env.AURORA_ARN,
            region: process.env.AURORA_REGION,
            logging: logging, // log queries
            name: CONNECTION_NAME,
            namingStrategy: new SnakeNamingStrategy(),
        }
    }

    // Don't need a pwd locally
    if (process.env.DB_PASSWORD) {
        Object.assign(connectionOptions, {
            password: process.env.DB_PASSWORD,
        })
    }

    return connectionOptions
}