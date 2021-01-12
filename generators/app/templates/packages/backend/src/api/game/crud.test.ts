import { db } from "../../db"
import { Connection } from 'typeorm';
import { Game, PaginatedResponse, gameFactory, GameSchemaLite } from '<%= title %>-core'
import { APIGatewayProxyEventV2, APIGatewayProxyEventPathParameters } from 'aws-lambda'
import { listHandler, getByIdHandler, createHandler, updateByIdHandler, deleteByIdHandler } from './crud'


let conn: Connection


beforeEach(async () => {
    conn = await db.getConnection() as unknown as Connection
});

afterEach(async () => {
    await conn.close()
})



describe('Test entity API', () => {
    it(
        'Get a paginated list of entities',
        async () => {
            const repo = conn.getRepository(Game)

            const entity: Game = repo.create({
                name: "TestGame",
            })

            await repo.save(entity)

            const entities: Game[] = (await listHandler({} as APIGatewayProxyEventV2) as PaginatedResponse<Game>).items

            const entityIds: string[] = entities.map(e => e.id)
            expect(entityIds).toContain(entity.id)
        }
    )

    it(
        "Test creating an entity. Also test that the validator for request body works.",
        async () => {
            await createHandler({ body: JSON.stringify({ name: 1234 }) } as unknown as APIGatewayProxyEventV2) as Game

            const repo = conn.getRepository(Game)

            let count: number = await repo.createQueryBuilder("game").getCount()

            expect(count).toEqual(0)

            await createHandler({ body: JSON.stringify(gameFactory.build()) } as unknown as APIGatewayProxyEventV2) as Game

            count = await repo.createQueryBuilder("game").getCount()

            expect(count).toEqual(1)
        }
    )

    it(
        "Test getting entity by id.",
        async () => {
            const repo = conn.getRepository(Game)

            let entityToGet: Game = repo.create(gameFactory.build())

            await repo.save(entityToGet)

            // Save doesn't return id when `create` with relationships is used :(
            entityToGet = await repo.createQueryBuilder("game").getOneOrFail()

            const receivedEntity: Game = await getByIdHandler({ pathParameters: { gameId: entityToGet.id } } as unknown as APIGatewayProxyEventV2) as Game

            expect(receivedEntity.id).toEqual(entityToGet.id)
        }
    )

    it(
        "Test updating entity by id.",
        async () => {
            const repo = conn.getRepository(Game)

            const originalEntity = gameFactory.build()
            const updatedEntity = gameFactory.build()  // May pass your own arguments to "build" here to avoid original Entity and updated ever having same fields

            let entityToUpdate: Game = repo.create(originalEntity)

            await repo.save(entityToUpdate)

            // Save doesn't return id when `create` with relationships is used :(
            entityToUpdate = await repo.createQueryBuilder("game").getOneOrFail()

            expect(entityToUpdate.name).not.toEqual(updatedEntity.name)
            await updateByIdHandler({ pathParameters: { gameId: entityToUpdate.id }, body: JSON.stringify(updatedEntity) } as unknown as APIGatewayProxyEventV2) as Game

            expect((await repo.findOneOrFail(entityToUpdate.id)).name).toEqual(updatedEntity.name)
        }
    )

    it(
        "Test deleting entity by id.",
        async () => {
            const repo = conn.getRepository(Game)

            let entityToDelete: Game = repo.create(gameFactory.build())

            await repo.save(entityToDelete)

            // Save doesn't return id when `create` with relationships is used :(
            entityToDelete = await repo.createQueryBuilder("game").getOneOrFail()

            expect(await repo.createQueryBuilder("game").getCount()).toEqual(1)

            await deleteByIdHandler({ pathParameters: { gameId: entityToDelete.id } } as unknown as APIGatewayProxyEventV2) as Game

            expect(await repo.createQueryBuilder("game").getCount()).toEqual(0)
        }
    )
});