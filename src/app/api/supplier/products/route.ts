import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const {
      name,
      imageUrl,
      shortDesc,
      longDesc,
      price,
      categoryId,
      quantity,
      variants,
      supplierId
    } = await req.json();
    if (!name || !price || !categoryId || !shortDesc || !supplierId) {
      return NextResponse.json({ error: "Champs obligatoires manquants." }, { status: 400 });
    }

    // Génération automatique du slug à partir du nom
    const generateSlug = (name: string) => {
      return name
        .toLowerCase()
        .replace(/[éèê]/g, "e")
        .replace(/[àâ]/g, "a")
        .replace(/[ùû]/g, "u")
        .replace(/[ôö]/g, "o")
        .replace(/[îï]/g, "i")
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-")
        .trim();
    };

    let slug = generateSlug(name);
    let counter = 1;
    
    // Vérifier si le slug existe déjà et ajouter un numéro si nécessaire
    while (true) {
      const existingProduct = await prisma.product.findUnique({
        where: { slug },
      });
      
      if (!existingProduct) {
        break;
      }
      
      slug = `${generateSlug(name)}-${counter}`;
      counter++;
    }

    const product = await prisma.product.create({
      data: {
        name,
        slug,
        imageUrl,
        description: longDesc || shortDesc,
        price: parseFloat(price),
        categoryId,
        stock: quantity ? parseInt(quantity) : 0,
        attributes: variants && variants.length > 0 ? { variants } : undefined,
        supplierId,
        isActive: false,
        status: "PENDING", // en attente de validation
        shortDescription: shortDesc,
      },
    });
    return NextResponse.json(product);
  } catch (error) {
    return NextResponse.json({ error: "Erreur serveur." }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const supplierId = searchParams.get("supplierId");
    const search = searchParams.get("search") || "";
    const sort = searchParams.get("sort") === "asc" ? "asc" : "desc";
    if (!supplierId) return NextResponse.json({ products: [] });
    const products = await prisma.product.findMany({
      where: {
        supplierId,
        name: { contains: search, mode: "insensitive" },
      },
      orderBy: { createdAt: sort },
    });
    return NextResponse.json({ products });
  } catch (error) {
    return NextResponse.json({ error: "Erreur serveur." }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "ID manquant." }, { status: 400 });
    await prisma.product.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Erreur serveur." }, { status: 500 });
  }
} 