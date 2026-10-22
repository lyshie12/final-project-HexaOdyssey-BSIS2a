const Report = require('../models/Report');
const asyncHandler = require('../utils/asyncHandler');
const httpError = require('../utils/httpError');

// ==========================================
// USER ROUTES
// ==========================================

// GET /api/reports
// (Gets all reports - usually for Admin, or just the user's own reports)
const getReports = asyncHandler(async (req, res) => {
  // If you want users to only see their own reports, you would filter by req.user.id
  // For now, this gets all reports, sorted by newest first.
  const reports = await Report.find()
    .populate('reporter', 'name email')
    .populate('route', 'name')
    .populate('stop', 'name')
    .sort('-createdAt');
    
  res.json({ count: reports.length, reports });
});

// POST /api/reports
// (Creates a new report - A regular user action)
const createReport = asyncHandler(async (req, res) => {
  const { type, route, stop, description, proposedChanges } = req.body;

  const report = await Report.create({
    reporter: req.user._id, // Assumes your 'protect' middleware adds req.user
    type,
    route,
    stop,
    description,
    proposedChanges
  });

  res.status(201).json({ report });
});

// GET /api/reports/:id
// (Gets a specific report)
const getReportById = asyncHandler(async (req, res) => {
  const report = await Report.findById(req.params.id)
    .populate('reporter', 'name email')
    .populate('reviewedBy', 'name');

  if (!report) throw httpError(404, 'Report not found');

  res.json({ report });
});

// ==========================================
// ADMIN ROUTES (Moderating Reports)
// ==========================================

// PUT /api/reports/:id/review
// (Admin approves or rejects a report)
const reviewReport = asyncHandler(async (req, res) => {
  const { status, reviewNote } = req.body;

  // Validate that they are only sending 'approved' or 'rejected'
  if (!['approved', 'rejected'].includes(status)) {
    throw httpError(400, 'Status must be either approved or rejected');
  }

  const report = await Report.findById(req.params.id);
  if (!report) throw httpError(404, 'Report not found');

  // Update the review fields
  report.status = status;
  report.reviewNote = reviewNote;
  report.reviewedBy = req.user._id; // The admin making the change
  report.reviewedAt = Date.now();

  await report.save();
  res.json({ message: `Report ${status} successfully`, report });
});

// DELETE /api/reports/:id
// (Admin deletes a report if it's spam)
const deleteReport = asyncHandler(async (req, res) => {
  const report = await Report.findById(req.params.id);
  if (!report) throw httpError(404, 'Report not found');

  await report.deleteOne();
  res.json({ message: 'Report deleted successfully' });
});

module.exports = {
  getReports,
  createReport,
  getReportById,
  reviewReport,
  deleteReport
};