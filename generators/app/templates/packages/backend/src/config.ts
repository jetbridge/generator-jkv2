require("dotenv-flow").config()
import convict from 'convict'


export const config = convict({
    env: {
        doc: 'The application environment.',
        format: ['production', 'development', 'test', 'local'],
        default: 'local',
        env: 'NODE_ENV'
    },
    db: {
        useLocal: {
            doc: 'Whether the database for local dev should be used.',
            format: Boolean,
            default: true,
            env: "USE_LOCAL_DB"
        },
        useTest: {
            doc: 'Whether the database for testing should be used. If "true", useLocal should be false',
            format: Boolean,
            default: false,
            env: "USE_TEST_DB"
        },
        sqlEcho: {
            doc: "Whether SQL queries should be logged.",
            format: Boolean,
            default: false,
            env: "SQL_ECHO"
        },
        auroraRegion: {
            doc: "The region of the RDS database.",
            format: String,
            default: "",
            env: "AURORA_REGION"
        },
        auroraSecretArn: {
            doc: "The ARN of Secrets Manager store containing RDS credentials for connecting. Used for both VPC and aurora-data-api.",
            format: String,
            default: "",
            env: "AURORA_SECRET_ARN"
        },
        auroraArn: {
            doc: "The ARN of the RDS database. Used only when connecting via aurora-data-api",
            format: String,
            default: "",
            env: "AURORA_ARN"
        },
        enableXRay: {
            doc: "AWS XRay for instrumenting DB queries and providing logs.",
            format: Boolean,
            default: false,
            env: "ENABLE_XRAY"
        },
        dbPassword: {
            doc: "The database password. May get used for local dev only.",
            format: String,
            default: "",
            env: "DB_PASSWORD"
        }
    },
    stage: {
        doc: "The stage the app is deployed to.",
        format: ['dev', 'prod', 'dev3'],
        default: "dev",
        env: "STAGE"
    },
    lambda: {
        functionPrefix: {
            doc: "Prefix of Lambda functions. Used when invoking a Lambda from another Lambda.",
            format: String,
            default: "",
            env: "FUNCTION_PREFIX"
        }
    }
})

config.validate({ allowed: 'strict' })
