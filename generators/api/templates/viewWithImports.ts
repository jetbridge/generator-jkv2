import { <%= capitalizedModelName %> } from "<%= projectName %>-core"
import { APIGatewayProxyEventV2 } from "aws-lambda"
import { applyErrorHandlingAndValidation } from "../../util/serialization"


const <%= endpointName %> = async (event:  APIGatewayProxyEventV2): ResultPromise<<%= capitalizedModelName %>> => {}

export const <%= endpointName %>Handler = applyErrorHandlingAndValidation<<%= capitalizedModelName %>>(<%= capitalizedModelName %>, <%= endpointName %>)
