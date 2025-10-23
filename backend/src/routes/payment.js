const express = require('express');
const auth = require('../middleware/Auth.js');
const {createSession} = require('../controllers/paymentControllor.js');
const router = express.Router();

router.post('/createsession',auth, createSession);

module.exports = router;
