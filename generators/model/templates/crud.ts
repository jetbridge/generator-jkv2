import { <%= capitalizedModelName %>, PaginatedResponse } from "<%= projectName %>-core"
import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from "aws-lambda"
import { db } from "../../db"
import { getPagesData, getPaginationData } from "../../util/pagination"


interface ICreate<%= capitalizedModelName %>Request { }

interface IUpdate<%= capitalizedModelName %>Request { }


export async function create(event: APIGatewayProxyEventV2): Promise<APIGatewayProxyResultV2<<%= capitalizedModelName %>>> {
    if (!event.body) {
        console.warn("No request body provided")
        return {
            statusCode: 400,
        }
    }
    const body: ICreate<%= capitalizedModelName %>Request = JSON.parse(event.body)

    const conn = await db.getConnection()

    const repo = conn.getRepository(<%= capitalizedModelName %>)

    const <%= modelName %> = repo.create({
        ...body
    })

    await repo.save(<%= modelName %>)


    return <%= modelName %>
}

export async function list(event: APIGatewayProxyEventV2): Promise<APIGatewayProxyResultV2<PaginatedResponse<<%= capitalizedModelName %>>>> {
    /**
     * Get a paginated list
     */
    const pagesData = getPagesData(event.queryStringParameters)

    const conn = await db.getConnection()
    const <%= modelName %>s = await conn.getRepository(<%= capitalizedModelName %>).createQueryBuilder("<%= modelName %>").getMany()

    const totalCount = await conn.getRepository(<%= capitalizedModelName %>).createQueryBuilder("<%= modelName %>").getCount()

    return {
        items: <%= modelName %>s,
        paginationData: getPaginationData(totalCount, pagesData),
    }
}

export async function getById(event: APIGatewayProxyEventV2): Promise<APIGatewayProxyResultV2<<%= capitalizedModelName %>>> {
    if (!event.pathParameters || !event.pathParameters["<%= modelName %>Id"]) {
        console.warn("No path parameters found or <%= modelName %>Id not present in them")
        return { statusCode: 400 }
    }

    const <%= modelName %>Id: string = event.pathParameters["<%= modelName %>Id"]

    const conn = await db.getConnection()

    const repo = conn.getRepository(<%= capitalizedModelName %>)

    const <%= modelName %> = await repo.findOneOrFail(<%= modelName %>Id)

    return <%= modelName %>
}


export async function updateById(event: APIGatewayProxyEventV2): Promise<APIGatewayProxyResultV2<<%= capitalizedModelName %>>> {
    if (!event.pathParameters || !event.pathParameters["<%= modelName %>Id"] || !event.body) {
        console.warn("No path parameters found or <%= modelName %>Id not present in them")
        return { statusCode: 400 }
    }

    const <%= modelName %>Id: string = event.pathParameters["<%= modelName %>Id"]

    const body: IUpdate<%= capitalizedModelName %>Request = JSON.parse(event.body)


    const conn = await db.getConnection()

    const repo = conn.getRepository(<%= capitalizedModelName %>)

    const <%= modelName %> = await repo.findOneOrFail(<%= modelName %>Id)

    return await repo.save({
        ...<%= modelName %>,
        ...body
    })
}

export async function deleteById(event: APIGatewayProxyEventV2): Promise<APIGatewayProxyResultV2<void>> {
    if (!event.pathParameters || !event.pathParameters["<%= modelName %>Id"]) {
        console.warn("No path parameters found or <%= modelName %>Id not present in them")
        return { statusCode: 400 }
    }

    const <%= modelName %>Id: string = event.pathParameters["<%= modelName %>Id"]

    const conn = await db.getConnection()

    const repo = conn.getRepository(<%= capitalizedModelName %>)

    const <%= modelName %> = await repo.findOneOrFail(<%= modelName %>Id)

    await repo.remove(<%= modelName %>)
}