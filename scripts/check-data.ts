import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkData() {
  try {
    console.log('📊 Vérification des données existantes...\n');
    
    // Compter les catégories
    const categoryCount = await prisma.category.count();
    console.log(`📁 Catégories: ${categoryCount}`);
    
    // Compter les produits
    const productCount = await prisma.product.count();
    console.log(`🛍️ Produits: ${productCount}`);
    
    // Compter les publicités
    const adCount = await prisma.ad.count();
    console.log(`📢 Publicités: ${adCount}`);
    
    // Afficher les catégories
    const categories = await prisma.category.findMany({
      select: {
        name: true,
        slug: true,
        isPublic: true,
        _count: {
          select: { products: true }
        }
      }
    });
    
    console.log('\n📁 Détail des catégories:');
    categories.forEach(cat => {
      console.log(`  - ${cat.name} (${cat.slug}) - ${cat._count.products} produits ${cat.isPublic ? '✅ Public' : '❌ Privé'}`);
    });
    
    // Afficher quelques produits
    const products = await prisma.product.findMany({
      take: 5,
      select: {
        name: true,
        price: true,
        stock: true,
        isBest: true,
        category: {
          select: { name: true }
        }
      }
    });
    
    console.log('\n🛍️ 5 premiers produits:');
    products.forEach(prod => {
      console.log(`  - ${prod.name} (${prod.category.name}) - ${prod.price} FCFA - Stock: ${prod.stock} ${prod.isBest ? '⭐ Meilleur' : ''}`);
    });
    
    await prisma.$disconnect();
    console.log('\n✅ Vérification terminée!');
  } catch (error) {
    console.error('❌ Erreur lors de la vérification:', error);
    await prisma.$disconnect();
  }
}

checkData(); 