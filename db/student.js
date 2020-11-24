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
    college: {
      type: String
      // required : true
    },
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
