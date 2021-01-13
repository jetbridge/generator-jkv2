import { Entity } from "typeorm"
import { BaseModel } from "./baseModel"

@Entity()
export class <%= capitalizedModelName %> extends BaseModel { }
