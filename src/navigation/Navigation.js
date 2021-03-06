import React from "react"
import { Switch, Route, BrowserRouter } from "react-router-dom"
import { LoginPage, PrivateMessages } from "../pages"
import { Profile } from "../pages/profile-page/Profile"
import { UserProvider } from '../firebase/UserProvider'
import { NavBar } from "../components"
import SuperChat from "../pages/superChat/SuperChat"

import { NameChange } from "../components/EditProfile/editName"
import { GameRoute } from "./game-route"
import { LeaderBoard } from "../pages/leaderboard/Leaderboard"
import { NotFound } from "../components/not-found/notFound"
import { Games, CounterGame} from "../pages"





export const Navigation = (props) => {

    return (
        <UserProvider>
            <BrowserRouter>
                <NavBar />
                <Switch>
                    
                    <Route exact path="/">
                        {props.isLoggedIn ? <Profile /> : <LoginPage />}
                    </Route>
                    <Route
                        exact path="/messages" 
                        component = {PrivateMessages}/>
                        
                    <Route
                        exact path='/chat'
                       component = {SuperChat}>
                    </Route>
                 
                    <Route 
                        exact path="/namechange">
                        <NameChange />
                        </Route>

                    <Route
                        exact path='/leaderboard'
                        component = {LeaderBoard}>
                    </Route>

                    
                            
                    {/* <Route path="/"> Not found </Route> */}

                    {/* <Route exact path="/" component={LoginPage} /> */}
                    <Route path="/games" component={Games} />
                    <Route path="/game/:id" component={CounterGame} />
                        {/* <GameRoute/> */}
                    <Route
                        path='*'>
                        <NotFound />

                    </Route>

                    {/* Add your routes here */}

              
                    



                    

        </Switch>
      </BrowserRouter>
    </UserProvider>
  );
};
