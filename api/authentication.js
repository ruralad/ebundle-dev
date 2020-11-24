const admin = require("firebase-admin");
const mongoose = require("mongoose");


exports.authenticateToken = function(req, res, next) {
  if(req.headers.authorization != null){
    admin
    .auth()
    .verifyIdToken(req.headers.authorization)
    .then(function(decodedToken) {
      req.uid = decodedToken.uid;
      next();
    })
    .catch(err => {
      res.send("notVerified");
    });
  }else res.send("Not Verified");
};

exports.signUp = function(req,res){
  admin
    .auth()
    .createUser({
      displayName: req.body.name,
      email: req.body.email,
      password: req.body.password
    })
    .then(function(userRecord) {
      console.log(userRecord);
      if (req.body.role == "teacher") {
        const teacher = new Teacher({
          name: req.body.name,
          email: req.body.email,
          firebaseUID: userRecord.uid,
          role: "teacher"
        });
        teacher
          .save()
          .then(result => {
            res.redirect("/login");
          })
          .catch(err => console.log(err));
      } else {
        const student = new Student({
          name: req.body.name,
          email: req.body.email,
          firebaseUID: userRecord.uid,
          role: "student"
        });
        student
          .save()
          .then(result => {
            res.redirect("/login");
          })
          .catch(err => console.log(err));
      }
    })
    .catch(function(error) {
      console.log("Error creating new user:", error);
      res.send("ooh ooh");
    });
}
