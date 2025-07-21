import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  const products = await prisma.product.findMany({
    where: { supplierId: params.id },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(products);
} 