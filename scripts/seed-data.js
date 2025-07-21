"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
// Images de placeholder valides pour les catégories
const categoryImages = [
    'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&h=300&fit=crop',
    'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=300&fit=crop',
    'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=300&fit=crop',
    'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=400&h=300&fit=crop',
    'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=300&fit=crop',
    'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=300&fit=crop',
    'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&h=300&fit=crop',
    'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&h=300&fit=crop',
    'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=300&fit=crop',
    'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=300&fit=crop',
];
// Images de produits valides (URLs courtes)
const productImages = [
    'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300&h=300&fit=crop',
    'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=300&h=300&fit=crop',
    'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=300&h=300&fit=crop',
    'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=300&h=300&fit=crop',
    'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=300&h=300&fit=crop',
    'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=300&h=300&fit=crop',
    'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=300&h=300&fit=crop',
    'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=300&h=300&fit=crop',
];
// Données des catégories
const categoriesData = [
    {
        name: 'Électronique',
        slug: 'electronique',
        description: 'Tous les produits électroniques et technologiques',
        imageUrl: categoryImages[0],
        isPublic: true,
    },
    {
        name: 'Mode & Accessoires',
        slug: 'mode-accessoires',
        description: 'Vêtements, chaussures et accessoires de mode',
        imageUrl: categoryImages[1],
        isPublic: true,
    },
    {
        name: 'Maison & Jardin',
        slug: 'maison-jardin',
        description: 'Décoration, mobilier et articles pour la maison',
        imageUrl: categoryImages[2],
        isPublic: true,
    },
    {
        name: 'Sport & Loisirs',
        slug: 'sport-loisirs',
        description: 'Équipements sportifs et articles de loisirs',
        imageUrl: categoryImages[3],
        isPublic: true,
    },
    {
        name: 'Beauté & Santé',
        slug: 'beaute-sante',
        description: 'Produits de beauté et articles de santé',
        imageUrl: categoryImages[4],
        isPublic: true,
    },
    {
        name: 'Livres & Médias',
        slug: 'livres-medias',
        description: 'Livres, films, musique et jeux vidéo',
        imageUrl: categoryImages[5],
        isPublic: true,
    },
    {
        name: 'Automobile',
        slug: 'automobile',
        description: 'Pièces auto et accessoires automobiles',
        imageUrl: categoryImages[6],
        isPublic: true,
    },
    {
        name: 'Bébé & Enfant',
        slug: 'bebe-enfant',
        description: 'Articles pour bébés et enfants',
        imageUrl: categoryImages[7],
        isPublic: true,
    },
];
// Fonction pour générer un slug à partir d'un nom
function generateSlug(name) {
    return name
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
}
// Fonction pour générer un SKU
function generateSKU(category, index) {
    return `${category.toUpperCase().substring(0, 3)}-${String(index).padStart(3, '0')}`;
}
// Fonction pour obtenir une image aléatoire
function getRandomImage(images) {
    return images[Math.floor(Math.random() * images.length)];
}
// Fonction pour obtenir plusieurs images (limité à 2 pour éviter les erreurs de taille)
function getMultipleImages(count) {
    const selectedImages = [];
    for (let i = 0; i < Math.min(count, 2); i++) {
        selectedImages.push(getRandomImage(productImages));
    }
    return JSON.stringify(selectedImages);
}
async function seedCategories() {
    console.log('🌱 Création des catégories...');
    const createdCategories = [];
    for (const categoryData of categoriesData) {
        try {
            const category = await prisma.category.create({
                data: categoryData,
            });
            createdCategories.push(category);
            console.log(`✅ Catégorie créée: ${category.name}`);
        }
        catch (error) {
            console.log(`⚠️ Catégorie déjà existante: ${categoryData.name}`);
            // Récupérer la catégorie existante
            const existingCategory = await prisma.category.findUnique({
                where: { slug: categoryData.slug },
            });
            if (existingCategory) {
                createdCategories.push(existingCategory);
            }
        }
    }
    return createdCategories;
}
async function seedProducts(categories) {
    console.log('🛍️ Création des produits...');
    const productsData = [
        // Électronique
        {
            name: 'Smartphone Samsung Galaxy A54',
            description: 'Smartphone Android avec écran 6.4", 128GB de stockage, appareil photo 50MP',
            price: 125000,
            comparePrice: 150000,
            stock: 25,
            categorySlug: 'electronique',
            isBest: true,
        },
        {
            name: 'Écouteurs Bluetooth Sony WH-1000XM4',
            description: 'Écouteurs sans fil avec réduction de bruit active, autonomie 30h',
            price: 85000,
            comparePrice: 95000,
            stock: 15,
            categorySlug: 'electronique',
            isBest: true,
        },
        {
            name: 'Ordinateur portable HP Pavilion',
            description: 'Laptop 15.6", Intel i5, 8GB RAM, 512GB SSD, Windows 11',
            price: 350000,
            comparePrice: 400000,
            stock: 8,
            categorySlug: 'electronique',
        },
        {
            name: 'Tablette iPad Air 10.9"',
            description: 'Tablette Apple avec puce M1, 64GB, WiFi + Cellular',
            price: 280000,
            comparePrice: 320000,
            stock: 12,
            categorySlug: 'electronique',
            isBest: true,
        },
        // Mode & Accessoires
        {
            name: 'Sneakers Nike Air Max 270',
            description: 'Chaussures de sport confortables avec amorti Air Max',
            price: 45000,
            comparePrice: 55000,
            stock: 30,
            categorySlug: 'mode-accessoires',
            isBest: true,
        },
        {
            name: 'Sac à dos The North Face',
            description: 'Sac à dos 30L imperméable pour randonnée et voyage',
            price: 35000,
            comparePrice: 42000,
            stock: 20,
            categorySlug: 'mode-accessoires',
        },
        {
            name: 'Montre connectée Apple Watch SE',
            description: 'Montre intelligente avec suivi fitness et notifications',
            price: 180000,
            comparePrice: 200000,
            stock: 10,
            categorySlug: 'mode-accessoires',
            isBest: true,
        },
        // Maison & Jardin
        {
            name: 'Machine à café Nespresso Vertuo',
            description: 'Machine à café automatique avec système de capsules',
            price: 95000,
            comparePrice: 110000,
            stock: 18,
            categorySlug: 'maison-jardin',
            isBest: true,
        },
        {
            name: 'Robot aspirateur iRobot Roomba',
            description: 'Aspirateur robot intelligent avec cartographie',
            price: 120000,
            comparePrice: 140000,
            stock: 12,
            categorySlug: 'maison-jardin',
        },
        {
            name: 'Lampes LED Philips Hue',
            description: 'Kit d\'éclairage intelligent connecté, 3 ampoules',
            price: 65000,
            comparePrice: 75000,
            stock: 25,
            categorySlug: 'maison-jardin',
        },
        // Sport & Loisirs
        {
            name: 'Vélo de route Trek Domane AL 2',
            description: 'Vélo de route aluminium, freins à disques, 16 vitesses',
            price: 280000,
            comparePrice: 320000,
            stock: 5,
            categorySlug: 'sport-loisirs',
        },
        {
            name: 'Tapis de yoga Liforme',
            description: 'Tapis de yoga écologique, antidérapant, 5mm d\'épaisseur',
            price: 25000,
            comparePrice: 30000,
            stock: 40,
            categorySlug: 'sport-loisirs',
            isBest: true,
        },
        {
            name: 'Raquette de tennis Wilson Pro Staff',
            description: 'Raquette de tennis professionnelle, équilibre tête légère',
            price: 35000,
            comparePrice: 42000,
            stock: 15,
            categorySlug: 'sport-loisirs',
        },
        // Beauté & Santé
        {
            name: 'Sérum Vitamine C La Roche-Posay',
            description: 'Sérum anti-âge avec vitamine C, 30ml',
            price: 18000,
            comparePrice: 22000,
            stock: 50,
            categorySlug: 'beaute-sante',
            isBest: true,
        },
        {
            name: 'Brosse à dents électrique Oral-B',
            description: 'Brosse à dents électrique rechargeable avec minuteur',
            price: 45000,
            comparePrice: 55000,
            stock: 30,
            categorySlug: 'beaute-sante',
        },
        {
            name: 'Diffuseur d\'huiles essentielles URPOWER',
            description: 'Diffuseur d\'huiles essentielles avec minuterie et LED',
            price: 15000,
            comparePrice: 18000,
            stock: 35,
            categorySlug: 'beaute-sante',
        },
        // Livres & Médias
        {
            name: 'Liseuse Kindle Paperwhite',
            description: 'Liseuse électronique avec écran rétroéclairé, 8GB',
            price: 85000,
            comparePrice: 95000,
            stock: 20,
            categorySlug: 'livres-medias',
            isBest: true,
        },
        {
            name: 'Casque audio Bose QuietComfort 35',
            description: 'Casque audio sans fil avec réduction de bruit',
            price: 95000,
            comparePrice: 110000,
            stock: 15,
            categorySlug: 'livres-medias',
        },
        {
            name: 'Console Nintendo Switch OLED',
            description: 'Console de jeux portable avec écran OLED 7"',
            price: 220000,
            comparePrice: 250000,
            stock: 8,
            categorySlug: 'livres-medias',
        },
        // Automobile
        {
            name: 'Démarreur de batterie portable NOCO',
            description: 'Démarreur de batterie portable 1000A, chargeur USB',
            price: 55000,
            comparePrice: 65000,
            stock: 12,
            categorySlug: 'automobile',
        },
        {
            name: 'GPS TomTom GO Discover',
            description: 'GPS routier avec cartes Europe, écran 7" tactile',
            price: 180000,
            comparePrice: 200000,
            stock: 10,
            categorySlug: 'automobile',
        },
        {
            name: 'Câble de charge rapide USB-C',
            description: 'Câble de charge rapide 100W, compatible voiture',
            price: 8000,
            comparePrice: 12000,
            stock: 100,
            categorySlug: 'automobile',
            isBest: true,
        },
        // Bébé & Enfant
        {
            name: 'Poussette 3-en-1 Chicco',
            description: 'Poussette convertible avec nacelle et siège auto',
            price: 180000,
            comparePrice: 220000,
            stock: 8,
            categorySlug: 'bebe-enfant',
        },
        {
            name: 'Babyphone vidéo Motorola',
            description: 'Babyphone avec caméra HD, vision nocturne, bidirectionnel',
            price: 65000,
            comparePrice: 75000,
            stock: 15,
            categorySlug: 'bebe-enfant',
            isBest: true,
        },
        {
            name: 'Jouet éducatif LEGO Duplo',
            description: 'Set de construction LEGO Duplo, 85 pièces',
            price: 25000,
            comparePrice: 30000,
            stock: 25,
            categorySlug: 'bebe-enfant',
        },
    ];
    let createdCount = 0;
    for (const productData of productsData) {
        try {
            // Trouver la catégorie correspondante
            const category = categories.find(cat => cat.slug === productData.categorySlug);
            if (!category) {
                console.log(`⚠️ Catégorie non trouvée: ${productData.categorySlug}`);
                continue;
            }
            const slug = generateSlug(productData.name);
            const sku = generateSKU(productData.categorySlug.substring(0, 3), createdCount + 1);
            // Vérifier si le produit existe déjà
            const existingProduct = await prisma.product.findFirst({
                where: {
                    OR: [
                        { slug: slug },
                        { sku: sku },
                        { name: productData.name }
                    ]
                }
            });
            if (existingProduct) {
                console.log(`⚠️ Produit déjà existant: ${productData.name}`);
                continue;
            }
            const product = await prisma.product.create({
                data: {
                    name: productData.name,
                    slug: slug,
                    description: productData.description,
                    price: productData.price,
                    comparePrice: productData.comparePrice,
                    stock: productData.stock,
                    sku: sku,
                    imageUrl: getRandomImage(productImages),
                    images: getMultipleImages(2),
                    isActive: true,
                    isBest: productData.isBest || false,
                    categoryId: category.id,
                    status: 'PUBLISHED',
                },
            });
            createdCount++;
            console.log(`✅ Produit créé: ${product.name} (${product.sku})`);
        }
        catch (error) {
            console.log(`❌ Erreur lors de la création du produit ${productData.name}:`, error);
        }
    }
    console.log(`🎉 ${createdCount} produits créés avec succès!`);
}
async function seedAds() {
    console.log('📢 Création des publicités...');
    const adsData = [
        {
            title: 'Promotion Électronique',
            description: 'Jusqu\'à -30% sur tous les smartphones et tablettes',
            buttonText: 'Voir les offres',
            imageUrl: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&h=400&fit=crop',
            link: 'https://wa.me/22300000000',
            bgColor: '#3B82F6',
            order: 1,
        },
        {
            title: 'Mode & Accessoires',
            description: 'Nouvelle collection disponible avec livraison gratuite',
            buttonText: 'Découvrir',
            imageUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&h=400&fit=crop',
            link: 'https://wa.me/22300000000',
            bgColor: '#10B981',
            order: 2,
        },
    ];
    for (const adData of adsData) {
        try {
            await prisma.ad.create({
                data: adData,
            });
            console.log(`✅ Publicité créée: ${adData.title}`);
        }
        catch (error) {
            console.log(`⚠️ Publicité déjà existante: ${adData.title}`);
        }
    }
}
async function main() {
    try {
        console.log('🚀 Début du seeding des données...');
        // Créer les catégories
        const categories = await seedCategories();
        // Créer les produits
        await seedProducts(categories);
        // Créer les publicités
        await seedAds();
        console.log('✅ Seeding terminé avec succès!');
    }
    catch (error) {
        console.error('❌ Erreur lors du seeding:', error);
    }
    finally {
        await prisma.$disconnect();
    }
}
// Exécuter le script
main();
