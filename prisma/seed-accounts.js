const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

const ACCOUNTS = [
  { name: "Admin", email: "admin@example.com", password: "Admin123!", role: "admin" },
  { name: "User", email: "user@example.com", password: "User123!", role: "user" },
  { name: "Customer", email: "customer@example.com", password: "Customer123!", role: "user" },
];

async function main() {
  for (const account of ACCOUNTS) {
    const passwordHash = await bcrypt.hash(account.password, 12);
    const user = await prisma.user.upsert({
      where: { email: account.email },
      update: { passwordHash, role: account.role, name: account.name },
      create: {
        name: account.name,
        email: account.email,
        passwordHash,
        role: account.role,
      },
    });
    console.log(`OK: ${user.role} -> ${user.email}`);
  }
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
