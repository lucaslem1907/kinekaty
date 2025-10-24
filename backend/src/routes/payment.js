const express = require('express');
const auth = require('../middleware/Auth.js');
const {createSession,webhook} = require('../controllers/paymentControllor.js');
const router = express.Router();

router.post('/createsession',auth, createSession);

router.post('/webhook', webhook);

module.exports = router;
