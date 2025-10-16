const express = require('express');
const auth = require('../middleware/Auth.js');
const { createBooking, listUserBookings, GetAllBookings } = require('../controllers/bookingsController.js');

const router = express.Router();
//api/bookings
router.post('/', auth, createBooking);
//api/bookings/me
router.get('/me', auth, listUserBookings);
//api/bookings/all
router.get('/all', auth, GetAllBookings);

module.exports = router;
