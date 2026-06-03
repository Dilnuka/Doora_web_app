// Run: node prisma/checkdb.js
require('dotenv').config({ path: '.env' });
const { PrismaClient } = require('@prisma/client');
const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  const rooms = await prisma.room.findMany({
    include: { user: { select: { name: true, email: true, role: true } } },
    orderBy: { code: 'asc' }
  });

  console.log('\n=== ROOMS ===');
  for (const r of rooms) {
    const u = r.user;
    console.log(`${r.code.padEnd(15)} | ${r.name.padEnd(20)} | guest: ${u ? (u.name||u.email)+' ('+u.role+')' : 'NONE'}`);
  }

  const users = await prisma.user.findMany({
    select: { name:true, email:true, role:true, room: { select: { code:true } } }
  });
  console.log('\n=== USERS ===');
  for (const u of users) {
    console.log(`${(u.name||u.email).padEnd(25)} | role=${u.role.padEnd(6)} | room=${u.room?.code||'(none)'}`);
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
