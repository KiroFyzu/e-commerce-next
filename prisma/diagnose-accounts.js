const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

const CHECKS = [
  { email: "admin@example.com", password: "Admin123!" },
  { email: "user@example.com", password: "User123!" },
];

async function main() {
  for (const check of CHECKS) {
    const user = await prisma.user.findUnique({ where: { email: check.email } });
    if (!user) {
      console.log(`${check.email}: NOT FOUND`);
      continue;
    }
    const matches = await bcrypt.compare(check.password, user.passwordHash);
    console.log(
      `${check.email}: id=${user.id} role=${user.role} name=${JSON.stringify(user.name)} passwordMatches=${matches} hashPrefix=${user.passwordHash.slice(0, 7)}`
    );
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
