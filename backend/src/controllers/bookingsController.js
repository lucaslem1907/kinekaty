const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();


const createBooking = async (req, res) => {
  try {
    const userId = req.user.id;
    const { classId } = req.body;

    // Validatie
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });
    // Controleer of de klas bestaat en of er nog plek is
    const cls = await prisma.class.findUnique({
      where: { id: Number(classId) },
      include: { bookings: true }
    });

    if (!cls)
      return res.status(404).json({ error: 'Class not found' });
    const already = await prisma.booking.findFirst({
      where: { userId, classId: Number(classId) }
    });

    if (already) return res.status(400).json({ error: 'Already booked' });
    if (cls.bookings.length >= cls.capacity)

      return res.status(400).json({ error: 'Class is full' });
    // Als het mogelijk is, tokens en boeking afhandelen

    // Haal token saldo op
    const tokenBalance = await prisma.tokenTransaction.aggregate({
      _sum: { amount: true },
      where: { userId },
    });
    // Check of de gebruiker genoeg tokens heeft (1 token per boeking)
    const totalTokens = tokenBalance._sum.amount || 0;
    if (totalTokens < 1) {
      return res
        .status(400)
        .json({ error: 'Not enough tokens to book this class' });
    }

    // Maak boeking aan
    const booking = await prisma.booking.create({
      data: { userId, classId: Number(classId) }
    });

    //  Trek 1 token af
    await prisma.tokenTransaction.create({
      data: {
        userId,
        amount: -1,
        type: 'use',
      },
    });

    // Stuur succesbericht terug
    return res.status(201).json({
      message: 'Booking successful!',
      booking
    });
    // Foutafhandeling
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message || 'Server error' });
  }
};

const listUserBookings = async (req, res) => {
  const userId = req.user.id;
  const bookings = await prisma.booking.findMany({
    where: { userId },
    include: { class: true }
  });
  return res.json(bookings);
};

const GetAllBookings = async (req, res) => {
  try {
    const bookings = await prisma.booking.findMany({
      include: { user: true, class: true }
    });
    return res.json(bookings);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error' });
  }
};

module.exports = { createBooking, listUserBookings, GetAllBookings };
