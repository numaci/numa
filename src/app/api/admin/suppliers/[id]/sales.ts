import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  // On récupère tous les OrderItems liés à ce fournisseur, avec les infos de commande
  const sales = await prisma.orderItem.findMany({
    where: {
      product: {
        supplierId: params.id,
      },
    },
    include: {
      order: true,
      product: true,
    },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(sales);
} 