import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testConnection() {
  try {
    console.log('🔍 Test de connexion à la base de données...');
    
    // Test de connexion simple
    const categoryCount = await prisma.category.count();
    console.log(`✅ Connexion réussie! Nombre de catégories: ${categoryCount}`);
    
    const productCount = await prisma.product.count();
    console.log(`✅ Nombre de produits: ${productCount}`);
    
    await prisma.$disconnect();
    console.log('✅ Test terminé avec succès!');
  } catch (error) {
    console.error('❌ Erreur de connexion:', error);
    await prisma.$disconnect();
  }
}

testConnection(); 