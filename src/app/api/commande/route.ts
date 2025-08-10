import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import type { Session } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// Ensure Node.js runtime (not Edge) so process.env is available
export const runtime = 'nodejs'

// Create an order from checkout
export async function POST(req: Request) {
  try {
    const session = (await getServerSession(authOptions as any)) as Session | null
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    const body = await req.json().catch(() => null) as any
    if (!body) {
      return NextResponse.json({ error: 'Corps de requête manquant' }, { status: 400 })
    }

    const { fullName, phone, address, items, totalPrice } = body
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

    const order = await prisma.order.create({
      data: {
        orderNumber,
        userId: session.user.id,
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
      },
      include: { orderItems: true },
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

    return NextResponse.json({ success: true, id: order.id, orderNumber: order.orderNumber })
  } catch (e) {
    console.error('[COMMANDE_POST] error', e)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
