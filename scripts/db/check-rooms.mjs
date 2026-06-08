// Run from project root: node scripts/db/check-rooms.mjs
import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import * as dotenv from 'dotenv';
import { readFileSync } from 'fs';

// Load .env.local
try {
  const env = readFileSync('.env.local', 'utf8');
  env.split('\n').forEach(line => {
    const [k, ...v] = line.split('=');
    if (k && v.length) process.env[k.trim()] = v.join('=').trim();
  });
} catch {}

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const rooms = await prisma.room.findMany({
  include: { user: { select: { name: true, email: true, role: true } } },
  orderBy: { code: 'asc' }
});

console.log('\n=== ALL ROOMS IN DATABASE ===\n');
for (const r of rooms) {
  const status = r.user ? `OCCUPIED by: ${r.user.name || r.user.email} (${r.user.role})` : 'AVAILABLE (no user)';
  console.log(`${r.code.padEnd(15)} ${r.name.padEnd(20)} → ${status}`);
}

console.log('\n=== USERS IN DATABASE ===\n');
const users = await prisma.user.findMany({
  select: { name: true, email: true, role: true, room: { select: { code: true } } }
});
for (const u of users) {
  console.log(`${(u.name || u.email).padEnd(25)} role=${u.role.padEnd(6)} room=${u.room?.code || '(none)'}`);
}

await prisma.$disconnect();
