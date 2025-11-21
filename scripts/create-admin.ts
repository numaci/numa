import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function createAdmin() {
  // Modifiez ces valeurs
  const email = 'admin@example.com';
  const password = 'admin123';
  const firstName = 'Admin';
  const lastName = 'System';

  try {
    // Vérifier si l'admin existe déjà
    const existing = await prisma.user.findUnique({
      where: { email }
    });

    if (existing) {
      console.log('❌ Un utilisateur avec cet email existe déjà');
      console.log('Utilisez reset-password.ts à la place');
      return;
    }

    // Hasher le mot de passe
    const hashedPassword = await bcrypt.hash(password, 12);

    // Créer l'admin
    const admin = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        firstName,
        lastName,
        role: 'ADMIN'
      }
    });

    console.log('✅ Administrateur créé avec succès!');
    console.log('Email:', email);
    console.log('Password:', password);
    console.log('Role:', admin.role);
    console.log('');
    console.log('Vous pouvez maintenant vous connecter sur /admin/login');

  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createAdmin();
