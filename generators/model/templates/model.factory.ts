import { Factory } from "fishery"
import faker from 'faker/locale/en_US'
import { <%= capitalizedModelName %> } from "../model/<%= modelName %>"


export const <%= modelName %>Factory: Factory<<%= capitalizedModelName %>> = Factory.define<any>(() => ({
}))
