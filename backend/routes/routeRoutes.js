const express = require('express');
const {
  getRoutes, getRouteById, createRoute, updateRoute, deleteRoute,
} = require('../controllers/routeController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.get('/', getRoutes);
router.get('/:id', getRouteById);

router.post('/', protect, authorize('admin'), createRoute);
router.put('/:id', protect, authorize('admin'), updateRoute);
router.delete('/:id', protect, authorize('admin'), deleteRoute);

module.exports = router;