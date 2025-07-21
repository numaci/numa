import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  const payments = await prisma.supplierPayment.findMany({
    where: { supplierId: params.id },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(payments);
}

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  const data = await req.json();
  const { amount, status } = data;
  const payment = await prisma.supplierPayment.create({
    data: {
      supplierId: params.id,
      amount,
      status,
      paidAt: status === "paid" ? new Date() : null,
    },
  });
  return NextResponse.json(payment, { status: 201 });
} 