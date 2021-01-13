type PaginatedResultPromise<T> = Promise<import("aws-lambda").APIGatewayProxyResultV2<import("demo-core").PaginatedResponse<T>>>
type ResultPromise<T> = Promise<import("aws-lambda").APIGatewayProxyResultV2<T>>
