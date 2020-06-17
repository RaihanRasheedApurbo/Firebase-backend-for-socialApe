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
 let token,uid
 const isEmptyWithSpace = str => {
     if(str.trim(' ')===''){
         return true
     }
     return false
 }
 const isEmail = emailString => {
     const regex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
     if(emailString.match(regex)){
         return true
     }
     return false
 }
 app.post('/signUp',(req,res) => {

     const newUser = {
        email: req.body.email,
        password: req.body.password,
        confirmPassword: req.body.confirmPassword,
        userHandle: req.body.userHandle
     }
     
     let errors = {}

     if(isEmptyWithSpace(newUser.email)){
         errors.email = 'Must not be empty'
     }else if(!isEmail(newUser.email)){
         errors.email = 'Must be a valid email'
     }

     if(isEmptyWithSpace(newUser.password)){
         errors.password = 'Must not be empty'
     }

     if(newUser.password!==newUser.confirmPassword){
         errors.confirmPassword = 'Passwords do not match'
     }

     if(isEmptyWithSpace(newUser.userHandle)){
        errors.handle = 'Must not be empty' 
     }

     if(Object.keys(errors).length>0){
         return res.status(400).json(errors)
     }
    //  console.log('hi')
    //  console.log(Object.keys(errors))


     db.doc(`/user/${newUser.userHandle}`).get()
        .then(doc => {
            //console.log(doc.exists)
            if(doc.exists){
                return res.status(400).json({handle: 'this handle is taken already!'})
            }else{
                return firebase.auth().createUserWithEmailAndPassword(newUser.email,newUser.password)
                    
                    

            }
        })
        .then((data) => {
            uid = data.user.uid
            return data.user.getIdToken()
                
            
        })
        .then((data) => {
            token = data
            const newDoc = {
                email: newUser.email,
                createdAt: new Date().toISOString(),
                userId: uid
            }
            return db.doc(`user/${newUser.userHandle}`).set(newDoc)
            
        })
        .then(data => {
             return res.status(201).json({token})
        })
        .catch(err => {
            //console.log('hi')
            //console.error(err.code)
            if(err.code === 'auth/email-already-in-use'){
                res.status(400).json({email: 'email already taken'})
            }else{
                res.status(500).json({message: 'error message',err : err.code})
            }
            
        })
     
 })

 app.post('/login',(req,res) => {
     const user = {
         email : req.body.email,
         password: req.body.password
     }
     
     let errors = {}
     
     if(isEmptyWithSpace(user.email)){
         errors.email = 'Field can not be empty'
     }else if(!isEmail(user.email)){
         errors.email = 'Must be a valid email address'
     }

     if(isEmptyWithSpace(user.password)){
         errors.password = 'Field can not be empty'
     }

     if(Object.keys(errors).length > 0){
         res.status(400).json(errors)
     }

     firebase.auth().signInWithEmailAndPassword(user.email,user.password)
        .then(data => {
            return data.user.getIdToken()
        })
        .then(token => {
            return res.json({token})
        })
        .catch(error => {
            console.error(error)
            return res.status(500).json({error: error.code})
        })
 })

exports.api = functions.https.onRequest(app)