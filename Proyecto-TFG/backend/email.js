const nodemailer = require('nodemailer');

const SMTP_HOST = process.env.SMTP_HOST || 'smtp.gmail.com';
const SMTP_PORT = parseInt(process.env.SMTP_PORT || '587');
const SMTP_USER = process.env.SMTP_USER || 'academialoranca22@gmail.com';
const SMTP_PASS = process.env.SMTP_PASS || '';
const FROM_ADDR = process.env.FROM_ADDR || SMTP_USER;

let transporter = null;

function getTransporter() {
  if (transporter) return transporter;
  if (!SMTP_PASS) return null;
  transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: SMTP_PORT,
    secure: SMTP_PORT === 465,
    auth: { user: SMTP_USER, pass: SMTP_PASS }
  });
  return transporter;
}

async function sendResetCode(email, code) {
  console.log(`\n  [EMAIL] Código de verificación para ${email}: ${code}`);
  const t = getTransporter();
  if (!t) {
    console.log(`  [EMAIL] Configura SMTP_PASS para enviar emails reales\n`);
    return false;
  }
  try {
    await t.sendMail({
      from: FROM_ADDR,
      to: email,
      subject: 'Código de recuperación - Academia Loranca',
      html: `
        <div style="font-family:Arial,sans-serif;max-width:480px;margin:auto;padding:30px">
          <div style="text-align:center;margin-bottom:24px">
            <img src="https://academialoranca.com/imagenes/logo.png" alt="Academia Loranca" style="width:72px">
            <h2 style="color:#1e293b;margin:12px 0 4px">Recuperación de contraseña</h2>
            <p style="color:#64748b;font-size:14px;margin:0">Academia Loranca</p>
          </div>
          <div style="background:#f8faff;border-radius:16px;padding:28px;text-align:center;border:1px solid #e2e8f0">
            <p style="color:#475569;font-size:15px;margin:0 0 16px">Tu código de verificación es:</p>
            <div style="font-size:36px;font-weight:800;letter-spacing:8px;color:#2a17cf;background:#fff;padding:16px;border-radius:12px;border:2px dashed #c7d2fe;font-family:monospace">${code}</div>
            <p style="color:#94a3b8;font-size:13px;margin:16px 0 0">Este código expira en 15 minutos.</p>
          </div>
          <p style="color:#94a3b8;font-size:12px;text-align:center;margin-top:20px">Si no solicitaste este cambio, ignora este mensaje.</p>
        </div>
      `
    });
    console.log(`  [EMAIL] Código enviado correctamente a ${email}\n`);
    return true;
  } catch (err) {
    console.error(`  [EMAIL] Error al enviar a ${email}: ${err.message}\n`);
    return false;
  }
}

module.exports = { sendResetCode };
