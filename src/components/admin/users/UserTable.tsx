import { UserTableClient } from './UserTableClient';
import { prisma } from '@/lib/prisma';

interface UserTableProps {
  page: number
}

const ITEMS_PER_PAGE = 10

export default async function UserTable({ page }: UserTableProps) {
  // Récupérer tous les utilisateurs avec pagination (sans filtrage)
  const [users, totalUsers] = await Promise.all([
    prisma.user.findMany({
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        emailVerified: true,
        createdAt: true,
        _count: {
          select: {
            orders: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * ITEMS_PER_PAGE,
      take: ITEMS_PER_PAGE
    }),
    prisma.user.count()
  ])

  const totalPages = Math.ceil(totalUsers / ITEMS_PER_PAGE)

  return (
    <UserTableClient
      users={users}
      totalUsers={totalUsers}
      page={page}
      totalPages={totalPages}
    />
  );
}