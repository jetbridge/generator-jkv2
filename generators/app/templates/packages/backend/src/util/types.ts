import { APIGatewayProxyResultV2 } from "aws-lambda"
import { PaginatedResponse } from "<%= title %>-core"


export type PaginatedResultPromise<T> = Promise<APIGatewayProxyResultV2<PaginatedResponse<T>>>
export type ResultPromise<T> = Promise<APIGatewayProxyResultV2<T>>
