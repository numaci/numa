import { UserTableClient } from './UserTableClient';
import { prisma } from '@/lib/prisma';

interface UserTableProps {
  page: number
  search: string
  role: string
  status: string
}

const ITEMS_PER_PAGE = 10

export default async function UserTable({ page, search, role, status }: UserTableProps) {
  // Construire les conditions de filtrage
  const where: any = {}
  
  if (search) {
    where.OR = [
      { firstName: { contains: search, mode: 'insensitive' } },
      { lastName: { contains: search, mode: 'insensitive' } },
      { email: { contains: search, mode: 'insensitive' } }
    ]
  }
  
  if (role) {
    where.role = role
  }
  
  if (status) {
    if (status === 'active') {
      where.emailVerified = { not: null }
    } else if (status === 'inactive') {
      where.emailVerified = null
    }
  }

  // Récupérer les utilisateurs avec pagination
  const [users, totalUsers] = await Promise.all([
    prisma.user.findMany({
      where,
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
    prisma.user.count({ where })
  ])

  const totalPages = Math.ceil(totalUsers / ITEMS_PER_PAGE)

  return (
    <UserTableClient
      users={users}
      totalUsers={totalUsers}
      page={page}
      search={search}
      role={role}
      status={status}
      totalPages={totalPages}
    />
  );
} 