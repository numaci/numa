import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import type { Session } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { createOrUpdateContact, sendOrderConfirmationEmail } from '@/lib/brevo'
import { BRAND } from '@/config/brand'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

// Ensure Node.js runtime (not Edge) so process.env is available
export const runtime = 'nodejs'

// Create an order from checkout
export async function POST(req: Request) {
  try {
    // Session facultative: commande invité autorisée
    const session = (await getServerSession(authOptions as any)) as Session | null

    const body = await req.json().catch(() => null) as any
    if (!body) {
      return NextResponse.json({ error: 'Corps de requête manquant' }, { status: 400 })
    }

    const { fullName, phone, address, items, totalPrice, email } = body
    if (!fullName || !phone || !address || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: 'Champs manquants ou invalides' }, { status: 400 })
    }

    const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).slice(2, 7).toUpperCase()}`

    const shippingAddress = {
      name: fullName,
      street: address,
      city: '',
      postalCode: '',
      country: 'CI',
      phone,
    }

    const deliveryZone = {
      name: 'default',
      price: 0,
    }

    const paymentInfo = {
      provider: 'COD',
      clientPhone: phone,
    }

    // Determine target user: session user or fallback guest user
    let userConnect: { connect: { id: string } } | undefined
    if (session?.user?.id) {
      userConnect = { connect: { id: session.user.id } }
    } else {
      const guestEmail = process.env.GUEST_EMAIL || 'guest@numa.local'
      const guestPhone = process.env.GUEST_PHONE || null
      const guestFirstName = 'Guest'
      const guestLastName = 'Checkout'
      const passwordHash = await bcrypt.hash('guest-disabled-login', 10)
      const guest = await prisma.user.upsert({
        where: { email: guestEmail },
        update: {},
        create: {
          email: guestEmail,
          phone: guestPhone ?? undefined,
          password: passwordHash,
          firstName: guestFirstName,
          lastName: guestLastName,
          role: 'USER',
        },
      })
      userConnect = { connect: { id: guest.id } }
    }

    // Vérifier le stock avant de créer la commande
    for (const item of items) {
      const quantity = Number(item.quantity || 1)
      const productId = item.productId

      if (!productId) {
        continue // Skip items without productId
      }

      // Si l'item a un variantId, vérifier le stock du variant
      if (item.variantId) {
        const variant = await prisma.productVariant.findUnique({
          where: { id: item.variantId },
          include: { product: true },
        })

        if (!variant) {
          return NextResponse.json(
            { error: `Variant introuvable pour le produit "${item.name || 'Produit'}"` },
            { status: 400 }
          )
        }

        if (variant.stock < quantity) {
          return NextResponse.json(
            { error: `Stock insuffisant pour "${item.name || variant.product.name}". Stock disponible: ${variant.stock}, Quantité demandée: ${quantity}` },
            { status: 400 }
          )
        }

        if (variant.stock === 0) {
          return NextResponse.json(
            { error: `Le produit "${item.name || variant.product.name}" (${variant.value || variant.name}) n'est plus en stock` },
            { status: 400 }
          )
        }
      } else {
        // Sinon, vérifier le stock du produit principal
        const product = await prisma.product.findUnique({
          where: { id: productId },
        })

        if (!product) {
          return NextResponse.json(
            { error: `Produit "${item.name || 'Produit'}" introuvable` },
            { status: 400 }
          )
        }

        if (product.stock < quantity) {
          return NextResponse.json(
            { error: `Stock insuffisant pour "${item.name || product.name}". Stock disponible: ${product.stock}, Quantité demandée: ${quantity}` },
            { status: 400 }
          )
        }

        if (product.stock === 0) {
          return NextResponse.json(
            { error: `Le produit "${item.name || product.name}" n'est plus en stock` },
            { status: 400 }
          )
        }
      }
    }

    // Utiliser une transaction pour créer la commande et déduire le stock
    const order = await prisma.$transaction(async (tx) => {
      // Créer la commande
      const data: any = {
        orderNumber,
        total: totalPrice,
        shippingAddress: JSON.stringify(shippingAddress),
        deliveryZone: JSON.stringify(deliveryZone),
        paymentInfo: JSON.stringify(paymentInfo),
        orderItems: {
          create: items.map((it: any) => ({
            productId: it.productId || null,
            quantity: Number(it.quantity || 1),
            price: Number(it.price || 0),
            name: String(it.name || 'Produit'),
            sku: it.sku || null,
          })),
        },
      }
      if (userConnect) {
        data.user = userConnect
      }

      const newOrder = await tx.order.create({
        data,
        include: { orderItems: true },
      })

      // Déduire le stock après création de la commande
      for (const item of items) {
        const quantity = Number(item.quantity || 1)
        const productId = item.productId

        if (!productId) {
          continue
        }

        // Si l'item a un variantId, déduire le stock du variant
        if (item.variantId) {
          await tx.productVariant.update({
            where: { id: item.variantId },
            data: {
              stock: {
                decrement: quantity,
              },
            },
          })
        } else {
          // Sinon, déduire le stock du produit principal
          await tx.product.update({
            where: { id: productId },
            data: {
              stock: {
                decrement: quantity,
              },
            },
          })
        }
      }

      return newOrder
    })

    // Attempt to send notification email via Brevo (non-blocking)
    ;(async () => {
      try {
        const cfg = await prisma.notificationConfig.findFirst()
        const toEmail = cfg?.email
        const fromEmail = cfg?.senderEmail || 'numa7433@gmail.com'
        const apiKey = process.env.BREVO_API_KEY
        if (!toEmail) {
          console.warn('[COMMANDE_EMAIL] Missing recipient email in DB (NotificationConfig.email)')
          return
        }
        if (!apiKey) {
          console.warn('[COMMANDE_EMAIL] Missing BREVO_API_KEY in environment')
          return
        }

        // Build rich rows from original request items to include image, size/variant, sku, etc.
        const safeItems = Array.isArray(items) ? items : []
        const currency = 'FCFA'
        const itemsHtml = safeItems.map((it: any) => {
          const img = it.imageUrl ? `<img src="${it.imageUrl}" alt="${it.name ?? ''}" width="64" height="64" style="object-fit:cover;border-radius:4px;"/>` : ''
          const size = it.pointure ?? it.size ?? it.selectedSize ?? it.variant?.value ?? it.variant ?? it.selectedVariant ?? it.option?.value ?? ''
          const lineTotal = Number(it.price || 0) * Number(it.quantity || 1)
          return `
            <tr>
              <td style="padding:8px;border:1px solid #eee;vertical-align:top;">${img}</td>
              <td style="padding:8px;border:1px solid #eee;">
                <div style="font-weight:600;">${it.name ?? ''}</div>
                ${it.sku ? `<div style='color:#666;font-size:12px;'>SKU: ${it.sku}</div>` : ''}
                ${size ? `<div style='color:#666;font-size:12px;'>Taille/Pointure: ${size}</div>` : ''}
              </td>
              <td style="padding:8px;border:1px solid #eee;">${Number(it.price || 0).toLocaleString('fr-FR')} ${currency}</td>
              <td style="padding:8px;border:1px solid #eee;">${Number(it.quantity || 1)}</td>
              <td style="padding:8px;border:1px solid #eee;">${lineTotal.toLocaleString('fr-FR')} ${currency}</td>
            </tr>
          `
        }).join('')

        const clientEmail = (session?.user as any)?.email || ''
        const clientId = (session?.user as any)?.id || ''
        const html = `
          <div>
            <h2>Nouvelle commande ${order.orderNumber}</h2>
            <p style="margin:0 0 4px 0;"><strong>Client:</strong> ${fullName} (${phone})</p>
            ${clientEmail ? `<p style="margin:0 0 4px 0;"><strong>Email client:</strong> ${clientEmail}</p>` : ''}
            ${clientId ? `<p style="margin:0 0 12px 0;"><strong>User ID:</strong> ${clientId}</p>` : ''}

            <p style="margin:0 0 4px 0;"><strong>Adresse:</strong> ${address}</p>
            <p style="margin:0 0 4px 0;"><strong>Zone de livraison:</strong> ${deliveryZone.name} — ${Number(deliveryZone.price || 0).toLocaleString('fr-FR')} ${currency}</p>
            <p style="margin:0 0 12px 0;"><strong>Paiement:</strong> ${paymentInfo.provider}${(paymentInfo as any)?.transactionId ? ` — Tx: ${(paymentInfo as any).transactionId}` : ''}</p>

            <table style="border-collapse:collapse;margin-top:12px;width:100%;">
              <thead>
                <tr>
                  <th style="padding:6px 8px;border:1px solid #eee;text-align:left;width:72px;">Image</th>
                  <th style="padding:6px 8px;border:1px solid #eee;text-align:left;">Produit</th>
                  <th style="padding:6px 8px;border:1px solid #eee;text-align:left;">Prix U.</th>
                  <th style="padding:6px 8px;border:1px solid #eee;text-align:left;">Qté</th>
                  <th style="padding:6px 8px;border:1px solid #eee;text-align:left;">Total</th>
                </tr>
              </thead>
              <tbody>${itemsHtml}</tbody>
            </table>

            <p style="margin-top:12px;font-size:16px;"><strong>Total commande:</strong> ${Number(totalPrice).toLocaleString('fr-FR')} ${currency}</p>
          </div>
        `

        const res = await fetch('https://api.brevo.com/v3/smtp/email', {
          method: 'POST',
          headers: {
            'api-key': apiKey,
            'accept': 'application/json',
            'content-type': 'application/json',
          },
          body: JSON.stringify({
            sender: { email: fromEmail, name: 'NUMA' },
            to: [{ email: toEmail }],
            replyTo: (clientEmail ? { email: clientEmail, name: fullName } : undefined),
            subject: `Nouvelle commande ${order.orderNumber}`,
            htmlContent: html,
          }),
        })
        if (!res.ok) {
          const text = await res.text().catch(() => '')
          console.error('[COMMANDE_EMAIL] Brevo non-OK', res.status, text)
        }
      } catch (e) {
        console.error('[COMMANDE_EMAIL] send error', e)
      }
    })()

    // Send confirmation to customer + ensure Brevo contact (non-blocking)
    ;(async () => {
      try {
        const customerEmail: string | undefined = email || (session?.user as any)?.email || undefined
        if (!customerEmail) return
        // Ensure contact exists in Brevo (uses updateEnabled)
        await createOrUpdateContact(customerEmail, fullName?.split(' ')[0], fullName?.split(' ').slice(1).join(' '))
        // Send a detailed order confirmation email
        const safeItems = Array.isArray(items) ? items : []
        const mappedItems = safeItems.map((it: any) => ({
          name: String(it.name || 'Produit'),
          quantity: Number(it.quantity || 1),
          price: Number(it.price || 0),
          imageUrl: it.imageUrl || undefined,
          sku: it.sku || undefined,
          size: it.pointure ?? it.size ?? it.selectedSize ?? it.variant?.value ?? it.variant ?? it.selectedVariant ?? it.option?.value ?? undefined,
        }))
        await sendOrderConfirmationEmail({
          email: customerEmail,
          fullName,
          orderNumber: order.orderNumber,
          totalPrice: Number(totalPrice || 0),
          items: mappedItems,
          address,
        })
      } catch (e) {
        console.warn('[COMMANDE_CLIENT_EMAIL] error', e)
      }
    })()

    return NextResponse.json({ success: true, id: order.id, orderNumber: order.orderNumber })
  } catch (e) {
    console.error('[COMMANDE_POST] error', e)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
