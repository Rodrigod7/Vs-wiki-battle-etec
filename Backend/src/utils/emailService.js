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
  // El link apunta DIRECTO al backend — funciona desde cualquier dispositivo
  const backendUrl = process.env.BACKEND_URL || `http://localhost:${process.env.PORT || 4000}`;
  const verificationUrl = `${backendUrl}/api/auth/verify-email-page/${token}`;

  const mailOptions = {
    from: '"VS Wiki Battle ETEC" <no-reply@vswiki.com>',
    to: email,
    subject: '⚔️ Verifica tu cuenta - VS Wiki Battle',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0a0a1a; padding: 30px; border-radius: 15px;">
        <h1 style="color: #64ffda; text-align: center;">⚔️ VS Wiki Battle ETEC</h1>
        <p style="color: #ccd6f6; font-size: 16px;">Gracias por registrarte. Para activar tu cuenta y comenzar a crear personajes, verifica tu correo electrónico.</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${verificationUrl}" style="background: linear-gradient(135deg, #64ffda, #4dd4ac); color: #0a0a1a; padding: 14px 32px; text-decoration: none; border-radius: 10px; font-weight: bold; font-size: 16px; display: inline-block;">✅ Verificar Email</a>
        </div>
        <p style="color: #8892b0; font-size: 13px;">Si el botón no funciona, copia y pega este enlace en tu navegador:</p>
        <p style="color: #64ffda; font-size: 12px; word-break: break-all;">${verificationUrl}</p>
        <hr style="border-color: rgba(100,255,218,0.2); margin: 20px 0;" />
        <p style="color: #555; font-size: 11px; text-align: center;">Si no creaste esta cuenta, ignora este mensaje.</p>
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