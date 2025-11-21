import * as Brevo from "@getbrevo/brevo";
import { BRAND, SOCIAL } from "@/config/brand";

// Simple helper to initialize Brevo API clients
export function getBrevoTransactionalClient() {
  const apiKey = process.env.BREVO_API_KEY;
  if (!apiKey) return null;
  const apiInstance = new Brevo.TransactionalEmailsApi();
  apiInstance.setApiKey(Brevo.TransactionalEmailsApiApiKeys.apiKey, apiKey);
  return apiInstance;
}

export async function sendOrderConfirmationEmail(params: {
  email: string;
  fullName?: string;
  orderNumber: string;
  totalPrice: number;
  items: Array<{ name: string; quantity: number; price: number; imageUrl?: string; sku?: string; size?: string }>;
  address: string;
}) {
  const smtpClient = getBrevoTransactionalClient();
  if (!smtpClient) return { ok: false, reason: "BREVO_API_KEY missing" };

  const senderEmail = process.env.WELCOME_SENDER_EMAIL || process.env.BREVO_SENDER_EMAIL || "no-reply@yourdomain.com";
  const brandName = BRAND.name;
  const senderName = process.env.WELCOME_SENDER_NAME || brandName;

  const currency = 'FCFA';
  const itemsRows = (params.items || []).map((it) => {
    const lineTotal = Number(it.price || 0) * Number(it.quantity || 1);
    const img = it.imageUrl ? `<img src="${it.imageUrl}" width="48" height="48" style="object-fit:cover;border-radius:6px;"/>` : '';
    const skuHtml = it.sku ? `<div style='color:#666;font-size:12px;'>SKU: ${it.sku}</div>` : '';
    const sizeHtml = it.size ? `<div style='color:#666;font-size:12px;'>Taille/Pointure: ${it.size}</div>` : '';
    return `
      <tr>
        <td style="padding:8px;border:1px solid #eee;vertical-align:top;">${img}</td>
        <td style="padding:8px;border:1px solid #eee;">
          <div style="font-weight:600;">${it.name}</div>
          ${skuHtml}
          ${sizeHtml}
        </td>
        <td style="padding:8px;border:1px solid #eee;">${Number(it.price || 0).toLocaleString('fr-FR')} ${currency}</td>
        <td style="padding:8px;border:1px solid #eee;">${Number(it.quantity || 1)}</td>
        <td style="padding:8px;border:1px solid #eee;">${lineTotal.toLocaleString('fr-FR')} ${currency}</td>
      </tr>`;
  }).join('');

  const htmlContent = `
  <div style="font-family: Inter, Arial, sans-serif; background:#ffffff; color:#000000; padding:12px;">
    <table width="100%" cellspacing="0" cellpadding="0" style="width:100%; border:1px solid #e5e7eb; border-radius:16px; overflow:hidden;">
      <tr>
        <td style="padding:24px; border-bottom:1px solid #e5e7eb;">
          <div style="font-size:22px; font-weight:800;">${brandName}</div>
        </td>
      </tr>
      <tr>
        <td style="padding:24px;">
          <h1 style="margin:0 0 10px; font-size:20px; font-weight:800;">Confirmation de commande</h1>
          <p style="margin:0 0 8px;">Bonjour ${params.fullName ?? ''},</p>
          <p style="margin:0 0 16px;">Merci pour votre commande <strong>${params.orderNumber}</strong>. Voici un récapitulatif :</p>

          <table style="border-collapse:collapse;margin-top:8px;width:100%;">
            <thead>
              <tr>
                <th style="padding:6px 8px;border:1px solid #eee;text-align:left;width:60px;">Image</th>
                <th style="padding:6px 8px;border:1px solid #eee;text-align:left;">Produit</th>
                <th style="padding:6px 8px;border:1px solid #eee;text-align:left;">Prix U.</th>
                <th style="padding:6px 8px;border:1px solid #eee;text-align:left;">Qté</th>
                <th style="padding:6px 8px;border:1px solid #eee;text-align:left;">Total</th>
              </tr>
            </thead>
            <tbody>${itemsRows}</tbody>
          </table>

          <p style="margin-top:12px;font-size:16px;"><strong>Total:</strong> ${Number(params.totalPrice).toLocaleString('fr-FR')} ${currency}</p>
          <p style="margin:0 0 16px;"><strong>Adresse de livraison:</strong> ${params.address}</p>

          <div style="margin:18px 0;">
            <a href="${BRAND.url}" style="display:block; width:100%; background:#000; color:#fff; text-decoration:none; padding:14px 16px; border-radius:10px; font-weight:700; text-align:center;">Voir la boutique</a>
          </div>

          <p style="margin:0 0 8px; font-weight:700;">Restez connecté(e)</p>
          <p style="margin:0 0 10px; color:#111827;">Suivez ${brandName} sur nos réseaux sociaux (liens aussi disponibles dans le footer du site).</p>
          <div style="display:flex; gap:10px; align-items:center; margin:6px 0 4px;">
            <a href="${SOCIAL.facebook}" style="display:inline-flex; align-items:center; justify-content:center; width:38px; height:38px; border:1px solid #e5e7eb; border-radius:999px; text-decoration:none; font-size:18px;" aria-label="Facebook">🔵</a>
            <a href="${SOCIAL.instagram}" style="display:inline-flex; align-items:center; justify-content:center; width:38px; height:38px; border:1px solid #e5e7eb; border-radius:999px; text-decoration:none; font-size:18px;" aria-label="Instagram">📸</a>
            <a href="${SOCIAL.tiktok}" style="display:inline-flex; align-items:center; justify-content:center; width:38px; height:38px; border:1px solid #e5e7eb; border-radius:999px; text-decoration:none; font-size:18px;" aria-label="TikTok">🎵</a>
            <a href="${SOCIAL.whatsapp}" style="display:inline-flex; align-items:center; justify-content:center; width:38px; height:38px; border:1px solid #e5e7eb; border-radius:999px; text-decoration:none; font-size:18px;" aria-label="WhatsApp">💬</a>
          </div>
        </td>
      </tr>
    </table>
  </div>`;

  try {
    await smtpClient.sendTransacEmail({
      sender: { email: senderEmail, name: senderName },
      subject: `Confirmation de commande ${params.orderNumber}`,
      to: [{ email: params.email }],
      htmlContent,
    } as any);
    return { ok: true };
  } catch (err) {
    return { ok: false, reason: (err as Error).message };
  }
}

export function getBrevoContactsClient() {
  const apiKey = process.env.BREVO_API_KEY;
  if (!apiKey) return null;
  const apiInstance = new Brevo.ContactsApi();
  apiInstance.setApiKey(Brevo.ContactsApiApiKeys.apiKey, apiKey);
  return apiInstance;
}

export async function createOrUpdateContact(email: string, firstName?: string, lastName?: string) {
  const contactsClient = getBrevoContactsClient();
  if (!contactsClient) return { ok: false, reason: "BREVO_API_KEY missing" };

  const attributes: Record<string, any> = {};
  if (firstName) attributes.FIRSTNAME = firstName;
  if (lastName) attributes.LASTNAME = lastName;

  // Optionally, add the contact to a list if BREVO_LIST_ID is set
  const listIdStr = process.env.BREVO_LIST_ID;
  const listIds = listIdStr ? [Number(listIdStr)] : undefined;

  try {
    await contactsClient.createContact({
      email,
      attributes,
      listIds,
      updateEnabled: true,
    } as any);
    return { ok: true };
  } catch (err) {
    // If contact exists or other issue, we swallow since it's non-blocking
    return { ok: false, reason: (err as Error).message };
  }
}

export async function sendWelcomeEmail(email: string, firstName?: string) {
  const smtpClient = getBrevoTransactionalClient();
  if (!smtpClient) return { ok: false, reason: "BREVO_API_KEY missing" };

  const senderEmail = process.env.WELCOME_SENDER_EMAIL || process.env.BREVO_SENDER_EMAIL || "no-reply@yourdomain.com";
  const brandName = BRAND.name;
  const senderName = process.env.WELCOME_SENDER_NAME || brandName;
  const brandPhone = BRAND.phone;
  const socialFacebook = SOCIAL.facebook;
  const socialInstagram = SOCIAL.instagram;
  const socialTiktok = SOCIAL.tiktok;
  const socialWhatsapp = SOCIAL.whatsapp;

  const customerName = firstName ? firstName : "cher client";

  const htmlContent = `
  <div style="font-family: Inter, Arial, sans-serif; background:#ffffff; color:#000000; padding:24px;">
    <table width="100%" cellspacing="0" cellpadding="0" style="max-width:640px; margin:0 auto; border:1px solid #e5e7eb; border-radius:16px; overflow:hidden;">
      <tr>
        <td style="padding:28px 24px; border-bottom:1px solid #e5e7eb;">
          <div style="font-size:22px; font-weight:800; letter-spacing:-0.2px;">${brandName}</div>
        </td>
      </tr>
      <tr>
        <td style="padding:28px 24px;">
          <h1 style="margin:0 0 12px; font-size:22px; line-height:1.4; font-weight:800;">Bienvenue ${customerName} 👋</h1>
          <p style="margin:0 0 12px; font-size:14px; line-height:1.7; color:#111827;">
            Merci d'avoir créé un compte sur ${brandName}. Nous sommes ravis de vous compter parmi nous.
          </p>
          <p style="margin:0 0 20px; font-size:14px; line-height:1.7; color:#111827;">
            Vous pouvez dès maintenant parcourir la boutique, ajouter vos articles préférés au panier et finaliser vos commandes.
          </p>
          <div style="margin:20px 0;">
            <a href="${BRAND.url}" style="display:block; width:100%; background:#000; color:#fff; text-decoration:none; padding:14px 16px; border-radius:10px; font-weight:700; text-align:center;">Découvrir la boutique</a>
          </div>
          <div style="margin:24px 0 8px; font-weight:700;">Restez connecté(e)</div>
          <p style="margin:0 0 16px; font-size:14px; line-height:1.7; color:#111827;">
            Suivez ${brandName} sur nos réseaux sociaux pour les nouveautés et offres. Vous retrouvez aussi tous nos liens en bas de site (footer).
          </p>
          <div style="display:flex; gap:10px; align-items:center; margin:8px 0 20px;">
            <a href="${socialFacebook}" style="display:inline-flex; align-items:center; justify-content:center; width:38px; height:38px; border:1px solid #e5e7eb; border-radius:999px; text-decoration:none; font-size:18px;" aria-label="Facebook">🔵</a>
            <a href="${socialInstagram}" style="display:inline-flex; align-items:center; justify-content:center; width:38px; height:38px; border:1px solid #e5e7eb; border-radius:999px; text-decoration:none; font-size:18px;" aria-label="Instagram">📸</a>
            <a href="${socialTiktok}" style="display:inline-flex; align-items:center; justify-content:center; width:38px; height:38px; border:1px solid #e5e7eb; border-radius:999px; text-decoration:none; font-size:18px;" aria-label="TikTok">🎵</a>
            <a href="${socialWhatsapp}" style="display:inline-flex; align-items:center; justify-content:center; width:38px; height:38px; border:1px solid #e5e7eb; border-radius:999px; text-decoration:none; font-size:18px;" aria-label="WhatsApp">💬</a>
          </div>
          <div style="margin-top:16px; padding:14px 16px; border:1px solid #e5e7eb; border-radius:12px; background:#fafafa;">
            <div style="font-size:13px; color:#111827;">Besoin d'aide ? Contactez-nous :</div>
            <div style="font-size:14px; font-weight:700; margin-top:4px;">${brandPhone}</div>
          </div>
          <p style="margin:20px 0 0; font-size:13px; color:#6b7280;">— L'équipe ${brandName}</p>
        </td>
      </tr>
    </table>
  </div>
  `;

  try {
    await smtpClient.sendTransacEmail({
      sender: { email: senderEmail, name: senderName },
      subject: `Bienvenue chez ${brandName}`,
      to: [{ email }],
      htmlContent,
    } as any);
    return { ok: true };
  } catch (err) {
    return { ok: false, reason: (err as Error).message };
  }
}
