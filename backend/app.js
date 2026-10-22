const express = require('express');
const cors = require('cors');

const authRoutes = require('./routes/authRoutes');
const stopRoutes = require('./routes/stopRoutes');
const searchRoutes = require('./routes/searchRoutes');
const routeRoutes = require('./routes/routeRoutes');
const fareRoutes = require('./routes/fareRoutes');
const reportRoutes = require('./routes/reportRoutes');
const { notFound, errorHandler } = require('./middleware/errorHandler');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', app: 'Dagos API' });
});

// Routes (search must be mounted before /api/routes so "search" is not read as an id)
app.use('/api/auth', authRoutes);
app.use('/api/stops', stopRoutes);
app.use('/api/routes/search', searchRoutes);
app.use('/api/routes', routeRoutes);
app.use('/api/fares', fareRoutes);
app.use('/api/reports', reportRoutes);

// Unknown routes and errors
app.use(notFound);
app.use(errorHandler);

module.exports = app;
