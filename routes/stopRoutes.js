const express = require('express');
const {
  getStops, getNearbyStops, getStop, createStop, updateStop, deleteStop,
} = require('../controllers/stopController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.get('/', getStops);
router.get('/nearby', getNearbyStops); // must stay above '/:id'
router.get('/:id', getStop);

router.post('/', protect, authorize('admin'), createStop);
router.put('/:id', protect, authorize('admin'), updateStop);
router.delete('/:id', protect, authorize('admin'), deleteStop);

module.exports = router;
