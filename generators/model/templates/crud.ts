import { <%= capitalizedModelName %>, <%= modelSchemaName %> } from "<%= projectName %>-core"
import { getPageParams } from "../../util/pagination"
import createHttpError from "http-errors"
import { ResultPromise, PaginatedResultPromise } from "../../util/types"
import { applyErrorHandlingAndValidation } from "../../util/serialization"
import { APIGatewayProxyEventV2, APIGatewayProxyEventPathParameters } from "aws-lambda"
import { list<%= capitalizedModelName %>s, create<%= capitalizedModelName %>, get<%= capitalizedModelName %>ById, update<%= capitalizedModelName %>ById, delete<%= capitalizedModelName %>ById } from "../../domain/<%= modelName %>"


const create = async (event: { body: <%= modelSchemaName %> }): ResultPromise<<%= capitalizedModelName %>> =>
    await create<%= capitalizedModelName %>(event.body)

const list = async (event: APIGatewayProxyEventV2): PaginatedResultPromise<<%= capitalizedModelName %>> => {
    const pageParams = getPageParams(event.queryStringParameters)
    return await list<%= capitalizedModelName %>s(pageParams)
}

const getById = async (event: { pathParameters: APIGatewayProxyEventPathParameters }): ResultPromise<<%= capitalizedModelName %>> => {
    if (!event.pathParameters || !event.pathParameters["<%= modelIdName %>"])
        throw createHttpError(404, "No path parameters found or <%= modelIdName %> not present in them")

    return await get<%= capitalizedModelName %>ById(event.pathParameters["<%= modelIdName %>"])
}

const updateById = async (event: { body: <%= modelSchemaName %>, pathParameters: APIGatewayProxyEventPathParameters }): ResultPromise<<%= capitalizedModelName %>> => {
    if (!event.pathParameters || !event.pathParameters["<%= modelIdName %>"])
        throw createHttpError(404, "No path parameters found or <%= modelIdName %> not present in them")

    const <%= modelIdName %> = event.pathParameters["<%= modelIdName %>"]
    return await update<%= capitalizedModelName %>ById(<%= modelIdName %>, event.body)
}

const deleteById = async (event: { pathParameters: APIGatewayProxyEventPathParameters }): ResultPromise<void> => {
    if (!event.pathParameters || !event.pathParameters["<%= modelIdName %>"])
        throw createHttpError(404, "No path parameters found or <%= modelIdName %> not present in them")

    const <%= modelIdName %> = event.pathParameters["<%= modelIdName %>"]
    await delete<%= capitalizedModelName %>ById(<%= modelIdName %>)
}

export const createHandler = applyErrorHandlingAndValidation<<%= capitalizedModelName %>>(<%= modelSchemaName %>, create)
export const listHandler = applyErrorHandlingAndValidation<<%= capitalizedModelName %>[]>(<%= capitalizedModelName %>, list)
export const getByIdHandler = applyErrorHandlingAndValidation<<%= capitalizedModelName %>>(<%= capitalizedModelName %>, getById)
export const updateByIdHandler = updateById  // Add validation once there's a clearly defined schema
export const deleteByIdHandler = applyErrorHandlingAndValidation<<%= capitalizedModelName %>>(<%= capitalizedModelName %>, deleteById)
