type PaginatedResultPromise<T> = Promise<import("aws-lambda").APIGatewayProxyResultV2<import("<%= title %>-core").PaginatedResponse<T>>>
type ResultPromise<T> = Promise<import("aws-lambda").APIGatewayProxyResultV2<T>>
