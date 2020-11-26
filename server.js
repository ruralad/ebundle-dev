const express = require("express");
const admin = require("firebase-admin");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const router = express.Router();
const app = express();

//pug,template configurations
const pug = require("pug");
const classListTemplate = pug.compileFile("./pugTemplates/classData.pug");

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

const { authenticateToken } = require("./api/authentication");

//------------------------------------Middlewares--------------------------------------------//

app.use(express.static("public"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

//----------------------------------------Static--------------------------------------------------------//

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/views/index.html");
});

app.get("/signup", (req, res) => {
  res.redirect("../login");
});
app.get("/login", (req, res) => {
  res.redirect("../account");
});
app.get("/account", (req, res) => {
  res.sendFile(__dirname + "/views/loginsignup/login.html");
});
app.get("/account/verifyemail", (req, res) => {
  res.sendFile(__dirname + "/views/loginsignup/verifyemail.html");
});

app.get("/c", (req, res) => {
  res.sendFile(__dirname + "/views/c.html");
});
app.get("/c/:id", (req, res) => {
  res.sendFile(__dirname + "/views/individualClass.html");
});


app.get("/dashboard", (req, res) => {
  res.sendFile(__dirname + "/views/dashboard.html");
});


app.get("/works", (req, res) => {
  res.sendFile(__dirname + "/views/works.html");
});


app.get("/exams", (req, res) => {
  res.sendFile(__dirname + "/views/exams.html");
});
//---------------------------------------api---------------------------------------------//

//signup
app.post("/api/signup", (req, res) => {
  // signUp(req,res); // function is at api/authentication.js

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
            res.json({
              response: "created"
            });
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
            res.json({
              response: "created"
            });
          })
          .catch(err => console.log(err));
      }
    })
    .catch(function(error) {
      console.log("Error creating new user:", error);
      res.send("ooh ooh");
    });
});

//create a new class, if the requested user is a teacher
app.post("/api/createNewClass", authenticateToken, (req, res) => {
  Teacher.exists({ firebaseUID: req.uid })
    .then(result => {
      let newClassCode = randomClassCode();
      if (result) {
        const newClass = new Class({
          className: req.body.name,
          classDesc: req.body.desc,
          classCreatedBy: req.body.createdBy,
          classTeachers: [req.body.createdBy],
          classCode: newClassCode
        });
        newClass
          .save()
          .then(result => {
            Teacher.findOne({ firebaseUID: req.uid }, function(err, docs) {
              docs.classes.push(result._id);
              docs.save().then(res.json({
              response: "created",
              id : result._id
            }));
            });
          })
          .catch(err => res.send("notCreated : broken at adding code to teacher"));
      } else {
        res.send("notAuthorized");
      }
    })
    .catch(err => res.send("notCreated : couldnt form new class doc"));
});

//join a new class, if the requested user is a student
//NOTFINISHED-------------------------------------------------------------------------!!!!
app.post("/api/joinClass", authenticateToken, (req, res) => {
  Student.exists({ firebaseUID: req.uid })
    .then(result => {
      if (result) {
        Class.findOne({classCode:req.body.classCode},function(err,classDocs){
          Student.findOne({ firebaseUID: req.uid }, function(err, docs) {
          docs.classes.push(classDocs._id);
          docs.save().then(res.send("joined"));
        });
        })
        Student.findOne({ firebaseUID: req.uid }, function(err, docs) {
          docs.classes.push(result._id);
          docs.save().then(res.send("created"));
        });
      } else {
        res.send("notAuthorized");
      }
    })
    .catch(err => res.send("notCreated"));
});

//send all the data from their document, based on their role(teacher or student)
app.get("/api/getData", authenticateToken, (req, res) => {
  Teacher.exists({ firebaseUID: req.uid }).then(result => {
    if (result) {
      Teacher.findOne({ firebaseUID: req.uid }).then(data => {
        res.send(data);
      });
    } else {
      Student.findOne({ firebaseUID: req.uid }).then(data => {
        res.send(data);
      });
    }
  });
});

//gives the list of classes the teacher or student is currently enrolled in, classcode is given as authorization
app.get("/api/getPartialClassData", (req, res) => {
  Class.exists({ _id: req.headers.authorization })
    .then(result => {
      if (result) {
        Class.findOne({ _id: req.headers.authorization }).then(data => {
          let returnData = classListTemplate({
            data: data
          });
          res.json({
            html: returnData,
            classCode: data._id
          });
        });
      }
    })
    .catch(err => {
      console.log(err);
    });
});

app.get("/api/getCompleteClassData", (req, res) => {
  Class.exists({ _id: req.headers.authorization })
    .then(result => {
      if (result) {
        Class.findOne({ _id: req.headers.authorization }).then(data => {
          res.json({
            data
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
