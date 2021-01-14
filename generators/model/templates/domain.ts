import { <%= modelSchemaName %>, <%= capitalizedModelName %>, PaginatedResponse } from "<%= projectName %>-core"
import { getPaginationData, PagesData } from "../util/pagination"
import { findByIdOr404, getRepo, getQueryBuilder } from "../util/query"



export const create<%= capitalizedModelName %> = async (<%= modelName %>: <%= modelSchemaName %>): Promise<<%= capitalizedModelName %>> => {
    const repo = await getRepo(<%= capitalizedModelName %>)

    const entity = repo.create({
        ...<%= modelName %>
    })

    await repo.save(entity)

    return entity
}

export const list<%= pluralizedModelName %> = async (pageParams: PagesData): Promise<PaginatedResponse<<%= capitalizedModelName %>>> => {
    const queryBuilder = await getQueryBuilder(<%= capitalizedModelName %>)

    const entities = await queryBuilder.getMany()
    const totalCount = await queryBuilder.getCount()

    return {
        items: entities,
        paginationData: getPaginationData(totalCount, pageParams)
    }
}

export const get<%= capitalizedModelName %>ById = async (gameId: string): Promise<<%= capitalizedModelName %>> => {
    const repo = await getRepo(<%= capitalizedModelName %>)

    const entity = await findByIdOr404(repo, gameId)

    return entity
}

export const update<%= capitalizedModelName %>ById = async (gameId: string, <%= modelName %>: <%= modelSchemaName %>): Promise<<%= capitalizedModelName %>> => {
    const repo = await getRepo(<%= capitalizedModelName %>)

    const entity = await findByIdOr404(repo, gameId)

    return await repo.save({
        ...entity,
        ...<%= modelName %>
    })
}

export const delete<%= capitalizedModelName %>ById = async (gameId: string): Promise<void> => {
    const repo = await getRepo(<%= capitalizedModelName %>)

    const <%= modelName %> = await findByIdOr404(repo, gameId)

    await repo.remove(<%= modelName %>)
}