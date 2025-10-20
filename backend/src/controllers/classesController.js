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

// Delete a class
const deleteClass = async (req, res) => {
  try {
    const classId = parseInt(req.params.id);
    const deleted = await prisma.class.delete({ where: { id: classId } });
    res.json({ message: `Class ${deleted.name} deleted successfully` });
  } catch (err) {
    console.error('Error deleting class:', err);
    res.status(500).json({ error: 'Server error' });
    if (err.code === 'P2025') {
      return res.status(404).json({ error: 'Class not found' });
    }
  }
};

//update a class
const updateClass = async (req, res) => {
  try {
    const classId = parseInt(req.params.id);
    const { title, description, date, time, duration, location, capacity } = req.body;
    const updatedClass = await prisma.class.update({
      where: { id: classId },
      data: { title, description, date: new Date(date), time, duration: Number(duration), location, capacity: Number(capacity) },
    });
    res.json(updatedClass);
  } catch (err) {
    console.error('Error updating class:', err);
    res.status(500).json({ error: 'Server error' });  
  }
}


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


module.exports = { createClass, deleteClass,updateClass,getClasses };
