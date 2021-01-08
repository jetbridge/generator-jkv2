import { Entity } from "typeorm"
import { BaseModel } from "./baseModel"

@Entity()
export class <%= modelName %> extends BaseModel { }
