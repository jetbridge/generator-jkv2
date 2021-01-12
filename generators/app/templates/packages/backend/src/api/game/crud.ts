import { Game, PaginatedResponse } from "<%= title %>-core"
import { GameSchemaLite } from "<%= title %>-core"
import { applyErrorHandlingAndValidation } from "../../util/serialization";
import { getById, create, updateById, deleteById, list } from "../../domain/game";


export const createHandler = applyErrorHandlingAndValidation<Game>(GameSchemaLite, create)

export const listHandler = applyErrorHandlingAndValidation<Game[]>(Game, list)

export const getByIdHandler = applyErrorHandlingAndValidation<Game>(Game, getById)

export const updateByIdHandler = applyErrorHandlingAndValidation<Game>(GameSchemaLite, updateById)

export const deleteByIdHandler = applyErrorHandlingAndValidation<Game>(Game, deleteById)
