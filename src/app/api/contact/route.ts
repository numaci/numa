import { NextResponse } from 'next/server';
import * as brevo from '@getbrevo/brevo';

export async function POST(request: Request) {
  // 1. Valider et extraire les données du formulaire
  const { name, email, phone, message } = await request.json();

  if (!name || !email || !message) {
    return NextResponse.json({ error: 'Les champs nom, email et message sont obligatoires.' }, { status: 400 });
  }

  // 2. Configurer l'API Brevo
  const apiInstance = new brevo.TransactionalEmailsApi();
  apiInstance.setApiKey(brevo.TransactionalEmailsApiApiKeys.apiKey, process.env.BREVO_API_KEY!);

  const sendSmtpEmail = new brevo.SendSmtpEmail();

  // 3. Construire l'e-mail
  sendSmtpEmail.subject = 'Nouveau message depuis la page contact NUMA';
  sendSmtpEmail.htmlContent = `
    <html>
      <body>
        <h2>Nouveau message reçu depuis le site NUMA</h2>
        <p><strong>Nom :</strong> ${name}</p>
        <p><strong>Email :</strong> <a href="mailto:${email}">${email}</a></p>
        <p><strong>Téléphone :</strong> ${phone || 'Non fourni'}</p>
        <hr />
        <h3>Message :</h3>
        <p style="white-space: pre-wrap;">${message}</p>
      </body>
    </html>
  `;
  // IMPORTANT : L'email de l'expéditeur doit être un domaine vérifié dans votre compte Brevo
  sendSmtpEmail.sender = { name: name, email: 'contact@numa-sugu.com' }; 
  sendSmtpEmail.to = [{ email: 'numa7433@gmail.com', name: 'Admin NUMA' }];
  
  // 4. Envoyer l'e-mail
  try {
    const data = await apiInstance.sendTransacEmail(sendSmtpEmail);
    console.log('API called successfully. Returned data: ', JSON.stringify(data));
    return NextResponse.json({ success: true, message: 'Message envoyé avec succès !' });
  } catch (error) {
    console.error('Erreur API Brevo:', error);
    return NextResponse.json({ error: 'Échec de l\envoi du message.' }, { status: 500 });
  }
}
