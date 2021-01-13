import { GameSchemaLite, Game, PaginatedResponse } from "<%= title %>-core"
import { getPaginationData, PagesData } from "../util/pagination"
import { findByIdOr404, getRepo, getQueryBuilder } from "../util/query"



export const createGame = async (game: GameSchemaLite): Promise<Game> => {
    const repo = await getRepo(Game)

    const entity = repo.create({
        ...game
    })

    await repo.save(game)

    return entity
}

export const listGames = async (pageParams: PagesData): Promise<PaginatedResponse<Game>> => {
    const queryBuilder = await getQueryBuilder(Game)

    const games = await queryBuilder.getMany()
    const totalCount = await queryBuilder.getCount()

    return {
        items: games,
        paginationData: getPaginationData(totalCount, pageParams)
    }
}

export const getGameById = async (gameId: string): Promise<Game> => {
    const repo = await getRepo(Game)

    const entity = await findByIdOr404(repo, gameId)

    return entity
}

export const updateGameById = async (gameId: string, game: GameSchemaLite): Promise<Game> => {
    const repo = await getRepo(Game)

    const entity = await findByIdOr404(repo, gameId)

    return await repo.save({
        ...entity,
        ...game
    })
}

export const deleteGameById = async (gameId: string): Promise<void> => {
    const repo = await getRepo(Game)

    const game = await findByIdOr404(repo, gameId)

    await repo.remove(game)
}