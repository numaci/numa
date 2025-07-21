const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  const email = 'sinebour6@gmail.com';
  const password = 'boursine';
  const firstName = 'Admin';
  const lastName = 'Super';

  // Hash du mot de passe
  const hashedPassword = await bcrypt.hash(password, 10);

  // Création de l'admin
  const admin = await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      firstName,
      lastName,
      role: 'ADMIN',
    },
  });

  console.log('Admin créé :', admin);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 