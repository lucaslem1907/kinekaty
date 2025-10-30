require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const bcrypt = require('bcryptjs');

async function main() {
  const adminPw = await bcrypt.hash('adminpass', 10);
  const userPw = await bcrypt.hash('userpass', 10);

  await prisma.user.upsert({
    where: { email: 'admin@studio.local' },
    update: {},
    create: {
      name: 'Admin',
      email: 'admin@studio.local',
      password: adminPw,
      phone: '000',
      isAdmin: true
    }
  });

  await prisma.user.upsert({
    where: { email: 'client@example.com' },
    update: {},
    create: {
      name: 'Client',
      email: 'client@example.com',
      password: userPw,
      phone: '111',
      isAdmin: false
    }
  });

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);

  await prisma.class.createMany({
    data: [
      {
        title: 'Morning Yoga',
        description: 'Gentle stretch & breath',
        date: tomorrow,
        time: '09:00',
        duration: 60,
        location: 'Studio A',
        capacity: 10
      },
      {
        title: 'Evening Pilates',
        description: 'Core & mobility',
        date: tomorrow,
        time: '18:30',
        duration: 50,
        location: 'Studio B',
        capacity: 8
      }
    ],
    skipDuplicates: true
  });

  console.log('Seed done');
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
