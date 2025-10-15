const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const createBooking = async (req, res) => {
  try {
    const userId = req.user.id;
    const { classId } = req.body;

    const cls = await prisma.class.findUnique({ where: { id: Number(classId) }, include: { bookings: true }});
    if (!cls) return res.status(404).json({ error: 'Class not found' });

    const already = await prisma.booking.findFirst({
      where: { userId, classId: Number(classId) }
    });
    if (already) return res.status(400).json({ error: 'Already booked' });

    if (cls.bookings.length >= cls.capacity) return res.status(400).json({ error: 'Class is full' });

    const booking = await prisma.booking.create({
      data: { userId, classId: Number(classId) }
    });
    return res.json(booking);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error' });
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

module.exports = { createBooking, listUserBookings };
