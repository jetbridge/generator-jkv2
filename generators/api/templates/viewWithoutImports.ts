
const <%= endpointName %> = async (event:  APIGatewayProxyEventV2): ResultPromise<<%= capitalizedModelName %>> => {}

export const <%= endpointName %>Handler = applyErrorHandlingAndValidation<<%= capitalizedModelName %>>(<%= capitalizedModelName %>, <%= endpointName %>)
