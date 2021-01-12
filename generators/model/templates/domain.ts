import { <%= modelSchemaName %>, <%= capitalizedModelName %>, PaginatedResponse } from "<%= projectName %>-core"
import { APIGatewayProxyResultV2, APIGatewayProxyEventV2, APIGatewayProxyEventPathParameters } from "aws-lambda"
import { db } from "../db"
import { getPagesData, getPaginationData } from "../util/pagination"
import createHttpError from "http-errors"
import { findByIdOr404 } from "../util/query"


export const create = async (event: { body: <%= modelSchemaName %> }): Promise < APIGatewayProxyResultV2 <<%= capitalizedModelName %>>> => {

    const conn = await db.getConnection()

    const repo = conn.getRepository(<%= capitalizedModelName %>)

    const entity = repo.create({
        ...event.body
    })

    await repo.save(entity)


    return entity
}

export const list = async (event: APIGatewayProxyEventV2): Promise<APIGatewayProxyResultV2<PaginatedResponse<<%= capitalizedModelName %>>>> => {
    /**
     * Get a paginated list
     */
    const pagesData = getPagesData(event.queryStringParameters)
    const conn = await db.getConnection()
    const entities: <%= capitalizedModelName %>[] = await conn.getRepository(<%= capitalizedModelName %>).createQueryBuilder("<%= modelName %>").getMany()

    const totalCount = await conn.getRepository(<%= capitalizedModelName %>).createQueryBuilder("<%= modelName %>").getCount()

    return {
        items: entities,
        paginationData: getPaginationData(totalCount, pagesData),
    }
}


export const getById = async (event: { pathParameters: APIGatewayProxyEventPathParameters }): Promise<APIGatewayProxyResultV2<<%= capitalizedModelName %>>> => {
    if (!event.pathParameters || !event.pathParameters["<%= modelIdName %>"])
        throw createHttpError(404, "No path parameters found or <%= modelIdName %> not present in them")

    const entityId: string = event.pathParameters["<%= modelIdName %>"]

    const conn = await db.getConnection()

    const repo = conn.getRepository(<%= capitalizedModelName %>)

    const entity = await findByIdOr404(repo, entityId)

    return entity
}

export const updateById = async (event: { body: <%= capitalizedModelName %>, pathParameters: APIGatewayProxyEventPathParameters }): Promise<APIGatewayProxyResultV2<<%= capitalizedModelName %>>> => {
    if (!event.pathParameters || !event.pathParameters["<%= modelIdName %>"])
        throw createHttpError(404, "No path parameters found or <%= modelIdName %> not present in them")

    const entityId = event.pathParameters["<%= modelIdName %>"]

    const conn = await db.getConnection()

    const repo = conn.getRepository(<%= capitalizedModelName %>)

    const entity = await findByIdOr404(repo, entityId)

    return await repo.save({
        ...entity,
        ...event.body
    })
}

export const deleteById = async (event: { pathParameters: APIGatewayProxyEventPathParameters }): Promise<APIGatewayProxyResultV2<void>> => {
    if (!event.pathParameters || !event.pathParameters["<%= modelIdName %>"])
        throw createHttpError(404, "No path parameters found or <%= modelIdName %> not present in them")

    const entityId = event.pathParameters["<%= modelIdName %>"]

    const conn = await db.getConnection()

    const repo = conn.getRepository(<%= capitalizedModelName %>)

    const entity = await findByIdOr404(repo, entityId)

    await repo.remove(entity)
}
