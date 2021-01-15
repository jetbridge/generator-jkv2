import { gameFactory, Game } from "<%= title %>-core"
import { config } from "../config"
import * as AWS from 'aws-sdk'
import { getRepo } from "../util/query";


const lambda = new AWS.Lambda();


export const runSeed = async () => {
    const repo = await getRepo(Game)

    const games = gameFactory.buildList(3)

    await repo.save(games)

    console.debug("DB seeded.")
    return "DB seeded."
}

export const dispatchMultipleSeeds = async () => {
    /**
     * Allows to seed a large remote database.
     * 
     * Works via numerous async invocations of "runSeed" Lambda.
     */

    for (let i = 0; i < 5; i++) {
        lambda.invoke({
            FunctionName: `${config.get('lambda').functionPrefix}testLambda`,
            InvocationType: 'Event',
            Payload: JSON.stringify({}, null, 2)
        }, function (err, data) { })
    }

}

if (config.get('db').useLocal) {
    // For running seed locally with ts-node
    (async () => {
        await runSeed()
    }
    )()
}