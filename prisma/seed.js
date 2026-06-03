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

  const hotelRooms = [];
  for (let i = 1; i <= 10; i++) {
    const roomCode = `ROOM-10${i < 10 ? i : '0'}`.replace('1010', '110'); // ROOM-101 to ROOM-110
    const roomName = `Room 1${i.toString().padStart(2, '0')}`;
    const room = await prisma.room.upsert({
      where: { code: roomCode },
      update: {},
      create: { code: roomCode, name: roomName },
    });
    hotelRooms.push(room);
  }

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

  console.log({ admin, guest, adminRoom, guestRoom, seededRooms: hotelRooms.length });
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
