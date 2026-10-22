const Report = require('../models/Report');
const Route = require('../models/Route');
const asyncHandler = require('../utils/asyncHandler');
const httpError = require('../utils/httpError');
const { REPORT_STATUSES } = require('../config/constants');

// POST /api/reports  (logged in)  body: { routeId, description }
const createReport = asyncHandler(async (req, res) => {
  const { routeId, description } = req.body;
  if (!routeId || !description) throw httpError(400, 'routeId and description are required');
  if (!(await Route.exists({ _id: routeId }))) throw httpError(404, 'Route not found');

  const report = await Report.create({ userId: req.user._id, routeId, description });
  res.status(201).json({ report });
});

// GET /api/reports/mine  (logged in)
const getMyReports = asyncHandler(async (req, res) => {
  const reports = await Report.find({ userId: req.user._id })
    .populate('routeId', 'name mode')
    .sort('-createdAt');
  res.json({ count: reports.length, reports });
});

// GET /api/reports?status=pending  (admin)
const getReports = asyncHandler(async (req, res) => {
  const filter = {};
  if (req.query.status) filter.status = String(req.query.status);

  const reports = await Report.find(filter)
    .populate('userId', 'name email')
    .populate('routeId', 'name mode')
    .sort('-createdAt');
  res.json({ count: reports.length, reports });
});

// PUT /api/reports/:id  (admin)  body: { status: "approved" | "rejected" | "pending" }
const updateReportStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  if (!REPORT_STATUSES.includes(status)) {
    throw httpError(400, `status must be one of: ${REPORT_STATUSES.join(', ')}`);
  }

  const report = await Report.findById(req.params.id);
  if (!report) throw httpError(404, 'Report not found');

  report.status = status;
  await report.save();
  res.json({ report });
});

module.exports = { createReport, getMyReports, getReports, updateReportStatus };
