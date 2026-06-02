require("dotenv").config({ path: ".env.local" });
require("dotenv").config();
const { Pool } = require("pg");
const { PrismaPg } = require("@prisma/adapter-pg");
const { PrismaClient } = require("@prisma/client");

async function main() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

  const users = await prisma.user.findMany({
    select: { email: true, roomId: true },
  });
  const rooms = await prisma.room.findMany({
    select: { code: true, state: true },
  });

  console.log("Users:", users);
  console.log(
    "Rooms:",
    rooms.map((r) => ({
      code: r.code,
      hasState: !!r.state,
      masterLight: r.state?.roomState?.lights?.master,
    }))
  );

  await prisma.$disconnect();
  await pool.end();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
