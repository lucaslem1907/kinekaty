const express = require('express');
const auth = require('../middleware/Auth.js');
const {buyTokens, useTokens, getUserTokens } = require('../controllers/tokenController');
const router = express.Router();


router.post('/buy',auth, buyTokens);
router.post('/use',auth, useTokens);
router.get('/me',auth, getUserTokens);

module.exports = router;
