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
        file:[{
          url:String
        }],
        createDate: {
          type: Date,
          default: Date.now()
        },
        dueDate: {
          type: Date
        },
        comments:[{
          name:String,
          message : String
        }],
        submissions:[{
          email:String,
          roll: Number,
          submittedOn : Date,
          fileUrl : String
        }]
      }
    ],
    
    //posts
    posts:[{
      text:String,
      date : String,
      postedBy : String,
      fileUrl : String,
      comments:[{
          name:String,
          message : String
        }]
    }],
    
  },
  { timestamps: true }
);

const Class = mongoose.model("class", classSchema);
module.exports = Class;
