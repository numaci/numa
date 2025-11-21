import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function resetPassword() {
  // Modifiez ces valeurs
  const emailOrPhone = 'sinebour63@gmail.com'; // Votre email ou téléphone
  const newPassword = 'boursine'; // Nouveau mot de passe

  try {
    // Rechercher l'utilisateur
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: emailOrPhone },
          { phone: emailOrPhone }
        ]
      }
    });

    if (!user) {
      console.error('❌ Utilisateur non trouvé');
      return;
    }

    console.log('✓ Utilisateur trouvé:', user.email || user.phone);

    // Hasher le nouveau mot de passe
    const hashedPassword = await bcrypt.hash(newPassword, 12);
    console.log('✓ Nouveau hash créé:', hashedPassword.substring(0, 20) + '...');

    // Mettre à jour le mot de passe et le rôle ADMIN
    await prisma.user.update({
      where: { id: user.id },
      data: { 
        password: hashedPassword,
        role: 'ADMIN'
      }
    });

    console.log('✅ Mot de passe réinitialisé et rôle mis à jour avec succès!');
    console.log('Rôle actuel:', 'ADMIN');
    console.log('Vous pouvez maintenant vous connecter avec:');
    console.log('  Email/Phone:', emailOrPhone);
    console.log('  Password:', newPassword);

    // Tester la comparaison
    const isValid = await bcrypt.compare(newPassword, hashedPassword);
    console.log('✓ Test de validation:', isValid ? 'OK' : 'ERREUR');

  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    await prisma.$disconnect();
  }
}

resetPassword();
