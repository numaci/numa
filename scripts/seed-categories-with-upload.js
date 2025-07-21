const { PrismaClient } = require("@prisma/client");
const fs = require("fs");
const path = require("path");
const axios = require("axios");
const FormData = require("form-data");

const prisma = new PrismaClient();

const IMAGEKIT_PUBLIC_KEY = process.env.IMAGEKIT_PUBLIC_KEY;
const IMAGEKIT_PRIVATE_KEY = process.env.IMAGEKIT_PRIVATE_KEY;
const IMAGEKIT_URL_ENDPOINT = process.env.IMAGEKIT_URL_ENDPOINT;

const IMAGEKIT_UPLOAD_URL = "https://upload.imagekit.io/api/v1/files/upload";
const IMAGEKIT_FOLDER = "/categories";

const categories = [
  {
    name: "Électronique",
    slug: "electronique",
    description: "Tout pour la technologie : smartphones, ordinateurs, accessoires et plus.",
    file: "electronique.jpg",
  },
  {
    name: "Mode & Vêtements",
    slug: "mode-vetements",
    description: "Vêtements, chaussures et accessoires pour tous les styles.",
    file: "mode.jpg",
  },
  {
    name: "Maison & Décoration",
    slug: "maison-decoration",
    description: "Meubles, déco, linge de maison et tout pour votre intérieur.",
    file: "maison.jpg",
  },
  {
    name: "Beauté & Santé",
    slug: "beaute-sante",
    description: "Cosmétiques, soins, bien-être et produits de santé.",
    file: "beaute.jpg",
  },

  {
    name: "Bébés & Enfants",
    slug: "bebes-enfants",
    description: "Tout pour les bébés et enfants : vêtements, jouets, puériculture.",
    file: "bebe.jpg",
  },
  {
    name: "Informatique",
    slug: "informatique",
    description: "Ordinateurs, périphériques, logiciels et accessoires informatiques.",
    file: "informatique.jpg",
  },
  {
    name: "Téléphonie",
    slug: "telephonie",
    description: "Smartphones, accessoires, forfaits et objets connectés.",
    file: "telephonie.jpg",
  },

];

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
  for (const cat of categories) {
    const localPath = path.join(__dirname, "category-images", cat.file);
    if (!fs.existsSync(localPath)) {
      console.error(`Image manquante : ${localPath}`);
      continue;
    }
    console.log(`Upload de ${cat.file} sur ImageKit...`);
    const imageUrl = await uploadToImageKit(localPath, cat.file);
    await prisma.category.create({
      data: {
        name: cat.name,
        slug: cat.slug,
        description: cat.description,
        imageUrl: imageUrl,
        isActive: true,
        isPublic: true,
      },
    });
    console.log(`Catégorie ajoutée : ${cat.name}`);
  }
  await prisma.$disconnect();
  console.log("Toutes les catégories ont été ajoutées !");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
}); 