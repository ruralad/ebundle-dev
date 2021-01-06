const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const teacherSchema = new Schema(
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
    college: {
      type: String
      // required : true
    },
    works: [
      {class: {
          type: String
        },
        title: {
          type: String
        },
        dueDate: {
          type: String
        },
       classId: {
          type: String
        },
        workId: {
          type: String
        }
      }
    ],
    classes: [
      {
        className: String,
        classCode: String,
        classId: String
      }
    ]
  },
  { timestamps: true }
);

const Teacher = mongoose.model("Teacher", teacherSchema);
module.exports = Teacher;
