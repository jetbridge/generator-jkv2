import "reflect-metadata"  // When using class-validator decorators don't forget to import this
import { classValidator } from '@lambda-middleware/class-validator'
import { ClassType } from "class-transformer-validator"
import { composeHandler } from "@lambda-middleware/compose"
import { errorHandler } from "@lambda-middleware/http-error-handler"
import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from 'aws-lambda'


export const applyErrorHandlingAndValidation = <T>(validationSchema: ClassType<object>, apiFunction: Function): (event: APIGatewayProxyEventV2) => Promise<APIGatewayProxyResultV2<T>> => {
    /*
        * Adds validation middleware for incoming request bodies and middleware for handling HTTP errors.
        *
        * @param validationSchema - A class that you wanna use for the schema of the incoming request body
        * @param apiFunction - The API view function that you wanna apply the middlewares to
    */

    return composeHandler(
        // @ts-ignore   This ts-ignore here because "errorHandler" wants "APIGatewayProxyEvent" when we're using "APIGatewayProxyEventV2". V2 is better and it works with it just fine
        errorHandler(),
        classValidator({
            bodyType: validationSchema
        }),
        apiFunction)
}
