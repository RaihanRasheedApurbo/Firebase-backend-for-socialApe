const functions = require("firebase-functions"); 
const { getAllScreams, postOneScream } = require("./handlers/scream");
const {logIn, signUp, uploadImage,addUserDetails,getUserDetails} = require('./handlers/user')
const FBauth = require('./util/FBauth')
// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//

const express = require("express");
const app = express();





app.get("/screams", getAllScreams);
app.post("/scream", FBauth, postOneScream);



app.post("/signup", signUp)
app.post("/login", logIn);
app.post('/user/image',FBauth,uploadImage)
app.post('/user',FBauth,addUserDetails)
app.get('/user',FBauth,getUserDetails)

exports.api = functions.https.onRequest(app);
