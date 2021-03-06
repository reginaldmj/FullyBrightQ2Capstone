import React from "react";
import "firebase/firestore";
import "firebase/auth";
import { db } from "../../firebase";
import { useCollectionData } from "react-firebase-hooks/firestore";
import Typography from "@material-ui/core/Typography";
import { makeStyles } from "@material-ui/core/styles";
import Card from "@material-ui/core/Card";
import CardContent from "@material-ui/core/CardContent";
import { Avatar } from "@material-ui/core";

export const LeaderBoard = () => {
  const userRef = db.collection("users");
  const query = userRef.orderBy("score", "desc");
  const [users] = useCollectionData(query, { idField: "id" });



  return (
    <>
      <div className="user-listAllUsers">
        <h1>Leaderboard</h1>
        {users && users.map((user) => <UserP key={user.id} user={user} />)}
      </div>
    </>
  );
};

const UserP = (props) => {
  const useStyles = makeStyles({
    root: {
      minWidth: 275,
    },
    bullet: {
      display: "inline-block",
      margin: "0 2px",
      transform: "scale(0.8)",
    },
    title: {
      fontSize: 14,
    },
    pos: {
      marginBottom: 12,
    },
  });
  const classes = useStyles();

  const { name, score, email, Bio, photoURL } = props.user;

  return (
    <>
      <Card
        className={classes.root}
        style={{
          flexDirection: "column",
          justifyContent: "center",
          display: "flex",
          alignItems: "center",
        }}
      >
        <Avatar className={classes.large} src={photoURL || "/lightbulb.png"} />
        <CardContent>
          <Typography
            className={classes.title}
            color="textPrimary"
            gutterBottom
          >
            {name}
          </Typography>

          <Typography className={classes.pos} color="textSecondary">
            {score}
          </Typography>
          <Typography variant="body2" component="p">
            {email}
            <br />
            {Bio}
          </Typography>
        </CardContent>
      </Card>
    </>
  );
};
