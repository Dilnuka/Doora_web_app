const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  // Create an Admin user
  const adminPassword = await bcrypt.hash('admin123', 10);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@doora.local' },
    update: {},
    create: {
      email: 'admin@doora.local',
      name: 'Admin User',
      password: adminPassword,
      role: 'ADMIN',
    },
  });

  // Create a Guest user
  const guestPassword = await bcrypt.hash('guest123', 10);
  const guest = await prisma.user.upsert({
    where: { email: 'guest@doora.local' },
    update: {},
    create: {
      email: 'guest@doora.local',
      name: 'Room 204 Guest',
      password: guestPassword,
      role: 'GUEST',
    },
  });

  console.log({ admin, guest });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
