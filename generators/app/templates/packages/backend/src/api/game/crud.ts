import { Game } from "<%= title %>-core"
import { GameSchemaLite } from "<%= title %>-core"
import { getPageParams } from "../../util/pagination"
import createHttpError from "http-errors"
import { ResultPromise, PaginatedResultPromise } from "../../util/types"
import { applyErrorHandlingAndValidation } from "../../util/serialization"
import { APIGatewayProxyEventV2, APIGatewayProxyEventPathParameters } from "aws-lambda"
import { listGames, createGame, getGameById, updateGameById, deleteGameById } from "../../domain/game"


const create = async (event: { body: GameSchemaLite }): ResultPromise<Game> =>
    await createGame(event.body)

const list = async (event: APIGatewayProxyEventV2): PaginatedResultPromise<Game> => {
    const pageParams = getPageParams(event.queryStringParameters)
    return await listGames(pageParams)
}

const getById = async (event: { pathParameters: APIGatewayProxyEventPathParameters }): ResultPromise<Game> => {
    if (!event.pathParameters || !event.pathParameters["gameId"])
        throw createHttpError(404, "No path parameters found or gameId not present in them")

    return await getGameById(event.pathParameters["gameId"])
}

const updateById = async (event: { body: GameSchemaLite, pathParameters: APIGatewayProxyEventPathParameters }): ResultPromise<Game> => {
    if (!event.pathParameters || !event.pathParameters["gameId"])
        throw createHttpError(404, "No path parameters found or gameId not present in them")

    const gameId = event.pathParameters["gameId"]
    return await updateGameById(gameId, event.body)
}

const deleteById = async (event: { pathParameters: APIGatewayProxyEventPathParameters }): ResultPromise<void> => {
    if (!event.pathParameters || !event.pathParameters["gameId"])
        throw createHttpError(404, "No path parameters found or gameId not present in them")

    const gameId = event.pathParameters["gameId"]
    await deleteGameById(gameId)
}

export const createHandler = applyErrorHandlingAndValidation<Game>(GameSchemaLite, create)
export const listHandler = applyErrorHandlingAndValidation<Game[]>(Game, list)
export const getByIdHandler = applyErrorHandlingAndValidation<Game>(Game, getById)
export const updateByIdHandler = applyErrorHandlingAndValidation<Game>(GameSchemaLite, updateById)
export const deleteByIdHandler = applyErrorHandlingAndValidation<Game>(Game, deleteById)
