import { db } from "."
import { gameFactory, Game } from "<%= title %>-core"
import { config } from "../config"


export const runSeed = async () => {
    const conn = await db.getConnection()

    const repo = conn.getRepository(Game)

    const games = gameFactory.buildList(3)

    await repo.save(games)

    await conn.close()

    console.debug("DB seeded.")
    return "DB seeded."
}

if (config.get('db').useLocal) {
    // For running seed locally with ts-node
    (async () => {
        await runSeed()
    }
    )()
}