const express = require('express');
const { getFares, createFare, updateFare } = require('../controllers/fareController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.get('/', getFares);
router.post('/', protect, authorize('admin'), createFare);
router.put('/:id', protect, authorize('admin'), updateFare);

module.exports = router;
