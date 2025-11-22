// Backend/src/utils/emailService.js
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

// Configuración de Gmail
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS // IMPORTANTE: Usar "App Password", no tu contraseña normal
  }
});

export const sendVerificationEmail = async (email, token) => {
  // El link apuntará a tu Frontend, que luego llamará al Backend
  const verificationUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/verify-email/${token}`;

  const mailOptions = {
    from: '"VS Wiki Battle ETEC" <no-reply@vswiki.com>',
    to: email,
    subject: '⚔️ Verifica tu cuenta - VS Wiki Battle',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #3498db;">Bienvenido a la Batalla</h1>
        <p>Gracias por registrarte. Para activar tu cuenta y comenzar a crear personajes, por favor verifica tu correo electrónico.</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${verificationUrl}" style="background-color: #3498db; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">Verificar Email</a>
        </div>
        <p>Si el botón no funciona, copia y pega este enlace:</p>
        <p>${verificationUrl}</p>
      </div>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`📧 Correo de verificación enviado a ${email}`);
  } catch (error) {
    console.error('❌ Error enviando email:', error);
  }
};