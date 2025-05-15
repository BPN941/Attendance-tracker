const mongoose = require("mongoose");

const SubjectSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  total_classes: { type: Number, default: 0 },
  attended_classes: { type: Number, default: 0 },
});

const AttendanceSchema = new mongoose.Schema({
  subject_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Subject",
    required: true,
  },
  date: { type: String, required: true },
  status: { type: String, enum: ["present", "absent"], required: true },
});

const Subject = mongoose.model("Subject", SubjectSchema);
const Attendance = mongoose.model("Attendance", AttendanceSchema);

module.exports = { Subject, Attendance };
