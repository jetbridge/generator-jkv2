import { db } from "../../db"
import { Connection } from 'typeorm'
import faker from 'faker/locale/en_US'
import { <%= capitalizedModelName %>, PaginatedResponse, <%= modelFactoryName %>, <%= modelSchemaName %> } from '<%= projectName %>-core'
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
            const repo = conn.getRepository(<%= capitalizedModelName %>)

            const entity: <%= capitalizedModelName %> = repo.create(<%= modelFactoryName %>.build())

            await repo.save(entity)

            const entities: <%= capitalizedModelName %>[] = (await listHandler({} as APIGatewayProxyEventV2) as PaginatedResponse<<%= capitalizedModelName %>>).items

            const entityIds: string[] = entities.map(e => e.id)
            expect(entityIds).toContain(entity.id)
        }
    )

    it(
        "Test creating an entity.",
        async () => {
            const entity: <%= capitalizedModelName %> = await createHandler({ body: JSON.stringify(<%= modelFactoryName %>.build()) } as unknown as APIGatewayProxyEventV2) as <%= capitalizedModelName %>

            const repo = conn.getRepository(<%= capitalizedModelName %>)

            const count: number = await repo.createQueryBuilder("<%= modelName %>").getCount()

            expect(count).toEqual(1)

        }
    )

    it(
        "Test getting entity by id.",
        async () => {
            const repo = conn.getRepository(<%= capitalizedModelName %>)

            let entityToGet: <%= capitalizedModelName %> = repo.create(<%= modelFactoryName %>.build())

            await repo.save(entityToGet)

            // Save doesn't return id when `create` with relationships is used :(
            entityToGet = await repo.createQueryBuilder("<%= modelName %>").getOneOrFail()

            const receivedEntity: <%= capitalizedModelName %> = await getByIdHandler({ pathParameters: { <%= modelName %>Id: entityToGet.id } } as unknown as APIGatewayProxyEventV2) as <%= capitalizedModelName %>

            expect(receivedEntity.id).toEqual(entityToGet.id)
        }
    )

    it(
        "Test updating entity by id.",
        async () => {
            const repo = conn.getRepository(<%= capitalizedModelName %>)

            const originalEntity = <%= modelFactoryName %>.build()
            const updatedEntity = <%= modelFactoryName %>.build()
            updatedEntity.createdAt = faker.date.future()
            
            let entityToUpdate: <%= capitalizedModelName %> = repo.create(originalEntity)

            await repo.save(entityToUpdate)

            // Save doesn't return id when `create` with relationships is used :(
            entityToUpdate = await repo.createQueryBuilder("<%= modelName %>").getOneOrFail()

            await updateByIdHandler({ pathParameters: { <%= modelName %>Id: entityToUpdate.id }, body: updatedEntity } as unknown as { body: <%= capitalizedModelName %>, pathParameters: APIGatewayProxyEventPathParameters }) as <%= capitalizedModelName %>

            expect((await repo.findOneOrFail(entityToUpdate.id)).createdAt).toEqual(updatedEntity.createdAt)
        }
    )

    it(
        "Test deleting entity by id.",
        async () => {
            const repo = conn.getRepository(<%= capitalizedModelName %>)

            let entityToDelete: <%= capitalizedModelName %> = repo.create(<%= modelFactoryName %>.build())

            await repo.save(entityToDelete)

            // Save doesn't return id when `create` with relationships is used :(
            entityToDelete = await repo.createQueryBuilder("<%= modelName %>").getOneOrFail()

            expect(await repo.createQueryBuilder("<%= modelName %>").getCount()).toEqual(1)

            await deleteByIdHandler({ pathParameters: { <%= modelName %>Id: entityToDelete.id } } as unknown as APIGatewayProxyEventV2) as <%= capitalizedModelName %>

            expect(await repo.createQueryBuilder("<%= modelName %>").getCount()).toEqual(0)
        }
    )
});