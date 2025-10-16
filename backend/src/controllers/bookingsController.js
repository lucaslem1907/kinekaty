const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();


const createBooking = async (req, res) => {
  try {
    const userId = req.user.id;
    const { classId } = req.body;

      if (!userId) return res.status(401).json({ error: 'Unauthorized' });
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

    const booking = await prisma.booking.create({
      data: { userId, classId: Number(classId)}
    });
    return res.status(201).json({
      message: 'Booking successful!',
      booking
    });
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
