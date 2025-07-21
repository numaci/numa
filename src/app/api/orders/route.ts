import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import type { Order, OrderItem } from '@prisma/client';

// Fonction pour envoyer l'email de commande via Brevo (API HTTP natif)
// Correction du typage et du modèle Prisma
async function sendOrderEmail(order: Order & { user?: { firstName?: string | null; lastName?: string | null; email?: string | null } }, orderItems: OrderItem[]) {
  // Récupère l'email de notification admin
  // Utiliser le bon nom de modèle selon Prisma : notificationConfig ou notification_config
  // Si le modèle s'appelle notification_config dans Prisma, utiliser le bon nom
  const config = await (prisma as any).notificationConfig?.findUnique?.({ where: { id: 'order_email' } })
    || await (prisma as any).notification_config?.findUnique?.({ where: { id: 'order_email' } });
  const adminEmail = config?.email;
  if (!adminEmail) {
    return;
  }
  // Récupère les infos produits + fournisseurs
  const products = await prisma.product.findMany({
    where: { id: { in: orderItems.map(i => i.productId) } },
    include: { supplier: true }
  });

  // Construction du HTML de l'email
  let itemsHtml = '';
  for (const item of orderItems) {
    const product = products.find(p => p.id === item.productId);
    if (!product) continue;
    itemsHtml += `
      <tr>
        <td><img src="${product.imageUrl || ''}" alt="${product.name}" width="80"/></td>
        <td>${product.name}</td>
        <td>${item.price} FCFA</td>
        <td>${item.quantity}</td>
        <td>${product.supplier?.name || 'N/A'}</td>
        <td>${product.supplier?.email || 'N/A'}</td>
        <td>${product.supplierPrice ? product.supplierPrice + ' FCFA' : 'N/A'}</td>
      </tr>
    `;
  }

  // Récupérer l'adresse de livraison (shippingAddress)
  type Shipping = {
    address1?: string;
    address2?: string;
    city?: string;
    country?: string;
    latitude?: number;
    longitude?: number;
    phone?: string;
    postalCode?: string;
  };
  let shipping: Shipping = {};
  try {
    shipping = order.shippingAddress ? JSON.parse(order.shippingAddress) : {};
  } catch {}

  // Générer le lien Google Maps
  const addressParts = [shipping.address1, shipping.address2, shipping.city, shipping.country].filter(Boolean);
  const addressString = encodeURIComponent(addressParts.join(' '));
  const mapsUrl = addressString ? `https://www.google.com/maps/search/?api=1&query=${addressString}` : '';

  // Lien direct sur le point si coordonnées présentes
  let mapsCoordsUrl = '';
  const staticMapCoordsUrl = '';
  if (shipping.latitude && shipping.longitude) {
    mapsCoordsUrl = `https://www.google.com/maps/search/?api=1&query=${shipping.latitude},${shipping.longitude}`;
    // Optionnel : image statique (nécessite une clé Google Maps Static API)
    // staticMapCoordsUrl = `https://maps.googleapis.com/maps/api/staticmap?center=${shipping.latitude},${shipping.longitude}&zoom=16&size=400x200&markers=color:red%7C${shipping.latitude},${shipping.longitude}&key=VOTRE_CLE_API`;
  }

  // Afficher le mode de paiement
  const paymentLabel = order.paymentInfo && order.paymentInfo !== '{}' && order.paymentInfo !== 'null'
    ? 'Paiement mobile'
    : 'Paiement à la livraison';

  const shippingHtml = `
    <h3>Adresse du client</h3>
    <ul style="margin-bottom:16px;">
      <li><strong>Nom :</strong> ${(order as any).user?.firstName || ''} ${(order as any).user?.lastName || ''}</li>
      <li><strong>Email :</strong> ${(order as any).user?.email || ''}</li>
      <li><strong>Téléphone :</strong> ${shipping.phone || ''}</li>
      <li><strong>Adresse :</strong> ${shipping.address1 || ''} ${shipping.address2 || ''}</li>
      <li><strong>Ville :</strong> ${shipping.city || ''}</li>
      <li><strong>Pays :</strong> ${shipping.country || ''}</li>
      <li><strong>Code postal :</strong> ${shipping.postalCode || ''}</li>
    </ul>
    <p style='margin-bottom:12px;'><strong>Mode de paiement :</strong> <span style='color:${paymentLabel === 'Paiement mobile' ? '#059669' : '#d97706'};'>${paymentLabel}</span></p>
    ${mapsUrl ? `<a href='${mapsUrl}' target='_blank' style='display:inline-block;margin-bottom:8px;padding:8px 16px;background:#2563eb;color:#fff;border-radius:6px;text-decoration:none;font-weight:bold;'>Voir l'adresse sur la carte</a><br/>` : ''}
    ${mapsCoordsUrl ? `<a href='${mapsCoordsUrl}' target='_blank' style='display:inline-block;margin-bottom:12px;padding:8px 16px;background:#059669;color:#fff;border-radius:6px;text-decoration:none;font-weight:bold;'>Voir le point choisi sur la carte</a>` : ''}
    <!-- Pour afficher une image statique, décommentez la ligne ci-dessous et ajoutez votre clé API Google Maps -->
    <!-- ${/* staticMapCoordsUrl ? `<img src='${staticMapCoordsUrl}' alt='Carte' style='margin-top:8px;border-radius:8px;' />` : '' */''} -->
  `;

  const htmlContent = `
    <h2>Nouvelle commande reçue</h2>
    <p><strong>Numéro :</strong> ${order.orderNumber}</p>
    <p><strong>Total :</strong> ${order.total.toNumber()} FCFA</p>
    <p><strong>Date :</strong> ${order.createdAt}</p>
    ${shippingHtml}
    <table border="1" cellpadding="6" style="border-collapse:collapse;">
      <thead>
        <tr>
          <th>Image</th><th>Produit</th><th>Prix client</th><th>Quantité</th><th>Fournisseur</th><th>Email fournisseur</th><th>Prix fournisseur</th>
        </tr>
      </thead>
      <tbody>
        ${itemsHtml}
      </tbody>
    </table>
  `;

  const senderEmail = config?.senderEmail || 'no-reply@tonsite.com';
  // Envoi via l'API HTTP Brevo
  const res = await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: {
      'api-key': process.env.BREVO_API_KEY!,
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body: JSON.stringify({
      to: [{ email: adminEmail, name: 'Admin' }],
      sender: { email: senderEmail, name: 'E-commerce' },
      subject: `Nouvelle commande reçue #${order.orderNumber}`,
      htmlContent,
    }),
  });

  const responseText = await res.text();
  if (!res.ok) {
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!(session as any)?.user?.id) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const body = await request.json();
    const { shippingAddress, selectedZone, paymentInfo, paymentMethod, items, total } = body;

    // Validation des données (plus souple)
    if (!shippingAddress || !items || !total) {
      return NextResponse.json({ error: "Données manquantes" }, { status: 400 });
    }
    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: "Aucun article dans la commande" }, { status: 400 });
    }
    // Il faut au moins une adresse OU une zone de livraison
    if (!selectedZone && !shippingAddress.address1) {
      return NextResponse.json({ error: "Veuillez fournir une adresse ou sélectionner une zone de livraison." }, { status: 400 });
    }
    // Si paiement mobile, paymentInfo doit être présent et non vide
    if (paymentMethod === "mobile") {
      if (!paymentInfo || !paymentInfo.clientPhone || !paymentInfo.receiptImage) {
        return NextResponse.json({ error: "Informations de paiement mobile incomplètes." }, { status: 400 });
      }
    }

    // Générer un numéro de commande unique et court
    const orderCount = await prisma.order.count();
    const orderNumber = `CMD-${String(orderCount + 1).padStart(4, '0')}`;

    // Créer la commande
    const order = await prisma.order.create({
      data: {
        orderNumber,
        userId: (session as any).user.id,
        status: "PENDING_PAYMENT",
        total: total,
        currency: "XOF",
        shippingAddress: JSON.stringify(shippingAddress),
        deliveryZone: JSON.stringify(selectedZone),
        paymentInfo: JSON.stringify(paymentInfo),
        orderItems: {
          create: items.map((item: any) => ({
            productId: item.productId,
            name: item.name,
            price: item.price,
            quantity: item.quantity,
            sku: item.sku || null,
          }))
        }
      },
      include: {
        orderItems: true,
        user: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
          }
        }
      }
    });

    // Envoi de l'email après création de la commande
    try {
      await sendOrderEmail(order, order.orderItems);
    } catch (e) {
    }

    return NextResponse.json({ 
      success: true, 
      orderId: order.orderNumber,
      message: "Commande créée avec succès",
      order: {
        id: order.id,
        orderNumber: order.orderNumber,
        total: order.total.toNumber(),
        status: order.status,
        createdAt: order.createdAt
      }
    });

  } catch (error) {
    return NextResponse.json({ error: "Erreur lors de la création de la commande" }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!(session as any)?.user?.id) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const skip = (page - 1) * limit;

    // Récupérer les commandes de l'utilisateur
    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where: {
          userId: (session as any).user.id,
        },
        include: {
          orderItems: {
            include: {
              product: {
                select: {
                  id: true,
                  name: true,
                  imageUrl: true,
                }
              }
            }
          }
        },
        orderBy: {
          createdAt: "desc",
        },
        skip,
        take: limit,
      }),
      prisma.order.count({
        where: {
          userId: (session as any).user.id,
        }
      })
    ]);

    // Convertir les objets Decimal en number pour la sérialisation
    const serializedOrders = orders.map(order => ({
      ...order,
      total: order.total.toNumber(),
      orderItems: order.orderItems.map(item => ({
        ...item,
        price: item.price.toNumber(),
      }))
    }));

    return NextResponse.json({
      success: true,
      orders: serializedOrders,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });

  } catch (error) {
    return NextResponse.json({ error: "Erreur lors de la récupération des commandes" }, { status: 500 });
  }
} 