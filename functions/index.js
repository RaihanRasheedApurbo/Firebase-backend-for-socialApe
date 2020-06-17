const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp()
// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//

const express = require('express')
const app = express()

//firebase authentication config
var firebaseConfig = {
    apiKey: "AIzaSyD-NjDRw0O5KH2Uf_zYRNSsGBNehE70GEw",
    authDomain: "socialape-6fd1c.firebaseapp.com",
    databaseURL: "https://socialape-6fd1c.firebaseio.com",
    projectId: "socialape-6fd1c",
    storageBucket: "socialape-6fd1c.appspot.com",
    messagingSenderId: "437854909924",
    appId: "1:437854909924:web:be0adc0442ffdd2d4343f1",
    measurementId: "G-FNFLWQJLTR"
  };
const firebase = require('firebase')
firebase.initializeApp(firebaseConfig)
const db = admin.firestore()

app.get('/screams',(req,res) => {
    db.collection('screams').orderBy('createdAt','desc').get()
        .then(data => {
            let screams = []
            data.forEach(doc => {
                screams.push({
                    screamID: doc.id,
                    ...doc.data()

                })
            })
            return res.json(screams)
        })
        .catch(err => console.error(err))
})


// first demo code given when we initiated the project
// exports.helloWorld = functions.https.onRequest((request, response) => {
//  response.send("Hello world of Firebase!");
// });



// we have handle this case using combination of  app.get and exports.api
// exports.getScreams = functions.https.onRequest((request,response)=> {
//     admin.firestore().collection('screams').get()
//         .then(data => {
//             let screams = []
//             data.forEach(doc => {
//                 screams.push(doc.data())
//             })
//             return response.json(screams)
//         })
//         .catch(err => console.error(err))


// })

app.post('/scream',(request,response) => {
    
    const newScream = {
        body: request.body.body,
        userHandle: request.body.userHandle,
        createdAt: new Date().toISOString()
    }

    db.collection('screams').add(newScream)
        .then((data) => {
            console.log(data)
            return response.status(201).json({message: `document ${data.user.uid} created successfully!`})
        })
        .catch((err) => {
            console.error(err)
            return response.status(500).json({ error: 'something went wrong'})
            
        })
        

})
 
 app.post('/signUp',(req,res) => {

     const newUser = {
        email: req.body.email,
        password: req.body.password,
        confirmPassword: req.body.confirmPassword,
        userHandle: req.body.userHandle
     }
     // we have to validate these inputs later....
     db.doc(`/users/${newUser.handle}`).get()
        .then(doc => {
            if(doc.exists){
                return res.status(400).json({handle: 'this handle is taken already!'})
            }else{
                return firebase.auth().createUserWithEmailAndPassword(newUser.email,newUser.password)
                    
                    

            }
        })
        .then((data) => {
            return data.user.getIdToken()
                
            
        })
        .then(token => {
            return res.status(201).json({token})
        })
        .catch(err => {
            //console.log('hi')
            //console.error(err.code)
            res.status(500).json({message: 'error message',err : err.code})
        })
     
 })

exports.api = functions.https.onRequest(app)