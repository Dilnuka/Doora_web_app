require('dotenv').config({ path: '.env.local' });
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
const { PrismaPg } = require('@prisma/adapter-pg');
const { PrismaClient } = require('@prisma/client');

async function check() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const adapter = new PrismaPg(pool);
  const prisma = new PrismaClient({ adapter });
  
  try {
    const user = await prisma.user.findUnique({ where: { email: 'admin@doora.local' } });
    console.log('User found:', user ? 'Yes' : 'No');
    if (user) {
      console.log('Stored hashed password:', user.password);
      const isValid = await bcrypt.compare('admin123', user.password);
      console.log('Password valid:', isValid);
    }
  } catch (e) {
    console.error('DB Error:', e);
  } finally {
    await prisma.$disconnect();
  }
}
check();
