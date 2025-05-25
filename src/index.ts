import { create, ev } from '@open-wa/wa-automate';
import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const WEBHOOK_URL = process.env.WEBHOOK_URL;

if (!WEBHOOK_URL) {
  console.error('❌ Missing WEBHOOK_URL in environment variables');
  process.exit(1);
}

create({
  sessionId: 'session',
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
      '--disable-web-security',
    ],
  },
}).then(async (client) => {
  console.log('✅ WhatsApp client created successfully');

  // QR EVENT - send to webhook
  ev.on('qr.**', async (qr) => {
    console.log('📤 QR code generated. Sending to webhook...');
    try {
      await axios.post(WEBHOOK_URL, {
        type: 'qr_code',
        data: {
          qrcode: qr,
          timestamp: new Date().toISOString(),
        },
      });
      console.log('✅ QR code sent to webhook');
    } catch (err: any) {
      console.error('❌ Failed to send QR code to webhook:', err.message);
    }
  });

  // STATE CHANGE EVENT
  client.onStateChanged(async (state) => {
    console.log('ℹ️ State changed:', state);
    try {
      await axios.post(WEBHOOK_URL, {
        type: 'connection_status',
        data: {
          status: state,
          timestamp: new Date().toISOString(),
        },
      });
    } catch (err: any) {
      console.error('❌ Failed to send status to webhook:', err.message);
    }
  });
}).catch((err) => {
  console.error('❌ Error during WhatsApp client creation:', err.message);
  process.exit(1);
});

// הכרחי כדי למנוע שגיאת "is not a module"
export {};
