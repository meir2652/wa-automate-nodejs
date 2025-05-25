import { create } from '@open-wa/wa-automate';
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

  client.onStreamChange((state) => {
    console.log('Stream state changed:', state);
  });

  client.onLogout(() => {
    console.log('Client logged out');
  });

  client.onQRUpdated((qrData) => {
    console.log('QR updated');
    axios.post(process.env.WEBHOOK_URL || '', {
      type: 'qr',
      qrcode: qrData,
      timestamp: new Date().toISOString(),
    }).then(() => {
      console.log('QR sent to webhook');
    }).catch(console.error);
  });
}).catch(console.error);
