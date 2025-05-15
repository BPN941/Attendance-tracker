const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const { Subject, Attendance } = require('../models/attendanceModel');

router.post('/subjects', async (req, res) => {
  const { name } = req.body;
  if (!name) return res.status(400).json({ error: 'Subject name is required' });

  try {
    const subject = new Subject({ name });
    await subject.save();
    res.status(201).json({ message: 'Subject added', id: subject._id });
  } catch (err) {
    console.error('Error adding subject:', err);
    res.status(500).json({ error: 'Could not add subject' });
  }
});

router.get('/subjects', async (req, res) => {
  try {
    const subjects = await Subject.find();
    console.log("Subjects fetched from DB:", subjects); // Debugging log
    res.json(subjects);
  } catch (err) {
    console.error('Error fetching subjects:', err);
    res.status(500).json({ error: 'Failed to get subjects' });
  }
});

router.post('/attendance', async (req, res) => {
  const { subject_id, date, status } = req.body;

  // Validate `subject_id`
  if (!subject_id || !mongoose.Types.ObjectId.isValid(subject_id)) {
    return res.status(400).json({ error: 'Invalid or missing subject_id' });
  }

  if (!date || !status) {
    return res.status(400).json({ error: 'Missing fields' });
  }

  try {
    const attendance = new Attendance({ subject_id, date, status });
    await attendance.save();

    const subject = await Subject.findById(subject_id);
    if (!subject) {
      return res.status(404).json({ error: 'Subject not found' });
    }

    subject.total_classes += 1;
    if (status === 'present') subject.attended_classes += 1;
    await subject.save();

    res.status(201).json({ message: 'Attendance marked', id: attendance._id });
  } catch (err) {
    console.error('Error marking attendance:', err);
    res.status(500).json({ error: 'Failed to mark attendance' });
  }
});

router.get('/attendance-percentage/:subjectId', async (req, res) => {
  const { subjectId } = req.params;

  // Validate `subjectId`
  if (!mongoose.Types.ObjectId.isValid(subjectId)) {
    return res.status(400).json({ error: 'Invalid subjectId' });
  }

  try {
    const subject = await Subject.findById(subjectId);
    if (!subject) return res.status(404).json({ error: 'Subject not found' });

    const percentage =
      subject.total_classes === 0
        ? 0
        : Math.round((subject.attended_classes / subject.total_classes) * 100);
    res.json({ attendance_percentage: percentage });
  } catch (err) {
    console.error('Error fetching attendance percentage:', err);
    res.status(500).json({ error: 'Failed to fetch data' });
  }
});

router.get('/attendance-summary/:subjectId', async (req, res) => {
  const { subjectId } = req.params;

  // Validate `subjectId`
  if (!mongoose.Types.ObjectId.isValid(subjectId)) {
    return res.status(400).json({ error: 'Invalid subjectId' });
  }

  try {
    const total_days = await Attendance.countDocuments({ subject_id: subjectId });
    const present_days = await Attendance.countDocuments({
      subject_id: subjectId,
      status: 'present',
    });
    const absent_days = total_days - present_days;

    res.json({ total_days, present_days, absent_days });
  } catch (err) {
    console.error('Error fetching attendance summary:', err);
    res.status(500).json({ error: 'Failed to fetch attendance summary' });
  }
});

module.exports = router;