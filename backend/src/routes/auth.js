const express = require('express');

const { register, login, GetAllUsers } = require('../controllers/authController');

const router = express.Router();
// POST /api/auth/register
router.post('/register', register);

// POST /api/auth/login
router.post('/login', login);

router.get('/', GetAllUsers);

module.exports = router;
