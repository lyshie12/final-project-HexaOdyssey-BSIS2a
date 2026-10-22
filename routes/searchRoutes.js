const express = require('express');
const { searchRoutes } = require('../controllers/searchController');

const router = express.Router();

// Mounted at /api/routes/search
router.post('/', searchRoutes);

module.exports = router;
