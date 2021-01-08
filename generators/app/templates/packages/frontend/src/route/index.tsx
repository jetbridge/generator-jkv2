import * as React from "react"
import { Route, Switch } from "react-router-dom"
import GameList from "../component/game/gameList"

interface IRoutesProps { }

const Routes = (props: IRoutesProps) => {
  return (
    <Switch>
      <Route exact path="/" component={GameList} />
    </Switch>
  )
}

export default Routes
