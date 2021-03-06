import React, { useState, useEffect } from "react";
import { storage, auth } from "../../firebase/config";
import LinearProgress from "@material-ui/core/LinearProgress";
import { makeStyles } from "@material-ui/core/styles";
import Card from "@material-ui/core/Card";
import CardActionArea from "@material-ui/core/CardActionArea";
import CardActions from "@material-ui/core/CardActions";
import CardContent from "@material-ui/core/CardContent";
import CardMedia from "@material-ui/core/CardMedia";
import Button from "@material-ui/core/Button";
import Typography from "@material-ui/core/Typography";
import { NameChange } from "./editName";
import Modal from "../Modal/Modal";
import { PassChange } from "./editPassword";
import { DeleteUser } from "./deleteUser";
import { UpdateBio } from "../../components/EditProfile/UpdateBio";
import { db } from "../../firebase";

const useStyles = makeStyles({
  root: {
    maxWidth: 345,
    marginLeft: 50,
  },
  media: {
    height: 250,
    marginLeft: "auto",
    marginRight: "auto",
    width: "auto",
  },
});

export const FileUpload = () => {
  const classes = useStyles();
  const [image, setImage] = useState(null);
  const [url, setUrl] = useState("");
  const [progress, setProgress] = useState(0);
  const [uid, setUid] = useState("");
  const [openModal, setOpenModal] = useState(false);
  const [user, setUser] = useState(null);

  const [isLoading, setLoading] = useState(true);
  const getUserDocId = async (email) => {
    email = email.trim();
    let docId = false;
    const usersCollection = await db.collection("users").get();
    usersCollection.forEach((userData) => {
      let foundEmail = userData.data().email;
      if (foundEmail.toLowerCase() === user.email) {
        docId = userData.id;
      }
    });
    return docId;
  };

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setUid(user.uid);
        setUser(user);
        setLoading(false);
      }
    });
    return () => unsubscribe();
  });

  const handleChange = (e) => {
    if (e.target.files[0]) {
      setImage(e.target.files[0]);
    }
  };

  const handleUpload = (event) => {
    event.preventDefault();
    const uploadTask = storage.ref("users/" + uid + "/profile.jpg").put(image);
    uploadTask.on(
      "state_changed",
      (snapshot) => {
        const progress = Math.round(
          (snapshot.bytesTransferred / snapshot.totalBytes) * 100
        );
        setProgress(progress);
      },
      (error) => {
        console.log(error);
      },
      () => {
        storage
          .ref("users/" + uid + "/profile.jpg")
          .getDownloadURL()
          .then(async (url) => {
            setUrl(url);
            user.updateProfile({
              photoURL: url,
            });
            const userDoc = await getUserDocId(user.email);
            db.collection("users")
              .doc(userDoc)
              .set({ photoURL: url }, { merge: true })
              .then(function () {
                alert("Photo updated successfully!");
              })
              .catch(function (error) {});
          });
      }
    );
  };

  if (isLoading) {
    return null;
  }
  return (
    <div>
      <LinearProgress variant="determinate" value={progress} />
      <br />
      <br />

      <Card className={classes.root}>
        <CardActionArea>
          <CardMedia
            className={classes.media}
            image={url || user.photoURL}
            width="150"
            height="150"
          />
          <CardContent>
            <Typography gutterBottom variant="h5" component="h2">
              {user.displayName}
            </Typography>
            <Typography gutterBottom variant="h5" component="h2">
              {user.email}
            </Typography>
          </CardContent>
        </CardActionArea>
        <CardActions>
          <input type="file" accept="image/*" onChange={handleChange} />
          <Button onClick={handleUpload}>Update</Button>
        </CardActions>
        <Button
          variant="contatined"
          color="secondary"
          onClick={() => {
            setOpenModal(true);
          }}
        >
          Change Account Details
        </Button>

        <Modal openModal={openModal} setOpenModal={setOpenModal}>
          <NameChange />
          <br />
          <br />

          <UpdateBio />
          <br />
          <br />

          <PassChange />
        </Modal>
        <DeleteUser />
      </Card>
    </div>
  );
};
