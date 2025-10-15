const express = require('express');
const { createClass, getClasses } = require('../controllers/classesController');
const router = express.Router();

// POST /api/classes
router.post('/', createClass);

// GET /api/classes
router.get('/', getClasses);

module.exports = router;