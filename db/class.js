const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const classSchema = new Schema(
  {
    className: {
      type: String,
      required: true
    },
    createdOn: {
      type: Date,
      default: Date.now()
    },
    description: {
      type: String
    },
    teachers: [
      {
        type: String
      }
    ],
    students: [
      {
        email: {
          type: String,
          required: true
        }
      }
    ],
    assignments: [
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
