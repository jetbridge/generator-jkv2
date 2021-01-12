import { Game, PaginationQuery, PaginatedResponse } from "<%= title %>-core"
import { API } from "aws-amplify"
import queryString from "qs"

interface ICreateGameRequest {
  name: string
}


const apiName = process.env.REACT_APP_USE_APP_WITHOUT_AUTH ? undefined : process.env.REACT_APP_API_NAME // name of the API Gateway API

const myInit = {
  // OPTIONAL
  headers: {}, // OPTIONAL
  response: true,
  queryStringParameters: {
    // OPTIONAL
  },
}

export const listGames = async (pagination?: PaginationQuery): Promise<Game[]> => {
  const path = `/game?${queryString.stringify(pagination)}`

  const result: PaginatedResponse<Game> = (await API.get(apiName, path, myInit)).data

  return result.items
}

export const createGame = async ({ name }: ICreateGameRequest): Promise<Game> => {

  const path = "/game"

  const result: Game = (await API.post(apiName, path, {
    headers: {
      "Content-Type": "application/json",
    },
    body: {
      name: name,
    },
  })).data

  return result
}