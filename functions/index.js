const functions = require("firebase-functions");
const {
  getAllScreams,
  postOneScream,
  getScream,
  submitComment,
  likeScream,
  unlikeScream,
  deleteScream,
} = require("./handlers/scream");
const {
  logIn,
  signUp,
  uploadImage,
  addUserDetails,
  getUserDetails,
} = require("./handlers/user");
const FBauth = require("./util/FBauth");
// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//

const express = require("express");
const { db } = require("./util/admin");
const app = express();

app.get("/screams", getAllScreams);
app.post("/scream", FBauth, postOneScream);
app.get("/scream/:screamId", getScream);
app.post("/scream/:screamId/comment", FBauth, submitComment);
app.get("/scream/:screamId/like", FBauth, likeScream);
app.get("/scream/:screamId/unlike", FBauth, unlikeScream);
app.delete("/scream/:screamId", FBauth, deleteScream);

app.post("/signup", signUp);
app.post("/login", logIn);
app.post("/user/image", FBauth, uploadImage);
app.post("/user", FBauth, addUserDetails);
app.get("/user", FBauth, getUserDetails);

const testNow = (req, res) => {
  //console.log(req.body)
  fetch("https://www.facebook.com")
    .then((res1) => {
      //console.log(res1)
      console.log("hi123");
      //console.log(typeof(res1))
      //console.log(typeof(res1.json()))
      return res.status(200).json({ msg: "killmeh" });
    })
    .then((res2) => {
      //console.log(res2)
      console.log(typeof res2);
      //console.log(res)
      //console.log(res.json())
      console.log("hi again");
      // fetch('https://www.google.com').then(() => {
      //     console.log('inside 2nd fetch')
      // }).then(()=>
      // {
      //     console.log('inside 3rd then')
      // })
    })
    .then(() => {
      console.log("yo yo");
    })
    .then(() => {
      console.log("yo yo2");
    });
};

app.get("/test", testNow);

exports.api = functions.https.onRequest(app);

exports.createNotificationOnLike = functions.firestore
  .document("like/{id}")
  .onCreate((snapshot) => {
    db.doc(`/screams/${snapshot.data().screamId}`)
      .get()
      .then((doc) => {
        if (doc.exists) {
          db.doc(`/notifications/${snapshot.id}`).set({
            createdAt: new Date().toISOString(),
            recipient: doc.data().userHandle,
            sender: snapshot.data().userHandle,
            type: "like",
            read: false,
            screamId: doc.id,
          });
        }
      })
      .catch((err) => {
        console.log("hi");
        console.error(err);
      });
  });


  exports.deleteNotificationOnUnlike = functions
    .firestore
    .document('likes/{id}')
    .onDelete(snapshot => {
        db.doc(`/notifications/${snapshot.id}`).delete()
    })



exports.createNotificationOnComment = functions.firestore
  .document("comment/{id}")
  .onCreate((snapshot) => {
    db.doc(`/screams/${snapshot.data().screamId}`)
      .get()
      .then((doc) => {
        if (doc.exists) {
          db.doc(`/notifications/${snapshot.id}`).set({
            createdAt: new Date().toISOString(),
            recipient: doc.data().userHandle,
            sender: snapshot.data().userHandle,
            type: "comment",
            read: false,
            screamId: doc.id,
          });
        }
      })
      .catch((err) => {
        console.log("hi");
        console.error(err);
      });
  });

  
