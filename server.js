const express = require("express");
const admin = require("firebase-admin");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const app = express();
const fs = require("fs");

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

app.get("/calendar", (req, res) => {
  res.sendFile(__dirname + "/views/calendar.html");
});

app.get("/works", (req, res) => {
  res.sendFile(__dirname + "/views/todo.html");
});

app.get("/exams", (req, res) => {
  res.sendFile(__dirname + "/views/exams.html");
});

app.get("/c/:classid/works/:workid", (req, res) => {
  res.sendFile(__dirname + "/views/individual/works.html");
});

app.get("/c/:classid/attendance", (req, res) => {
  res.sendFile(__dirname + "/views/individual/attendance.html");
});

app.get("/writeexam", (req, res) => {
  res.sendFile(__dirname + "/views/writeExam/writeExam.html");
});

app.get("/markattendance", (req, res) => {
  res.sendFile(__dirname + "/views/markAttendance.html");
});
app.get("/markview", (req, res) => {
  res.sendFile(__dirname + "/views/markview/markview.html");
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
          role: "student",
          rollno: req.body.rollno
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
              docs.save().then(
                res.json({
                  response: "created",
                  id: result._id
                })
              );
            });
          })
          .catch(err =>
            res.send("notCreated : broken at adding code to teacher")
          );
      } else {
        res.send("notAuthorized");
      }
    })
    .catch(err => res.send("notCreated : couldnt form new class doc"));
});

//join a new class, if the requested user is a student
app.post("/api/joinClass", authenticateToken, (req, res) => {
  Student.exists({ firebaseUID: req.uid })
    .then(result => {
      if (result) {
        Class.exists({ classCode: req.body.classCode }).then(result => {
          if (result) {
            Class.findOne({ classCode: req.body.classCode }, function(
              err,
              classDocs
            ) {
              Student.findOne({ firebaseUID: req.uid }, function(err, docs) {
                docs.classes.unshift(classDocs._id);
                docs.save().then(() => {
                  classDocs.classStudents.push({
                    id: docs._id
                  });
                  classDocs.save().then(
                    res.json({
                      message: "joined"
                    })
                  );
                });
              });
            });
          } else
            res.json({
              message: "notExist"
            });
        });
      } else {
        res.send("notAuthorized");
      }
    })
    .catch(err => res.send("notCreated"));
});

//send all the data from their document, based on their role(teacher or student)
//get user data
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
app.get("/api/getDataPassive", (req, res) => {
  Teacher.exists({ firebaseUID: req.headers.authorization }).then(result => {
    if (result) {
      Teacher.findOne({ firebaseUID: req.uid }).then(data => {
        res.json({
          name: data.name,
          email: data.email
        });
      });
    } else {
      Student.findOne({ firebaseUID: req.headers.authorization }).then(data => {
        res.json({
          name: data.name,
          rollno: data.rollno,
          email: data.email
        });
      });
    }
  });
});

//gives the list of classes the teacher or student is currently enrolled in, classcode is given as authorization
//get class data
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

//get class data
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

//new class post
app.post("/api/newClassPost", (req, res) => {
  Class.exists({ _id: req.headers.authorization })
    .then(result => {
      if (result) {
        Class.findOne({ _id: req.headers.authorization }, function(err, docs) {
          docs.posts.unshift({
            text: req.body.newtext,
            fileUrl: req.body.fileUrl,
            date: req.body.date,
            postedBy: req.body.postedBy
          });
          docs.save().then(
            res.json({
              message: "newPostAdded"
            })
          );
        });
      }
    })
    .catch(err => {
      console.log(err);
    });
});

//new work
app.post("/api/newClassWork", authenticateToken, (req, res) => {
  Teacher.exists({ firebaseUID: req.uid }).then(result => {
    if (result) {
      Class.exists({ _id: req.body.currentClassCode })
        .then(result2 => {
          if (result2) {
            Class.findOne({ _id: req.body.currentClassCode }, function(
              err,
              docs
            ) {
              docs.assignments.unshift({
                title: req.body.title,
                description: req.body.description,
                typeOfWork: req.body.type,
                fileUrl: req.body.fileUrl,
                createdDate: req.body.createdDate,
                dueDate: req.body.dueDate,
                createdBy: req.body.createdBy,
                comments: [
                  //   {
                  //   name:String,
                  //   message : String
                  // }
                ],
                submissions: [
                  //                            {
                  //   email:String,
                  //   roll: Number,
                  //   submittedOn : Date,
                  //   fileUrl : String
                  // }
                ]
              });
              docs.save().then(workResult => {
                Teacher.findOne({ firebaseUID: req.uid }, function(
                  err,
                  teacherDocs
                ) {
                  teacherDocs.works.unshift({
                    class: docs.className,
                    title: req.body.title,
                    dueDate: req.body.dueDate,
                    classId: req.body.currentClassCode,
                    workId: workResult.assignments[0]._id
                  });
                  teacherDocs.save().then(() => {
                    docs.classStudents.forEach((item, index) => {
                      Student.findOne({ _id: item.id }, function(
                        err,
                        studentDoc
                      ) {
                        studentDoc.works.unshift({
                          class: docs.className,
                          title: req.body.title,
                          dueDate: req.body.dueDate,
                          workId: workResult.assignments[0]._id,
                          classId: req.body.currentClassCode,
                          finished: "false"
                        });
                        studentDoc.save();
                        if (index == docs.classStudents.length - 1)
                          res.json({
                            response: "newWorkAdded",
                            id: workResult.assignments[0]._id
                          });
                      });
                    });
                  });
                });
              });
            });
          }
        })
        .catch(err => {
          console.log(err);
        });
    } else {
      res.json({
        message: "notTeacher"
      });
    }
  });
});

//get work data
app.get("/api/getWorkData", (req, res) => {
  let classCode = req.headers.authorization.split("/")[0];
  let temp = req.headers.authorization.split("/")[1];
  let workCode = temp.split("#")[0];
  let token = req.headers.authorization.split("#")[1];

  admin
    .auth()
    .verifyIdToken(token)
    .then(function(decodedToken) {
      Class.exists({ _id: classCode })
        .then(result => {
          if (result) {
            Class.findOne({ _id: classCode }).then(data => {
              data.assignments.forEach((item, index) => {
                if (item._id == workCode) {
                  res.send(item);
                }
              });
            });
          }
        })
        .catch(err => {
          console.log(err);
        });
    })
    .catch(err => {
      res.send("notVerified");
    });
});

app.get("/api/checkWorkDone", (req, res) => {
  let classCode = req.headers.authorization.split("/")[0];
  let temp = req.headers.authorization.split("/")[1];
  let workCode = temp.split("#")[0];
  let token = req.headers.authorization.split("#")[1];

  admin
    .auth()
    .verifyIdToken(token)
    .then(function(decodedToken) {
      let uid = decodedToken.uid;
      Student.exists({ firebaseUID: uid }).then(result => {
        if (result) {
          Student.findOne({ firebaseUID: uid })
            .then(studentData => {
              studentData.works.forEach((item, index) => {
                if (item.workId == workCode) {
                  if (item.finished == "true")
                    res.json({
                      message: "yes"
                    });
                  else
                    res.json({
                      message: "no"
                    });
                }
              });
            })
            .catch(err => console.log(err));
        } else res.send("couldnt verify");
      });
    })
    .catch(err => console.log(err));
});

//submit work
app.post("/api/submitWork", authenticateToken, (req, res) => {
  Student.exists({ firebaseUID: req.uid }).then(result => {
    if (result) {
      Class.exists({ _id: req.body.currentClassCode })
        .then(result2 => {
          if (result2) {
            Class.findOne({ _id: req.body.currentClassCode }, function(
              err,
              docs
            ) {
              docs.assignments.forEach((item, index) => {
                if (item._id == req.body.workCode) {
                  item.submissions.push({
                    studentFirebaseId: req.uid,
                    submittedOn: new Date().toLocaleString("en-US", {
                      timeZone: "Asia/Kolkata"
                    }),
                    fileUrl: req.body.fileUrl
                  });
                }
              });
              docs.save().then(() => {
                Student.findOne({ firebaseUID: req.uid }, function(
                  err,
                  studentDocs
                ) {
                  studentDocs.works.forEach((item, index) => {
                    if (item.workId == req.body.workCode) {
                      item.finished = "true";
                    }
                  });
                  studentDocs.save().then(
                    res.json({
                      message: "workSubmitted"
                    })
                  );
                });
              });
            });
          }
        })
        .catch(err => {
          console.log(err);
        });
    } else {
      res.json({
        message: "notStudent"
      });
    }
  });
});

//------------------- calendar events ---------------------//

app.get("/api/events", authenticateToken, (req, res) => {
  Student.exists({ firebaseUID: req.uid }).then(result => {
    if (result) {
      console.log(result);
      Student.findOne({ firebaseUID: req.uid }).then(Result => {
        Result.classes.forEach(cls => {
          Class.findOne({ _id: cls }).then(data => {
            res.send(data.assignments);
          });
        });
      });
    } else {
      Teacher.findOne({ firebaseUID: req.uid }).then(Result => {
        Result.classes.forEach(cls => {
          Class.findOne({ _id: cls }).then(data => {
            res.send(data.assignments);
          });
        });
      });
    }
  });
});
//--------------attendance api-----------------------//
app.get("/api/readData", (req, res) => {
  fs.readFile("markA.json", "utf8", function(err, data) {
    if (err) console.log(err);
    else {
      let attendance = JSON.parse(data);
      console.log(data);
      res.send(attendance);
    }
  });
});

app.post("/api/markattendance", (req, res) => {
  console.log(req.body);
  let data = JSON.stringify(req.body);
  fs.writeFile("markA.json", data, "utf-8", function(err, data) {
    if (err) throw err;
    else console.log("Done!");
  });
});

//-------------------------------------listener------------------------------------------//

const listener = app.listen(process.env.PORT, () => {
  console.log("Your app is listening on port " + listener.address().port);
});
