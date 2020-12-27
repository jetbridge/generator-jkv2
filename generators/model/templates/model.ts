import { Entity } from "typeorm"
import { BaseModel } from "./BaseModel"

@Entity()
export class <%= modelName %> extends BaseModel { }
