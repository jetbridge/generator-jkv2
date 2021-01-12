import { GameSchemaLite, Game, PaginatedResponse } from "<%= title %>-core"
import { APIGatewayProxyResultV2, APIGatewayProxyEventV2, APIGatewayProxyEventPathParameters } from "aws-lambda"
import { db } from "../db"
import { getPagesData, getPaginationData } from "../util/pagination"
import createHttpError from "http-errors"
import { findByIdOr404 } from "../util/query"


export const create = async (event: { body: GameSchemaLite }): Promise<APIGatewayProxyResultV2<Game>> => {

    const name = event.body.name

    const conn = await db.getConnection()

    const repo = conn.getRepository(Game)

    const game = repo.create({
        name: name,
    })

    await repo.save(game)


    return game
}

export const list = async (event: APIGatewayProxyEventV2): Promise<APIGatewayProxyResultV2<PaginatedResponse<Game>>> => {
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


export const getById = async (event: { pathParameters: APIGatewayProxyEventPathParameters }): Promise<APIGatewayProxyResultV2<Game>> => {
    if (!event.pathParameters || !event.pathParameters["gameId"])
        throw createHttpError(404, "No path parameters found or gameId not present in them")

    const gameId: string = event.pathParameters["gameId"]

    const conn = await db.getConnection()

    const repo = conn.getRepository(Game)

    const game = await findByIdOr404(repo, gameId)

    return game
}

export const updateById = async (event: { body: GameSchemaLite, pathParameters: APIGatewayProxyEventPathParameters }): Promise<APIGatewayProxyResultV2<Game>> => {
    if (!event.pathParameters || !event.pathParameters["gameId"])
        throw createHttpError(404, "No path parameters found or gameId not present in them")

    const gameId = event.pathParameters["gameId"]

    const conn = await db.getConnection()

    const repo = conn.getRepository(Game)

    const game = await findByIdOr404(repo, gameId)

    return await repo.save({
        ...game,
        ...event.body
    })
}

export const deleteById = async (event: { pathParameters: APIGatewayProxyEventPathParameters }): Promise<APIGatewayProxyResultV2<void>> => {
    if (!event.pathParameters || !event.pathParameters["gameId"])
        throw createHttpError(404, "No path parameters found or gameId not present in them")

    const gameId = event.pathParameters["gameId"]

    const conn = await db.getConnection()

    const repo = conn.getRepository(Game)

    const game = await findByIdOr404(repo, gameId)

    await repo.remove(game)
}
