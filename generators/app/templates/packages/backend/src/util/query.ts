import { Repository, EntityTarget, Connection, SelectQueryBuilder } from "typeorm"
import createHttpError from "http-errors"
import { db } from "../db"

export const findByIdOr404 = async<T>(repo: Repository<T>, id: string) => {
    try {
        const entity = await repo.findOneOrFail(id)
        return entity
    }
    catch (EntityNotFoundError) {
        throw createHttpError(404, `Couldn't find entity with id: ${id}`)
    }
}

export const getRepo = async <T>(target: EntityTarget<T>): Promise<Repository<T>> => {
    const conn = await db.getConnection()

    return conn.getRepository(target)
}

export const getQueryBuilder = async<T>(target: EntityTarget<T>): Promise<SelectQueryBuilder<T>> => {
    const conn = await db.getConnection()
    const repo = conn.getRepository(target)

    return repo.createQueryBuilder(target.toString().toLowerCase())
}
