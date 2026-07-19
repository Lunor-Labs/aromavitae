/**
 * Create or update an admin user's password.
 *
 * Usage:
 *   npm run create-admin -- --email admin@aromavitae.com --password 'correct horse battery staple'
 *   # prod
 *   DATABASE_URL=<prod-url> npx tsx scripts/create-admin.ts --email a@b.com --password '...'
 */
import 'dotenv/config';
import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

function readArg(name: string): string | undefined {
  const flag = `--${name}`;
  const idx = process.argv.indexOf(flag);
  return idx === -1 ? undefined : process.argv[idx + 1];
}

async function main() {
  const email = readArg('email')?.toLowerCase();
  const password = readArg('password');

  if (!email || !password) {
    console.error('Usage: create-admin -- --email <email> --password <password>');
    process.exit(1);
  }
  if (password.length < 12) {
    console.error('Password must be at least 12 characters.');
    process.exit(1);
  }

  const passwordHash = await bcrypt.hash(password, 12);

  const admin = await prisma.adminUser.upsert({
    where: { email },
    update: { passwordHash },
    create: { email, passwordHash },
  });

  console.log(`Admin user ready: ${admin.email}`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
