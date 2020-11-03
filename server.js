const express = require("express");
const admin = require("firebase-admin");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const router = express.Router();

const app = express();

app.set("view engine", "ejs");

//firebase admin initialization
const serviceAccount = require("./util/serviceAccountKey.json");
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://ebundle-dev.firebaseio.com"
});

//mongodb
const dbURI =
  "mongodb+srv://ebundleDEVS:devsofebundle@cluster0.dc5cp.mongodb.net/ebundle?retryWrites=true&w=majority";
mongoose
  .connect(dbURI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(result => {
    console.log("connected to db");
  });

const Teacher = require("./db/teacher");
const Student = require("./db/student");
const Class = require("./db/class");

//------------------------------------Middlewares--------------------------------------------//

app.use(express.static("public"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

//----------------------------------------CODE--------------------------------------------------------//

app.get("/", (req, res) => {
  res.render("index");
});

app.get("/dashboard", (req, res) => {
  res.render("dashboard");
});

app.get("/signup", (req, res) => {
  res.sendFile(__dirname + "/views/signup.html");
});

app.get("/login", (req, res) => {
  res.render("login");
});

//signup
app.post("/signup", (req, res) => {
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
          firebaseUID: userRecord.uid
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
          firebaseUID: userRecord.uid
        });
        student
          .save()
          .then(result => {
            console.log("Mangoose : student document created");
          })
          .catch(err => console.log(err));
        console.log(
          "Fauth : Successfully created new student:",
          userRecord.uid
        );
        res.send("yeeeeeeeeee student");
      }
    })
    .catch(function(error) {
      console.log("Error creating new user:", error);
      res.send("ooh ooh");
    });
});

app.get("/verify", (req, res) => {
  admin
    .auth()
    .verifyIdToken(req.headers.authorization)
    .then(function(decodedToken) {
      const uid = decodedToken.uid;
      admin
        .auth()
        .getUser(uid)
        .then(function(userRecord) {
          // See the UserRecord reference doc for the contents of userRecord.
          res.send({
            message: "verified"
          });
          console.log("verified");
        })
        .catch(function(error) {
          console.log("Error fetching user data:", error);
        });
    })
    .catch(function(error) {
      res.send("not verified");
      console.log("couldnt verify the token");
    });
});
app.get("/getData", (req, res) => {
  admin
    .auth()
    .verifyIdToken(req.headers.authorization)
    .then(function(decodedToken) {
      const uid = decodedToken.uid;
      Student.exists({ firebaseUID: uid })
        .then(result => {
          if (result) {
            Student.findOne({ firebaseUID: uid }).then(data => {
              res.send(data);
            });
          }
        })
        .catch(err => {
          console.log(err);
        });
    })
    .catch(function(error) {
      res.send("not verified");
      console.log("couldnt verify the token");
    });
});

//---------------------------------------api---------------------------------------------//

app.post("/createclass",(req,res)=>{
  const newClass = new Class({
    className : req.body.name,
    description : req.body.desc
  });
  newClass.save().then((result)=>res.redirect("/classes/")).catch(err=>console.log(err));
});
//-------------------------------------listener------------------------------------------//
const listener = app.listen(process.env.PORT, () => {
  console.log("Your app is listening on port " + listener.address().port);
});
