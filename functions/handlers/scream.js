const { db } = require("../util/admin");
const {isEmptyWithSpace} = require('../util/validator')
exports.getAllScreams = (req, res) => {
  db.collection("screams")
    .orderBy("createdAt", "desc")
    .get()
    .then((data) => {
      let screams = [];
      data.forEach((doc) => {
        screams.push({
          screamID: doc.id,
          ...doc.data(),
        });
      });
      return res.json(screams);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).json({ error: err.code });
    });
};

exports.postOneScream = (request, response) => {
  const newScream = {
    body: request.body.body,
    userHandle: request.user.handle,
    imageUrl: request.user.imageUrl,
    createdAt: new Date().toISOString(),
    likeCount: 0,
    commentCount: 0,
  };

  db.collection("screams")
    .add(newScream)
    .then((data) => {
      console.log(data);
      return response
        .status(201)
        .json({ message: `document ${data.id} created successfully!` });
    })
    .catch((err) => {
      console.error(err);
      return response.status(500).json({ error: "something went wrong" });
    });
};

exports.getScream = (req, res) => {
  let screamData = {};

  db.doc(`/screams/${req.params.screamId}`)
    .get()
    .then((doc) => {
      if (!doc.exists) {
        return res.status(404).json({ error: "scream not found" });
      }
      screamData = doc.data();
      screamData.screamId = doc.id;
      //console.log(doc.id)
      return db
        .collection("comments")
        .where("screamId", "==", screamData.screamId)
        .orderBy("createdAt", "desc")
        .get();
    })
    .then((data) => {
      screamData.comments = [];
      //console.log(data.size)
      data.forEach((doc) => {
        screamData.comments.push(doc.data());
      });
      return res.json(screamData);
    })
    .catch((err) => {
      console.log("hi");
      console.error(err);
      res.status(500).json({ error: err.code });
    });
};

exports.submitComment = (req,res) => {
  if(isEmptyWithSpace(req.body.body)){
    return res.status(400).json({error: 'Must not be empty'})
  }

  const newComment = {
    body: req.body.body,
    createdAt: new Date().toISOString(),
    screamId: req.params.screamId,
    userHandle: req.user.handle,
    imageUrl: req.user.imageUrl, 

  }

  db.doc(`/screams/${req.params.screamId}`).get()
    .then(doc => {
      if(!doc.exists){
        return res.status(404).json({error: 'scream is not in the database'})
      }
      let scream = doc.data()
      if(scream.commentCount===undefined){
        scream.commentCount = 1
      }else{
        scream.commentCount++
      }
      db.doc(`/screams/${doc.id}`).update({commentCount: scream.commentCount})
      db.collection('comments').add(newComment)
    })
    .then(() => {
      res.json(newComment)
    })
    .catch(err => {
      console.log('hi')
      console.error(err)
      console.log(newComment)
      res.status(500).json({error : err.code})
    })
  }
  
exports.likeScream = (req,res) => {
  const screamId = req.params.screamId
  let screamInfo
  console.log('inside')
  console.log(req.user)
  db.doc(`/screams/${screamId}`).get()
    .then(doc => {
      if(!doc.exists){
        return res.status(404).json({error: 'scream not found'})

      }
      else{
        screamInfo = doc.data()
        
        db.collection('likes')
          .where('screamId','==',screamId)
          .where('userHandle','==',req.user.handle)
          .get()
          .then(doc => {
            //console.log(doc)
            //console.log(doc.empty)
            if(!doc.empty){
              return res.status(200).json({error: 'already liked'})
            }
            else
            {
              console.log(screamInfo)
              if(screamInfo.likeCount === undefined){
                screamInfo.likeCount = 1
              }else{
                screamInfo.likeCount++
              }
              db.collection('likes').add({screamId,userHandle: req.user.handle})
                .then((data) => {
                  return res.status(201).json({message: `like ${data.id} is added in database`})
                })
                .then(() => {
                  db.doc(`/screams/${screamId}`).update(screamInfo)
                })
            }
          })
          .catch(err => {
            console.log('inner hi')
            console.error(err)
            return res.status(500).json({error: err.code})
          })
      

      }
    })
    .catch(err => {
      console.log('outter hi')
      console.error(err)
      return res.status(500).json({error: err.code})
    })

}

exports.unlikeScream = (req,res) => {
  const screamId = req.params.screamId
  let screamInfo
  console.log('inside')
  console.log(req.user)
  db.doc(`/screams/${screamId}`).get()
    .then(doc => {
      if(!doc.exists){
        return res.status(404).json({error: 'scream not found'})

      }
      else{
        screamInfo = doc.data()
        
        db.collection('likes')
          .where('screamId','==',screamId)
          .where('userHandle','==',req.user.handle)
          .get()
          .then(doc => {
            //console.log(doc)
            //console.log(doc.empty)
            if(!doc.empty){
              console.log(screamInfo)
              
              screamInfo.likeCount--
              
              db.doc(`/likes/${doc.docs[0].id}`).delete()
                .then((data) => {
                  return res.status(201).json(screamInfo)
                })
                .then(() => {
                  db.doc(`/screams/${screamId}`).update({likeCount: screamInfo.likeCount})
                })
              
            }
            else
            {
              return res.status(200).json({error: 'already unliked'})
            }
          })
          .catch(err => {
            console.log('inner hi')
            console.error(err)
            return res.status(500).json({error: err.code})
          })
      

      }
    })
    .catch(err => {
      console.log('outter hi')
      console.error(err)
      return res.status(500).json({error: err.code})
    })


}

exports.deleteScream = (req,res) => {
  const document = db.doc(`/screams/${req.params.screamId}`)
  document.get()
    .then(doc => {
      //console.log(doc.exists)
      if(!doc.exists){
        return res.status(404).json({error: 'Scream not found'})
      }
      if(doc.data().userHandle===req.user.handle){
        return document.delete()
        .then(() => {
          console.log('hey')
          //console.log(res)
          res.json({message: 'Scream deleted successfully'})
        })
      }else{
        return res.status(403).json({error: 'Unauthorized'})
      }
    })
    .catch(err => {
      console.log('hi')
      console.error(err)
      res.status(500).json({error: err.code})
    })


}

