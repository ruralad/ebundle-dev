const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const classSchema = new Schema(
  {
    className: {
      type: String,
      required: true
    },
    classCreatedBy: {
      type: String,
      required: true
    },
    classCreatedOn: {
      type: Date,
      default: Date.now()
    },
    classCode: {
      type: String,
      required: true
    },
    classDesc: {
      type: String
    },
    classTeachers: [
      {
        type: String
      }
    ],
    classStudents: [
      {
        id: {
          type: String,
          required: true
        }
      }
    ],

    //assignments
    assignments: [
      {
        title: {
          type: String,
          required: true
        },
        description: {
          type: String
        },
        typeOfWork: {
          type: String
        },
        fileUrl: {
          type: String
        },
        createdDate: {
          type: Date
        },
        dueDate: {
          type: Date
        },
        comments: [
          {
            name: String,
            message: String
          }
        ],
        submissions: [
          {
            studentFirebaseId: {
              type: String,
              required: true
            },
            submittedOn: {
              type: String,
              required: true
            },
            fileUrl: String
          }
        ]
      }
    ],

    //posts
    posts: [
      {
        text: String,
        date: String,
        postedBy: String,
        fileUrl: String,
        comments: [
          {
            name: String,
            message: String
          }
        ]
      }
    ],
    attendance:[
      {
        studentName : String,
        studentFirebaseId : String,
        studentRollNo : String,
        classAttended : String
      }
    ]
  },
  { timestamps: true }
);

const Class = mongoose.model("class", classSchema);
module.exports = Class;
