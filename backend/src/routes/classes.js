const express = require('express');
const { createClass,deleteClass, getClasses } = require('../controllers/classesController');
const router = express.Router();

// POST /api/classes
router.post('/', createClass);

// GET /api/classes
router.get('/', getClasses);

// DELETE api/classes/:id
router.delete("/:id", deleteClass);

module.exports = router;