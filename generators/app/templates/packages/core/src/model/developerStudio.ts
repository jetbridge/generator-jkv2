import { Column, OneToMany, Entity } from "typeorm"
import { BaseModel } from "./baseModel"
import { Game } from "./game"

@Entity()
export class DeveloperStudio extends BaseModel {
    @Column({ nullable: true })
    name: string

    @OneToMany(() => Game, (game) => game.developerStudio)
    games: Game[]
}
