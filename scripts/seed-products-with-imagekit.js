const { PrismaClient } = require("@prisma/client");
const fs = require("fs");
const path = require("path");
const axios = require("axios");
const FormData = require("form-data");

const prisma = new PrismaClient();

const IMAGEKIT_UPLOAD_URL = "https://upload.imagekit.io/api/v1/files/upload";
const IMAGEKIT_PRIVATE_KEY = process.env.IMAGEKIT_PRIVATE_KEY;
const IMAGEKIT_PUBLIC_KEY = process.env.IMAGEKIT_PUBLIC_KEY;
const IMAGEKIT_URL_ENDPOINT = process.env.IMAGEKIT_URL_ENDPOINT;
const IMAGEKIT_FOLDER = "/products";

// Dossier contenant tes images d'exemple
const SAMPLE_IMAGES_DIR = path.join(__dirname, "sample-images");

function getRandomPrice() {
  return (Math.floor(Math.random() * (200000 - 5000 + 1)) + 5000) / 100;
}
function getRandomComparePrice(price) {
  // 10 à 30% plus cher que le prix de base
  return Math.round(price * (1.1 + Math.random() * 0.2) * 100) / 100;
}
function getRandomStock() {
  return Math.floor(Math.random() * (100 - 5 + 1)) + 5;
}
function getRandomWeight() {
  return Math.round((Math.random() * (5000 - 100) + 100) * 10) / 10; // 100g à 5kg
}
function getRandomDimensions() {
  const l = Math.floor(Math.random() * 50) + 5;
  const w = Math.floor(Math.random() * 30) + 2;
  const h = Math.floor(Math.random() * 20) + 1;
  return `${l}x${w}x${h} cm`;
}
function getRandomSKU(categorySlug, i) {
  return `${categorySlug.toUpperCase()}-SKU-${i + 1}-${Math.floor(Math.random() * 10000)}`;
}
function getRandomAttributes() {
  const couleurs = ["noir", "blanc", "rouge", "bleu", "vert", "jaune"];
  const garantie = ["1 an", "2 ans", "6 mois", "3 ans"];
  return {
    couleur: couleurs[Math.floor(Math.random() * couleurs.length)],
    garantie: garantie[Math.floor(Math.random() * garantie.length)],
  };
}
function getDescription(categoryName, i) {
  return `Découvrez le produit ${i + 1} de la catégorie ${categoryName}. Qualité supérieure, livraison rapide, satisfaction garantie !`;
}
function getRandomShippingPrice() {
  return (Math.floor(Math.random() * (5000 - 500 + 1)) + 500) / 100;
}

async function uploadToImageKit(filePath, fileName) {
  const form = new FormData();
  form.append("file", fs.createReadStream(filePath));
  form.append("fileName", fileName);
  form.append("folder", IMAGEKIT_FOLDER);

  const auth = Buffer.from(IMAGEKIT_PRIVATE_KEY + ":").toString("base64");

  const response = await axios.post(IMAGEKIT_UPLOAD_URL, form, {
    headers: {
      ...form.getHeaders(),
      Authorization: `Basic ${auth}`,
    },
  });

  return response.data.url;
}

async function main() {
  const categories = await prisma.category.findMany();
  const sampleImages = fs.readdirSync(SAMPLE_IMAGES_DIR).filter(f => /\.(jpg|jpeg|png|webp)$/i.test(f));

  for (const category of categories) {
    for (let i = 0; i < 10; i++) {
      // Choisir une image au hasard
      const imageFile = sampleImages[Math.floor(Math.random() * sampleImages.length)];
      const imagePath = path.join(SAMPLE_IMAGES_DIR, imageFile);

      // Upload image principale
      const imageUrl = await uploadToImageKit(imagePath, `${category.slug}_product_${i + 1}_${Date.now()}.jpg`);

      // Upload 2 à 4 images secondaires
      const imagesCount = Math.floor(Math.random() * 3) + 2;
      const images = [];
      for (let j = 0; j < imagesCount; j++) {
        const imgFile = sampleImages[Math.floor(Math.random() * sampleImages.length)];
        const imgPath = path.join(SAMPLE_IMAGES_DIR, imgFile);
        images.push(await uploadToImageKit(imgPath, `${category.slug}_product_${i + 1}_extra_${j + 1}_${Date.now()}.jpg`));
      }

      const price = getRandomPrice();
      const comparePrice = getRandomComparePrice(price);
      const stock = getRandomStock();
      const weight = getRandomWeight();
      const dimensions = getRandomDimensions();
      const sku = getRandomSKU(category.slug, i);
      const attributes = getRandomAttributes();
      const shippingPrice = getRandomShippingPrice();
      const isFeatured = Math.random() < 0.2;
      const isBest = Math.random() < 0.15;
      const isHealth = Math.random() < 0.1;

      await prisma.product.create({
        data: {
          name: `Produit ${i + 1} - ${category.name}`,
          slug: `${category.slug}-produit-${i + 1}`,
          description: getDescription(category.name, i),
          price,
          comparePrice,
          stock,
          sku,
          weight,
          dimensions,
          imageUrl,
          images: JSON.stringify(images),
          isActive: true,
          isFeatured,
          isBest,
          isHealth,
          categoryId: category.id,
          attributes,
          shippingPrice,
        },
      });

      console.log(`Produit ${i + 1} ajouté à la catégorie ${category.name}`);
    }
  }

  await prisma.$disconnect();
  console.log("Tous les produits ont été ajoutés !");
}

main().catch(e => {
  console.error(e);
  process.exit(1);
}); 