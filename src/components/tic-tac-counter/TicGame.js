import React, { useEffect, useState } from "react"
import { db, incrementOnce } from "../../firebase"
import { RestartTic } from "./RestartTic"
import "./TicGame.css"


export const TicGame = (props) => {
    const [game, setGame] = useState(null)
    const [JSXstring, setJsxString] = useState(null)
    const [isLoading, setLoading] = useState(true)
    const [message, setMessage] = useState("")
    const [opponentEmail, setOpponentEmail] = useState("")
    const [currentTurn, setTurn] = useState("")
    const [gameIsFinished, setGameIsFinsihed] = useState(false)
    const [isScoreIncremented, setScoreIsIncremented] = useState(JSON.parse(localStorage.getItem("isScoreIncremented")) || false)
    useEffect(() => {
        getRealTimeData()
        getOppenentEmail()
        // testingUpdateGame()
    }, [])
    useEffect(() => {
        if (game != null && checkWin(game, props.currentEmail)) {
            setMessage("You Win!")
            setGameIsFinsihed(true)
        } else if (game != null && checkLost(game)) {
            setMessage("You Lose")
            setGameIsFinsihed(true)
        } else if (game != null && checkFinish(game)) {
            setMessage("Game has unfortunately ended in a tie, better luck next time buddy")
            setGameIsFinsihed(true)
        }

        renderBox()
        return () => setJsxString(null)
    }, [game, currentTurn, opponentEmail, gameIsFinished])
    //eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(() => {
        if (game != null && checkWin(game, props.currentEmail) && gameIsFinished) {
            updateWinnerScore()
        }

    }, [gameIsFinished])
    // useEffect(() => {
    // })
    const gameRef = db.collection("counterGame").doc(props.gameId)

    const getOppenentEmail = async () => {
        gameRef.get().then(async (doc) => {
            let values = doc.data()
            let result = await values.players.find((element) => element !== props.currentEmail)
            setOpponentEmail(result)
        })
    }


    const getRealTimeData = () => {
        gameRef.onSnapshot(async (snapshot) => {
            setGame(snapshot.data().game)
            let turnEmail = await snapshot.data().currentPlayer
            setTurn(turnEmail)
        })
    }
    const updateGame = async (dataKey) => {
        try {
            await db.runTransaction(async (t) => {

                const doc = await t.get(gameRef)
                const placeValues = doc.data().game
                const newObj = { game: { ...placeValues } }
                newObj.game[dataKey] = props.currentEmail
                t.update(gameRef, newObj)
            })
        } catch (error) {
            setMessage("An error has occured")
        }
    }
    const getUserDocId = async (email) => {
        email = email.trim()
        let docId = false
        const usersCollection = await db.collection("users").get()
        usersCollection.forEach((userData) => {
            let foundEmail = userData.data().email
            if (foundEmail.toLowerCase() === email) {
                docId = userData.id
            }
        })
        return docId
    }
    const updateWinnerScore = async () => {
        if (isScoreIncremented) {
            return
        }
        const userId = await getUserDocId(props.currentEmail)
        const userRef = db.collection("users").doc(userId)
        userRef.update({ score: incrementOnce })

        setScoreIsIncremented(true)
        localStorage.setItem("isScoreIncremented","true")
    }

    const checkWin = (game, email) => {

        // HORIZONTAL WINS
        if (game["1"] === email && game["2"] === email && game["3"] === email) {
            return true
        }
        if (game["4"] === email && game["5"] === email && game["6"] === email) {
            return true
        }
        if (game["7"] === email && game["8"] === email && game["9"] === email) {
            return true
        }

        // VERTICAL WINS
        if (game["1"] === email && game["4"] === email && game["7"] === email) {
            return true
        } if (game["2"] === email && game["5"] === email && game["8"] === email) {
            return true
        } if (game["3"] === email && game["6"] === email && game["9"] === email) {
            return true
        }

        //DIAGNOL WINS

        if (game["1"] === email && game["5"] === email && game["9"] === email) {
            return true
        } if (game["3"] === email && game["5"] === email && game["7"] === email) {
            return true
        }

        return false



    }

    const checkFinish = (game) => {
        let values = Object.values(game)
        return !values.includes(null)
    }

    const handleCheckBox = async (event) => {
        // event.persist()
        // setTurn()
        if (gameIsFinished) {
            return
        }
        if (currentTurn !== props.currentEmail) {
            setMessage(`It's not your turn, please wait or blow up ${currentTurn}'s phone`)
            return
        }
        let dataKey = event.currentTarget.dataset.key

        if (game[dataKey] !== null) {
            setMessage("That spot is not empty")
            return
        }
        try {
            updateGame(dataKey)
            gameRef.update({ currentPlayer: opponentEmail })
            event.currentTarget.classList.add("currentPlayer")
            // if (checkWin(game, props.currentEmail)) {
            if (!gameIsFinished) {
                setMessage("")
            }
            // }
        } catch (error) {
            setMessage("An error has occured, try again")
        }
    }

    const checkLost = (game) => {
        if (checkWin(game, opponentEmail)) {
            return true
        }
        return false
    }

    // let currentKeyIndex = gameKeys[0]
    const renderBox = () => {
        if (!game) {
            return null
        }
        for (let [key, value] of Object.entries(game)) {
            if (!value) {
                setJsxString((prev) => {
                    return <>{prev}<div className='ticBox' data-key={key} onClick={(event) => handleCheckBox(event)}></div></>
                })
                // (<div className="ticBox" data-key="nasdf" onClick={(event) => handleCheckBox(event)}></div>)
            } else if (value === props.currentEmail) {
                setJsxString((prev) => {
                    return <>{prev}<div className='currentPlayer ticBox' data-key={key} onClick={(event) => handleCheckBox(event)}> X</div></>
                })
                // return (<div className="currentPlayer ticBox"></div>)
            } else {
                setJsxString((prev) => {
                    return <>{prev}<div className='otherPlayer ticBox' data-key={key} onClick={(event) => handleCheckBox(event)}> O</div></>
                })
                // return (<div className="otherPlayer ticBox"></div>)
            }
        }
        setLoading(false)
    }
    return (<div className="ticGame">
        {!isLoading ? JSXstring : null}
        <br />
        {message}
        <br />
        You are X
        <br />
        {gameIsFinished ? <RestartTic setScoreIsIncremented={setScoreIsIncremented} gameRef={gameRef} setMessage={setMessage} setGame={setGameIsFinsihed} /> : <>{currentTurn}'s turn</>}
    </div>)
}