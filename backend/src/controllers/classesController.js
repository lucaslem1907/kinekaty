const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Create a class
const createClass = async (req, res) => {
  try {
    const { title, description, date, time,duration, location, capacity } = req.body;
      const newClass = await prisma.class.create({
      data: {
        title,
        description,
        date: new Date(date),
        time,
        duration: Number(duration),
        location,
        capacity: Number(capacity),
      },
    });
    res.status(201).json(newClass);
  } catch (err) {
    console.error('Error creating class:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

// Get all classes
const getClasses = async (req, res) => {
  try {
    const classes = await prisma.class.findMany();
    res.json(classes);
  } catch (err) {
    console.error('Error fetching classes:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

module.exports = { createClass, getClasses };
