import { create, ev } from '@open-wa/wa-automate';
import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

create({
  sessionId: 'session',
  headless: true,
  useChrome: false,
  executablePath: '',
  qrTimeout: 0,
  authTimeout: 60,
  killProcessOnBrowserClose: true,
  multiDevice: true,
  disableSpins: true,
  disableWelcome: true,
  logConsole: false,
  devtools: false,
}).then(async (client) => {
  console.log('WhatsApp API started');

  client.onStateChanged((state) => {
    console.log('State changed:', state);
  });

  client.onMessage(async (message) => {
    console.log('New message:', message);
  });

  client.onAnyMessage((message) => {
    console.log('Any message:', message);
  });

  client.onIncomingCall((call) => {
    console.log('Incoming call:', call);
  });

  client.onLogout(() => {
    console.log('Client logged out');
  });

  ev.on('qr.**', async (qrData) => {
    console.log('QR generated');
    try {
      await axios.post(process.env.WEBHOOK_URL || '', {
        type: 'qr_code',
        data: {
          qrcode: qrData,
          timestamp: new Date().toISOString(),
        }
      });
      console.log('QR sent to webhook');
    } catch (error) {
      console.error('Failed to send QR:', error.message);
    }
  });
}).catch(console.error);
