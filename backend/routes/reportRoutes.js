const express = require('express');
const {
  createReport, getMyReports, getReports, updateReportStatus,
} = require('../controllers/reportController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.use(protect); // every report route needs a login

router.post('/', createReport);
router.get('/mine', getMyReports);
router.get('/', authorize('admin'), getReports);
router.put('/:id', authorize('admin'), updateReportStatus);

module.exports = router;
