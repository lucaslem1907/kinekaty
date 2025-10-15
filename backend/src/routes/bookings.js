const express = require('express');
const auth = require('../middleware/Auth.js');
const { createBooking, listUserBookings } = require('../controllers/bookingsController.js');

const router = express.Router();

router.post('/', auth, createBooking);
router.get('/me', auth, listUserBookings);

module.exports = router;
