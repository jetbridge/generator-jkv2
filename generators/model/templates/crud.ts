import { <%= modelSchemaName %>, <%= capitalizedModelName %> } from "<%= projectName %>-core"
import { applyErrorHandlingAndValidation } from "../../util/serialization";
import { getById, create, updateById, deleteById, list } from "../../domain/<%= modelName %>";


export const createHandler = applyErrorHandlingAndValidation <<%= capitalizedModelName %>> (<%= modelSchemaName %>, create)

export const listHandler = applyErrorHandlingAndValidation <<%= capitalizedModelName %> [] > (<%= capitalizedModelName %>, list)

export const getByIdHandler = applyErrorHandlingAndValidation <<%= capitalizedModelName %>> (<%= capitalizedModelName %>, getById)

export const updateByIdHandler = updateById  // Apply validation to update once you have defined a request schema for it

export const deleteByIdHandler = applyErrorHandlingAndValidation <<%= capitalizedModelName %>> (<%= modelSchemaName %>, deleteById)
