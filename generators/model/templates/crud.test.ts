import { db } from "../../db"
import { Connection } from 'typeorm'
import faker from 'faker/locale/en_US'
import { <%= capitalizedModelName %>, PaginatedResponse, <%= modelName %>Factory } from '<%= projectName %>-core'
import { APIGatewayProxyEventV2 } from 'aws-lambda'
import { list } from './crud'
import { getById } from './crud'
import { create } from './crud'
import { updateById } from './crud'
import { deleteById } from './crud'


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
            const repo = conn.getRepository(<%= capitalizedModelName %>)

            const entity: <%= capitalizedModelName %> = repo.create(<%= modelName %>Factory.build())

            await repo.save(entity)

            const entities: <%= capitalizedModelName %>[] = (await list({} as APIGatewayProxyEventV2) as PaginatedResponse<<%= capitalizedModelName %>>).items

            const entityIds: string[] = entities.map(e => e.id)
            expect(entityIds).toContain(entity.id)
        }
    )

    it(
        "Test creating an entity.",
        async () => {
            const entity: <%= capitalizedModelName %> = await create({ body: JSON.stringify(<%= modelName %>Factory.build()) } as unknown as APIGatewayProxyEventV2) as <%= capitalizedModelName %>

            const repo = conn.getRepository(<%= capitalizedModelName %>)

            const count: number = await repo.createQueryBuilder("<%= modelName %>").getCount()

            expect(count).toEqual(1)

        }
    )

    it(
        "Test getting entity by id.",
        async () => {
            const repo = conn.getRepository(<%= capitalizedModelName %>)

            let entityToGet: <%= capitalizedModelName %> = repo.create(<%= modelName %>Factory.build())

            await repo.save(entityToGet)

            // Save doesn't return id when `create` with relationships is used :(
            entityToGet = await repo.createQueryBuilder("<%= modelName %>").getOneOrFail()

            const receivedEntity: <%= capitalizedModelName %> = await getById({ pathParameters: { <%= modelName %>Id: entityToGet.id } } as unknown as APIGatewayProxyEventV2) as <%= capitalizedModelName %>

            expect(receivedEntity.id).toEqual(entityToGet.id)
        }
    )

    it(
        "Test updating entity by id.",
        async () => {
            const repo = conn.getRepository(<%= capitalizedModelName %>)

            const originalEntity = <%= modelName %>Factory.build()
            const updatedDate = faker.date.future()

            let entityToUpdate: <%= capitalizedModelName %> = repo.create(originalEntity)

            await repo.save(entityToUpdate)

            // Save doesn't return id when `create` with relationships is used :(
            entityToUpdate = await repo.createQueryBuilder("<%= modelName %>").getOneOrFail()

            expect(entityToUpdate.createdAt).not.toEqual(updatedDate)
            await updateById({ pathParameters: { <%= modelName %>Id: entityToUpdate.id }, body: JSON.stringify({createdAt: updatedDate}) } as unknown as APIGatewayProxyEventV2) as <%= capitalizedModelName %>

            expect((await repo.findOneOrFail(entityToUpdate.id)).createdAt).toEqual(updatedDate)
        }
    )

    it(
        "Test deleting entity by id.",
        async () => {
            const repo = conn.getRepository(<%= capitalizedModelName %>)

            let entityToDelete: <%= capitalizedModelName %> = repo.create(<%= modelName %>Factory.build())

            await repo.save(entityToDelete)

            // Save doesn't return id when `create` with relationships is used :(
            entityToDelete = await repo.createQueryBuilder("<%= modelName %>").getOneOrFail()

            expect(await repo.createQueryBuilder("<%= modelName %>").getCount()).toEqual(1)

            await deleteById({ pathParameters: { <%= modelName %>Id: entityToDelete.id } } as unknown as APIGatewayProxyEventV2) as <%= capitalizedModelName %>

            expect(await repo.createQueryBuilder("<%= modelName %>").getCount()).toEqual(0)
        }
    )
});