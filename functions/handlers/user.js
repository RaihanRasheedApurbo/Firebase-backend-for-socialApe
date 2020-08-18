const { db, admin } = require("../util/admin");
const firebase = require("firebase");
const config = require("../util/config");
const {isEmptyWithSpace,isEmail,reduceUserDetails} = require('../util/validator')

firebase.initializeApp(config);


exports.logIn = (req, res) => {
  const user = {
    email: req.body.email,
    password: req.body.password,
  };

  let errors = {};

  if (isEmptyWithSpace(user.email)) {
    errors.email = "Field can not be empty";
  } else if (!isEmail(user.email)) {
    errors.email = "Must be a valid email address";
  }

  if (isEmptyWithSpace(user.password)) {
    errors.password = "Field can not be empty";
  }

  if (Object.keys(errors).length > 0) {
    res.status(400).json(errors);
  }

  firebase
    .auth()
    .signInWithEmailAndPassword(user.email, user.password)
    .then((data) => {
      return data.user.getIdToken();
    })
    .then((token) => {
      return res.json({ token });
    })
    .catch((error) => {
      console.error(error);
      if (error.code === "auth/wrong-password") {
        res.status(403).json({ general: "wrong credentials" });
      }
      return res.status(500).json({ error: error.code });
    });
};
exports.signUp = (req, res) => {
  let token, uid;
  const defaultImageFileName = "no-img.png";
  const imageUrl = `https://firebasestorage.googleapis.com/v0/b/${config.storageBucket}/o/${defaultImageFileName}?alt=media`;
  const newUser = {
    email: req.body.email,
    password: req.body.password,
    confirmPassword: req.body.confirmPassword,
    userHandle: req.body.userHandle,
  };

  let errors = {};

  if (isEmptyWithSpace(newUser.email)) {
    errors.email = "Must not be empty";
  } else if (!isEmail(newUser.email)) {
    errors.email = "Must be a valid email";
  }

  if (isEmptyWithSpace(newUser.password)) {
    errors.password = "Must not be empty";
  }

  if (newUser.password !== newUser.confirmPassword) {
    errors.confirmPassword = "Passwords do not match";
  }

  if (isEmptyWithSpace(newUser.userHandle)) {
    errors.handle = "Must not be empty";
  }

  if (Object.keys(errors).length > 0) {
    return res.status(400).json(errors);
  }
  console.log("hi");
  console.log(Object.keys(errors));

  db.doc(`/user/${newUser.userHandle}`)
    .get()
    .then((doc) => {
      console.log(doc.exists);
      if (doc.exists) {
        return res
          .status(400)
          .json({ handle: "this handle is taken already!" });
      } else {
        return firebase
          .auth()
          .createUserWithEmailAndPassword(newUser.email, newUser.password);
      }
    })
    .then((data) => {
      uid = data.user.uid;
      return data.user.getIdToken();
    })
    .then((data) => {
      token = data;
      const newDoc = {
        email: newUser.email,
        createdAt: new Date().toISOString(),
        userId: uid,
        handle: newUser.userHandle,
        imageUrl,
      };
      return db.doc(`user/${newUser.userHandle}`).set(newDoc);
    })
    .then((data) => {
      return res.status(201).json({ token });
    })
    .catch((err) => {
      //console.log('hi')
      //console.error(err.code)
      if (err.code === "auth/email-already-in-use") {
        res.status(400).json({ email: "email already taken" });
      } else {
        res.status(500).json({ message: "error message", err: err.code });
      }
    });
};

exports.addUserDetails = (req, res) => {
  let userDetails = reduceUserDetails(req.body);
  console.log(userDetails)
  console.log('inside adduserdetails')

  db.doc(`/user/${req.user.handle}`)
    .update(userDetails)
    .then(() => {
      return res.json({ messsage: "Details are added" });
    })
    .catch((err) => {
      console.log("hi");
      console.error(err);
      return res.status(500).json({ error: err.code });
    });
};

exports.getUserDetails = (req, res) => {
  let userData = {};
  db.doc(`/user/${req.params.handle}`)
    .get()
    .then((doc) => {
      if (doc.exists) {
        userData.user = doc.data();
        return db
          .collection("screams")
          .where("userHandle", "==", req.params.handle)
          .orderBy("createdAt", "desc")
          .get();
      } else {
        return res.status(404).json({ errror: "User not found" });
      }
    })
    .then((data) => {
      userData.screams = [];
      data.forEach((doc) => {
        userData.screams.push({
          body: doc.data().body,
          createdAt: doc.data().createdAt,
          userHandle: doc.data().userHandle,
          imageUrl: doc.data().imageUrl,
          likeCount: doc.data().likeCount,
          commentCount: doc.data().commentCount,
          screamId: doc.id,
        });
      });
      return res.json(userData);
    })
    .catch((err) => {
      console.error(err);
      return res.status(500).json({ error: err.code });
    });
};
// Get own user details
exports.getAuthenticatedUser = (req, res) => {
  let userData = {};
  db.doc(`/user/${req.user.handle}`)
    .get()
    .then((doc) => {
      if (doc.exists) {
        userData.credentials = doc.data();
        return db
          .collection("likes")
          .where("userHandle", "==", req.user.handle)
          .get();
      }
    })
    .then((data) => {
      userData.likes = [];
      data.forEach((doc) => {
        userData.likes.push(doc.data());
      });
      return db
        .collection("notifications")
        .where("recipient", "==", req.user.handle)
        .orderBy("createdAt", "desc")
        .limit(10)
        .get();
    })
    .then((data) => {
      userData.notifications = [];
      data.forEach((doc) => {
        userData.notifications.push({
          recipient: doc.data().recipient,
          sender: doc.data().sender,
          createdAt: doc.data().createdAt,
          screamId: doc.data().screamId,
          type: doc.data().type,
          read: doc.data().read,
          notificationId: doc.id,
        });
      });
      return res.json(userData);
    })
    .catch((err) => {
      console.error(err);
      return res.status(500).json({ error: err.code });
    });
};

exports.uploadImage = (req, res) => {
  const BusBoy = require("busboy");
  const path = require("path");
  const os = require("os");
  const fs = require("fs");
  console.log(req.headers);
  const busboy = new BusBoy({ headers: req.headers });

  let imageFileName;
  let imageToBeUploaded = {};

  busboy.on("file", (fieldName, file, fileName, encoding, mimeType) => {
    console.log("hi");
    console.log(fieldName);
    console.log(fileName);
    console.log(mimeType);
    if (mimeType !== "image/jpeg" && mimeType !== "image/png") {
      return res.status(400).json({ error: "wrong file format" });
    }
    const strs = fileName.split(" ");
    const imageExtension = strs[strs.length - 1];
    imageFileName = `${Math.round(
      Math.random() * 10000000000
    )}.${imageExtension}`;
    const filePath = path.join(os.tmpdir(), imageFileName);
    imageToBeUploaded = { filePath, mimeType };
    file.pipe(fs.createWriteStream(filePath));
  });

  busboy.on("finish", () => {
    admin
      .storage()
      .bucket()
      .upload(imageToBeUploaded.filePath, {
        resumable: false,
        metadata: {
          metadata: {
            contentType: imageToBeUploaded.mimeType,
          },
        },
      })
      .then(() => {
        const imageUrl = `https://firebasestorage.googleapis.com/v0/b/${config.storageBucket}/o/${imageFileName}?alt=media`;
        return db.doc(`/user/${req.user.handle}`).update({ imageUrl });
      })
      .then(() => {
        return res.json({ message: "image uploaded successfully" });
      })
      .catch((err) => {
        return res.status(500).json({ error: err.code });
      });
  });
  busboy.end(req.rawBody);
};
