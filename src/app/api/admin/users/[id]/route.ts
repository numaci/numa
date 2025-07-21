import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Récupérer un utilisateur spécifique
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: params.id },
      include: {
        orders: {
          orderBy: { createdAt: 'desc' },
          take: 10
        },
        addresses: true,
        _count: {
          select: {
            orders: true,
            reviews: true
          }
        }
      }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'Utilisateur non trouvé' },
        { status: 404 }
      )
    }

    return NextResponse.json(user)
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'utilisateur:', error)
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    )
  }
}

// Modifier un utilisateur
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const { firstName, lastName, role, emailVerified } = body

    const user = await prisma.user.update({
      where: { id: params.id },
      data: {
        firstName,
        lastName,
        role,
        emailVerified: emailVerified ? new Date() : null
      }
    })

    return NextResponse.json(user)
  } catch (error) {
    console.error('Erreur lors de la modification de l\'utilisateur:', error)
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    )
  }
}

// Supprimer un utilisateur
export async function DELETE(request: NextRequest, context: { params: { id?: string } }) {
  try {
    const { params } = context;
    if (!params?.id) {
      return NextResponse.json({ error: "Paramètre 'id' manquant dans l'URL." }, { status: 400 });
    }
    // Vérifier si l'utilisateur existe
    const user = await prisma.user.findUnique({
      where: { id: params.id }
    });
    if (!user) {
      return NextResponse.json(
        { error: 'Utilisateur non trouvé' },
        { status: 404 }
      );
    }
    // Supprimer l'utilisateur et toutes ses données associées
    await prisma.user.delete({
      where: { id: params.id }
    });
    return NextResponse.json({ message: 'Utilisateur supprimé avec succès' });
  } catch (error) {
    console.error('Erreur lors de la suppression de l\'utilisateur:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur lors de la suppression.' },
      { status: 500 }
    );
  }
} 