import { prisma } from '@/lib/prisma';
import WelcomeWhatsappClient from './WelcomeWhatsappClient';
import React from 'react';

export default async function WelcomeWhatsappPage() {
  const users = await prisma.user.findMany({
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

  return <WelcomeWhatsappClient initialUsers={users} />;
} 