const express = require('express');
const auth = require('../middleware/Auth.js');
const {webhook, createSession} = require('../controllers/paymentControllor.js');
const router = express.Router();


router.post('/createsession',auth, createSession);

router.post('/webhook', express.raw({ type: 'application/json' }), webhook)

module.exports = router;
