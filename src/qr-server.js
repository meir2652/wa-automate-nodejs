const { create, ev } = require('@open-wa/wa-automate');
const axios = require('axios');
require('dotenv').config();

create({
  sessionId: 'meir-session',
  multiDevice: true,
  headless: true,
  useChrome: false,
  qrTimeout: 0,
  authTimeout: 60,
  restartOnCrash: true,
  qrLogSkip: true,
  blockCrashLogs: true,
  disableSpins: true,
  eventMode: true,
  puppeteer: {
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-gpu',
      '--disable-dev-shm-usage',
      '--no-first-run',
      '--no-zygote',
      '--single-process',
      '--disable-web-security'
    ]
  }
}).then(async client => {
  console.log('✅ WhatsApp client created');

  ev.on('qr.**', async qr => {
    console.log('📤 QR received, sending to webhook...');
    try {
      await axios.post(process.env.WEBHOOK_URL, {
        type: 'qr_code',
        data: {
          qrcode: qr,
          timestamp: new Date().toISOString()
        }
      });
      console.log('✅ QR sent to webhook');
    } catch (err) {
      console.error('❌ Failed to send QR:', err.message);
    }
  });

  client.onStateChanged(async state => {
    console.log('State changed:', state);
    try {
      await axios.post(process.env.WEBHOOK_URL, {
        type: 'connection_status',
        data: {
          status: state,
          timestamp: new Date().toISOString()
        }
      });
    } catch (err) {
      console.error('❌ Failed to send status:', err.message);
    }
  });
});
