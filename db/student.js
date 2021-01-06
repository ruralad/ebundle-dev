const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const studentSchema = new Schema(
  {
    name: {
      type: String,
      required: true
    },
    email: {
      type: String,
      required: true
    },
    firebaseUID: {
      type: String,
      required: true
    },
    role: {
      type: String,
      required: true
    },
    rollno: {
      type: String,
      required: true
    },
    college: {
      type: String
      // required : true
    },
    works: [
      {
        class: {
          type: String
        },
        title: {
          type: String
        },
        dueDate: {
          type: String
        },
        workId: {
          type: String
        },
        classId: {
          type: String
        },
        finished: {
          type: String
        }
      }
    ],
    classes: [
      {
        classId: String
      }
    ]
  },
  { timestamps: true }
);

const Student = mongoose.model("student", studentSchema);
module.exports = Student;
