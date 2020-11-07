const express = require("express");
const admin = require("firebase-admin");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const router = express.Router();
const app = express();

const pug = require("pug");
const compiledFunction = pug.compileFile("./pugTemplates/classData.pug");

//random code generator for classes
const { customAlphabet } = require("nanoid");
const randomClassCode = customAlphabet("ABCDEFGHIJKLMNOPQRSTUVWXYZ", 5);

//firebase admin initialization
const serviceAccount = require("./util/serviceAccountKey.json");
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://ebundle-dev.firebaseio.com"
});

//mongodb connection
const dbURI =
  "mongodb+srv://ebundleDEVS:devsofebundle@cluster0.dc5cp.mongodb.net/ebundle?retryWrites=true&w=majority";
mongoose
  .connect(dbURI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(result => {
    console.log("connected to db");
  });

//db initialization
const Teacher = require("./db/teacher");
const Student = require("./db/student");
const Class = require("./db/class");

//------------------------------------Middlewares--------------------------------------------//

app.use(express.static("public"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

function authenticateToken(req, res, next) {
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
}

//----------------------------------------CODE--------------------------------------------------------//

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/views/index.html");
});

app.get("/dashboard", (req, res) => {
  res.sendFile(__dirname + "/views/dashboard.html");
});

app.get("/signup", (req, res) => {
  res.sendFile(__dirname + "/views/signup.html");
});

app.get("/login", (req, res) => {
  res.sendFile(__dirname + "/views/login.html");
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
});

//---------------------------------------api---------------------------------------------//

app.post("/createNewClass", authenticateToken, (req, res) => {
  Teacher.exists({ firebaseUID: req.uid })
    .then(result => {
      if (result) {
        const newClass = new Class({
          className: req.body.name,
          classDesc: req.body.desc,
          classCreatedBy: req.body.createdBy,
          classTeachers: [req.body.createdBy],
          classCode: randomClassCode()
        });
        newClass
          .save()
          .then(result => res.send("created"))
          .catch(err => res.send("notCreated"));
      } else {
        res.send("notAuthorized");
      }
    })
    .catch(err => res.send("notCreated"));
});

app.get("/getData", authenticateToken, (req, res) => {
  const uid = req.uid;
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
});

//gives the list of classes the teacher or student is currently enrolled in, if the classcode is given as authorization
app.get("/getClassData", (req, res) => {
  Class.exists({ _id: req.headers.authorization })
    .then(result => {
      if (result) {
        Class.findOne({ _id: req.headers.authorization }).then(data => {
          let returnData = compiledFunction({
            data: data
          });
          res.json({
            "html" : returnData,
            "classCode" : data._id
          });
        });
      }
    })
    .catch(err => {
      console.log(err);
    });
});
//-------------------------------------listener------------------------------------------//

const listener = app.listen(process.env.PORT, () => {
  console.log("Your app is listening on port " + listener.address().port);
});
