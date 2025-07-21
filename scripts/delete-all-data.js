const { PrismaClient } = require("@prisma/client");
const fs = require("fs/promises");
const path = require("path");

const prisma = new PrismaClient();

async function deleteAllFromDB() {
  try { await prisma.orderItem.deleteMany({}); } catch {}
  try { await prisma.order.deleteMany({}); } catch {}
  try { await prisma.cartItem.deleteMany({}); } catch {}
  try { await prisma.review.deleteMany({}); } catch {}
  try { await prisma.productVariant.deleteMany({}); } catch {}
  try { await prisma.sectionProduct.deleteMany({}); } catch {}
  try { await prisma.ad.deleteMany({}); } catch {}
  try { await prisma.product.deleteMany({}); } catch {}
  try { await prisma.category.deleteMany({}); } catch {}
  try { await prisma.supplier.deleteMany({}); } catch {}
  try { await prisma.homeSection.deleteMany({}); } catch {}
  try { await prisma.whatsappConfig.deleteMany({}); } catch {}
  try { await prisma.shippingConfig.deleteMany({}); } catch {}
  try { await prisma.whatsappLead.deleteMany({}); } catch {}
  try { await prisma.passwordResetRequest.deleteMany({}); } catch {}
}

async function deleteUploads(dir) {
  try {
    const files = await fs.readdir(dir);
    for (const file of files) {
      const filePath = path.join(dir, file);
      const stat = await fs.lstat(filePath);
      if (stat.isDirectory()) {
        await deleteUploads(filePath);
        await fs.rmdir(filePath);
      } else {
        await fs.unlink(filePath);
      }
    }
  } catch (err) {
    // Ignore si le dossier n'existe pas
  }
}

async function main() {
  console.log("Suppression de toutes les données principales...");
  await deleteAllFromDB();
  console.log("Suppression des images dans public/uploads...");
  await deleteUploads(path.join(process.cwd(), "public", "uploads"));
  console.log("Suppression terminée !");
  process.exit(0);
}

main().catch((err) => {
  console.error("Erreur lors de la suppression :", err);
  process.exit(1);
}); 