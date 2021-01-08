import { config } from '../config'
import { Connection, ConnectionManager, ConnectionOptions, createConnection, getConnectionManager } from "typeorm"
import { SnakeNamingStrategy } from "typeorm-naming-strategies/snake-naming.strategy"
import { LoggerOptions } from "typeorm/logger/LoggerOptions"
import * as pg from "pg"
import { Game, Genre, DeveloperStudio } from "<%= title %>-core"
import * as AWS from "aws-sdk"

// instrument queries with xray
if (config.get('db').enableXRay) {
    const AWSXRay = require("aws-xray-sdk")
    AWSXRay.capturePostgres(pg)
}

// list of entities from core go here
const ALL_ENTITIES = [Game, DeveloperStudio, Genre]

interface IDBSecret {
    password?: string
    dbname?: string
    engine?: string
    port?: string
    host?: string
    username?: string
}


const dbSecretToUrl = (secret: IDBSecret) => {
    /* Given a database secret construct a connection URL. */
    const password = secret.password
    const dbname = secret.dbname
    const engine = secret.engine
    const port = secret.port
    const host = secret.host
    const username = secret.username

    return `${engine}://${username}:${password}@${host}:${port}/${dbname}`
}

const getRDSSecret = async (): Promise<IDBSecret> => {
    if (!config.get('db').auroraSecretArn || !config.get('db').auroraRegion) return {}

    console.debug("Before getting secret")
    const mgr = new AWS.SecretsManager({ region: config.get('db').auroraRegion })
    const secret = await mgr.getSecretValue({ SecretId: config.get('db').auroraSecretArn }).promise()

    console.debug(`Got the secret ${secret}`)
    return await JSON.parse(secret.SecretString || "{}")
}

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
            connection = await createConnection(await getConnectionOptions())
        }

        return connection
    }
}

export async function getConnectionOptions(): Promise<ConnectionOptions> {
    let connectionOptions: ConnectionOptions
    let logging: LoggerOptions
    if (config.get('db').sqlEcho) {
        logging = ["query", "error"]
    }
    else {
        logging = ["error"]
    }

    if (config.get('db').useLocal) {
        console.debug("Using local database...")
        // local DB
        connectionOptions = {
            entities: ALL_ENTITIES,
            type: `postgres`,
            port: 5432,
            database: "<%= title %>",
            host: "localhost",
            namingStrategy: new SnakeNamingStrategy(),
            logging: logging, // log queries
        }
    }
    else if (config.get('db').useTest) {
        console.debug("Using test database...")

        connectionOptions = {
            entities: ALL_ENTITIES,
            type: `postgres`,
            port: 5432,
            database: "<%= title %>_test",
            synchronize: true,
            dropSchema: true,  // dropDB with every connection
            host: "localhost",
            namingStrategy: new SnakeNamingStrategy(),
            logging: logging,
        }
    }
    else {
        console.debug("Using remote database...")
        if (!config.get('db').auroraSecretArn || !config.get('db').auroraRegion) {
            console.error("AURORA_SECRET_ARN or AURORA_ARN or AURORA_REGION not defined")
            throw new Error("Couldn't get RDS ARNs from environment.")
        }

        const secret = await getRDSSecret()

        const databaseURL = dbSecretToUrl(secret)

        connectionOptions = {
            entities: ALL_ENTITIES,
            type: "postgres",
            url: databaseURL,
            migrations: ["./_optimize/build/src/db/migrations/*.js"],
            logging: logging, // log queries
            name: CONNECTION_NAME,
            namingStrategy: new SnakeNamingStrategy(),
        }
    }

    if (config.get('db').dbPassword) {
        Object.assign(connectionOptions, {
            password: config.get('db').dbPassword,
        })
    }

    return connectionOptions
}
