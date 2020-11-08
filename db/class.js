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
        email: {
          type: String,
          required: true
        }
      }
    ],
    classAssignments: [
      {
        title: {
          type: String,
          required: true
        },
        description: {
          type: String
        },
        createDate: {
          type: Date,
          default: Date.now()
        },
        dueDate: {
          type: Date
        }
      }
    ]
  },
  { timestamps: true }
);

const Class = mongoose.model("class", classSchema);
module.exports = Class;
