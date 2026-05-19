export const escapeHtml = (value: unknown) =>
  String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');

export function masterLayout(contentHTML: string): string {
  return `
  <!DOCTYPE html>
  <html lang="es">
  <head>
    <meta charset="UTF-8">
    <style>
      body { margin: 0; padding: 0; background-color: #040e1f; color: #ffffff; font-family: Arial, sans-serif; -webkit-font-smoothing: antialiased; }
      .container { max-width: 600px; margin: 0 auto; background-color: #040e1f; }
      .header { text-align: center; padding: 30px 20px; background-color: #010b10; border-bottom: 2px solid #06CFD6; }
      .content { padding: 40px 20px; color: #e2e8f0; line-height: 1.6; }
      .footer { text-align: center; padding: 30px 20px; background-color: #010b10; font-size: 12px; color: #94a3b8; }
      .footer a { color: #06CFD6; text-decoration: none; margin: 0 10px; }
      .button { display: inline-block; padding: 14px 28px; background-color: #06CFD6; color: #010b10; text-decoration: none; font-weight: bold; border-radius: 4px; margin-top: 20px; }
      .card { background-color: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; padding: 20px; margin: 20px 0; }
      .highlight { color: #06CFD6; font-weight: bold; }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        <img src="https://www.bytecode.com.pe/vectors/designs/elemento_logo.svg" alt="Bytecode Logo" width="180" style="display: block; margin: 0 auto; max-width: 100%;">
      </div>
      <div class="content">
        ${contentHTML}
      </div>
      <div class="footer">
        <p>
          <a href="https://www.bytecode.com.pe/condiciones">Términos y Condiciones</a> | 
          <a href="https://www.bytecode.com.pe/privacidad">Política de Privacidad</a>
        </p>
        <p>&copy; ${new Date().getFullYear()} Bytecode. Todos los derechos reservados.</p>
      </div>
    </div>
  </body>
  </html>
  `;
}

export function buildAdminNotification(subject: string, payload: Record<string, unknown>): string {
  const rows = Object.entries(payload)
    .map(([key, value]) => `<tr><td style="padding: 10px; border-bottom: 1px solid rgba(255,255,255,0.1);"><strong style="color: #06CFD6;">${escapeHtml(key)}</strong></td><td style="padding: 10px; border-bottom: 1px solid rgba(255,255,255,0.1);">${escapeHtml(value)}</td></tr>`)
    .join('');

  const content = `
    <h2 style="color: #ffffff; margin-top: 0;">${escapeHtml(subject)}</h2>
    <div class="card">
      <table style="width: 100%; border-collapse: collapse; text-align: left; font-size: 14px;">
        ${rows}
      </table>
    </div>
    <div style="text-align: center;">
      <a href="https://www.bytecode.com.pe/admin" class="button">Ir al Panel Admin</a>
    </div>
  `;
  return masterLayout(content);
}

export function buildContactReceipt(name: string, lastName: string, caseCode: string, service: string, message: string): string {
  const content = `
    <h2 style="color: #ffffff; margin-top: 0;">¡Hola <span class="highlight">${escapeHtml(name)} ${escapeHtml(lastName)}</span>!</h2>
    <p>Hemos recibido tu mensaje correctamente. Nuestro equipo lo está revisando y nos pondremos en contacto contigo a la brevedad.</p>
    
    <div style="text-align: center; margin: 30px 0;">
      <p style="font-size: 14px; margin: 0; color: #94a3b8;">Tu código de ticket es:</p>
      <div style="display: inline-block; background-color: rgba(6, 207, 214, 0.1); border: 1px solid #06CFD6; padding: 10px 20px; border-radius: 4px; font-size: 20px; font-weight: bold; color: #06CFD6; letter-spacing: 1px; margin-top: 8px;">
        ${escapeHtml(caseCode)}
      </div>
    </div>

    <div class="card">
      <h3 style="color: #ffffff; margin-top: 0; font-size: 16px;">Resumen de tu solicitud</h3>
      <p><strong style="color: #06CFD6;">Servicio de interés:</strong> ${escapeHtml(service)}</p>
      <blockquote style="margin: 0; padding-left: 15px; border-left: 4px solid #06CFD6; font-style: italic; color: #cbd5e1;">
        "${escapeHtml(message)}"
      </blockquote>
    </div>
    <p>Gracias por confiar en Bytecode como tu socio tecnológico.</p>
  `;
  return masterLayout(content);
}

export function buildComplaintReceipt(names: string, complaintCode: string): string {
  const content = `
    <h2 style="color: #ffffff; margin-top: 0;">Constancia de Reclamo</h2>
    <p>Estimado/a <span class="highlight">${escapeHtml(names)}</span>,</p>
    <p>Por medio de la presente, confirmamos la recepción formal de su reclamo o queja en nuestro Libro de Reclamaciones Virtual.</p>
    
    <div style="text-align: center; margin: 30px 0;">
      <p style="font-size: 14px; margin: 0; color: #94a3b8;">Código de Seguimiento:</p>
      <div style="display: inline-block; background-color: rgba(6, 207, 214, 0.1); border: 1px solid #06CFD6; padding: 10px 20px; border-radius: 4px; font-size: 20px; font-weight: bold; color: #06CFD6; letter-spacing: 1px; margin-top: 8px;">
        ${escapeHtml(complaintCode)}
      </div>
    </div>

    <div class="card">
      <p style="margin: 0; font-size: 14px; color: #cbd5e1;">Según lo establecido por la normativa vigente, estaremos brindándole una respuesta en el plazo de ley estipulado. Adjuntamos a este correo los detalles remitidos para su control y seguimiento.</p>
    </div>
    <p>Atentamente,<br><strong>El Equipo de Atención al Cliente - Bytecode</strong></p>
  `;
  return masterLayout(content);
}
