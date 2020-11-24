const admin = require("firebase-admin");
const mongoose = require("mongoose");



exports.authenticateToken = function(req, res, next) {
  if (req.headers.authorization != null) {
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
  } else res.send("Not Verified");
};

exports.signUp = function(req, res) {
  
};
