const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  const adminPassword = await bcrypt.hash('admin123', 10);
  const guestPassword = await bcrypt.hash('guest123', 10);

  const [adminRoom, guestRoom] = await prisma.$transaction([
    prisma.room.upsert({
      where: { code: 'ADMIN-ROOM' },
      update: {},
      create: { code: 'ADMIN-ROOM', name: 'Admin Suite' },
    }),
    prisma.room.upsert({
      where: { code: 'GUEST-ROOM' },
      update: {},
      create: { code: 'GUEST-ROOM', name: 'Guest Suite' },
    })
  ]);

  const [admin, guest] = await prisma.$transaction([
    prisma.user.upsert({
      where: { email: 'admin@doora.local' },
      update: { roomId: adminRoom.id },
      create: {
        email: 'admin@doora.local',
        name: 'Admin User',
        password: adminPassword,
        role: 'ADMIN',
        roomId: adminRoom.id,
      },
    }),
    prisma.user.upsert({
      where: { email: 'guest@doora.local' },
      update: { roomId: guestRoom.id },
      create: {
        email: 'guest@doora.local',
        name: 'Room 204 Guest',
        password: guestPassword,
        role: 'GUEST',
        roomId: guestRoom.id,
      },
    })
  ]);

  console.log({ admin, guest, adminRoom, guestRoom });
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
