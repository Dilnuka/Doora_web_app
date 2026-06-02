require("dotenv").config({ path: ".env.local" });
require("dotenv").config();
const { Pool } = require("pg");
const { PrismaPg } = require("@prisma/adapter-pg");
const { PrismaClient } = require("@prisma/client");

async function main() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

  const room = await prisma.room.findUnique({ where: { code: "GUEST-ROOM" } });
  if (!room) throw new Error("GUEST-ROOM not found");

  await prisma.room.update({
    where: { id: room.id },
    data: {
      state: {
        roomState: {
          lights: { master: true, kitchen: true, bath: false, bed: false, living: false },
          ac: { isOn: true, temp: 22 },
          doorLocked: false,
        },
      },
    },
  });

  const check = await prisma.room.findUnique({
    where: { id: room.id },
    select: { state: true },
  });
  console.log("master light:", check.state?.roomState?.lights?.master);
  console.log("door locked:", check.state?.roomState?.doorLocked);

  await prisma.$disconnect();
  await pool.end();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
