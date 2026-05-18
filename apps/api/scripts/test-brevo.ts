import { sendCustomerAcknowledgement } from '../src/services/email.js';

async function runTest() {
  console.log('--- INICIANDO PRUEBA DE INTEGRACIÓN BREVO SMTP ---');
  
  try {
    await sendCustomerAcknowledgement(
      'bytecodesw@gmail.com',
      '🚀 Prueba de Integración Exitosa - Brevo SMTP',
      '<h3>Migración Completada</h3><p>El servidor de Render ahora se comunica fluidamente con Brevo Transactional.</p>',
      'system'
    );
    console.log('✅ Prueba completada. Revisa los logs de Nodemailer para ver el messageId.');
  } catch (error) {
    console.error('❌ Error en la prueba de integración:', error);
  }
}

runTest().then(() => process.exit(0)).catch(() => process.exit(1));
