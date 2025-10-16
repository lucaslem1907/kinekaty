const express = require('express');
const router = express.Router();
const { register, login, GetAllUsers } = require('../controllers/authController');

// POST /api/auth/register
router.post('/register', register);

// POST /api/auth/login
router.post('/login', login);

router.get('/', GetAllUsers);

module.exports = router;
