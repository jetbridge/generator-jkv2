import { db } from "."




export const runMigrations = async () => {
    console.debug("Getting connection")
    const conn = await db.getConnection()
    console.debug("Got connection")

    console.debug("About to run migrations")
    await conn.runMigrations({ transaction: "none" })
    console.debug("Ran migration")

    await conn.close()

    return "DB migrated."
}
