import { prisma } from '@/lib/prisma';
import WelcomeWhatsappClient from './WelcomeWhatsappClient';
import React from 'react';

// Empêche la pré-génération qui échoue sans DB
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function WelcomeWhatsappPage() {
  let users: Array<{ id: string; firstName: string | null; lastName: string | null; phone: string | null; createdAt: Date }>= [];
  try {
    users = await prisma.user.findMany({
      where: {
        welcomeMessageSent: false,
        phone: { not: null },
      },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        phone: true,
        createdAt: true,
      },
    });
  } catch (e) {
    console.error('[admin/whatsapp/welcome] DB error:', e);
    users = [];
  }

  return <WelcomeWhatsappClient initialUsers={users} />;
}