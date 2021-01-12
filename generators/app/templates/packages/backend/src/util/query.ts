import { Repository } from "typeorm"
import createHttpError from "http-errors"
import { EntityNotFoundError } from 'typeorm/error/EntityNotFoundError'

export const findByIdOr404 = async<T>(repo: Repository<T>, id: string) => {
    try{
        const entity = await repo.findOneOrFail(id)
        return entity
    }
    catch(EntityNotFoundError){
        throw createHttpError(404, `Couldn't find entity with id: ${id}`)
    }
}