const express = require('express');
const {
  createReport, getMyReports, getReports, getReportById, reviewReport, deleteReport,
} = require('../controllers/reportController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.use(protect); // every report route needs a login

router.post('/', createReport);
router.get('/mine', getMyReports); // must stay above '/:id'
router.get('/', authorize('admin'), getReports);
router.get('/:id', authorize('admin'), getReportById);
router.put('/:id/review', authorize('admin'), reviewReport);
router.delete('/:id', authorize('admin'), deleteReport);

module.exports = router;
