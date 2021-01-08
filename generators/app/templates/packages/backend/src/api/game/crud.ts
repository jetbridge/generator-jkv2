import { Game, PaginatedResponse } from "<%= title %>-core"
import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from "aws-lambda"
import { db } from "../../db"
import { getPagesData, getPaginationData } from "../../util/pagination"


interface ICreateGameRequest {
    name: string
}

interface IUpdateGameRequest {
    name: string
}


export async function create(event: APIGatewayProxyEventV2): Promise<APIGatewayProxyResultV2<Game>> {
    if (!event.body) {
        console.warn("No request body provided")
        return {
            statusCode: 400,
        }
    }
    const body: ICreateGameRequest = JSON.parse(event.body)

    const name = body.name

    const conn = await db.getConnection()

    const repo = conn.getRepository(Game)

    const game = repo.create({
        name: name,
    })

    await repo.save(game)


    return game
}

export async function list(event: APIGatewayProxyEventV2): Promise<APIGatewayProxyResultV2<PaginatedResponse<Game>>> {
    /**
     * Get a paginated list
     */
    const pagesData = getPagesData(event.queryStringParameters)

    const conn = await db.getConnection()
    const games = await conn.getRepository(Game).createQueryBuilder("game").getMany()

    const totalCount = await conn.getRepository(Game).createQueryBuilder("game").getCount()

    return {
        items: games,
        paginationData: getPaginationData(totalCount, pagesData),
    }
}

export async function getById(event: APIGatewayProxyEventV2): Promise<APIGatewayProxyResultV2<Game>> {
    if (!event.pathParameters || !event.pathParameters["gameId"]) {
        console.warn("No path parameters found or gameId not present in them")
        return { statusCode: 400 }
    }

    const gameId: string = event.pathParameters["gameId"]

    const conn = await db.getConnection()

    const repo = conn.getRepository(Game)

    const game = await repo.findOneOrFail(gameId)

    return game
}


export async function updateById(event: APIGatewayProxyEventV2): Promise<APIGatewayProxyResultV2<Game>> {
    if (!event.pathParameters || !event.pathParameters["gameId"] || !event.body) {
        console.warn("No path parameters found or gameId not present in them")
        return { statusCode: 400 }
    }

    const gameId: string = event.pathParameters["gameId"]

    const body: IUpdateGameRequest = JSON.parse(event.body)


    const conn = await db.getConnection()

    const repo = conn.getRepository(Game)

    const game = await repo.findOneOrFail(gameId)

    return await repo.save({
        ...game,
        ...body
    })
}

export async function deleteById(event: APIGatewayProxyEventV2): Promise<APIGatewayProxyResultV2<void>> {
    if (!event.pathParameters || !event.pathParameters["gameId"]) {
        console.warn("No path parameters found or gameId not present in them")
        return { statusCode: 400 }
    }

    const gameId: string = event.pathParameters["gameId"]

    const conn = await db.getConnection()

    const repo = conn.getRepository(Game)

    const game = await repo.findOneOrFail(gameId)

    await repo.remove(game)
}