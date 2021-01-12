import * as React from "react"
import { useResources } from "../../hooks/userResources"
import { createGame, listGames } from "../../api/game"
import Home from "../Home"

interface IUserEditProps { }

const GameList: React.FC<IUserEditProps> = (props) => {

  const games = useResources(listGames)

  React.useEffect(() => {
    createGame({name: "Kekw"})
  }, [])

  if (!games) return <>
    <Home />
    <h2>Loading...</h2></>

  return (
    <>
      <Home />
      <h2>games</h2>

      <ul>
        {games.map((g) => (
          <li key={[g.name, g.name].join(",")}>
            {g.name} ({g.name})
          </li>
        ))}
      </ul>

    </>
  )
}

export default GameList
