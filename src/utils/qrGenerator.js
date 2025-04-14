import QRCode from 'qrcode';
import fs from 'fs';
import path from 'path';

// Ensure the QR directory exists
const ensureQrDirExists = () => {
  const qrDirectory = path.join(process.cwd(), 'public', 'qrcodes');
  if (!fs.existsSync(qrDirectory)) {
    fs.mkdirSync(qrDirectory, { recursive: true });
  }
  return qrDirectory;
};

/**
 * Generate a QR code for an event and save it to the public directory
 * @param {string} eventId - The ID of the event
 * @param {string} baseUrl - The base URL of the site (optional, defaults to env var)
 * @returns {string} The path to the generated QR code
 */
export const generateEventQrCode = async (eventId, baseUrl) => {
  try {
    const siteUrl = baseUrl || process.env.NEXT_PUBLIC_SITE_URL || 'https://your-site-url.com';
    const eventUrl = `${siteUrl}/events/${eventId}`;
    
    const qrDirectory = ensureQrDirExists();
    const qrFilePath = path.join(qrDirectory, `event-${eventId}.png`);
    const publicPath = `/qrcodes/event-${eventId}.png`;
    
    // Generate QR code
    await QRCode.toFile(qrFilePath, eventUrl, {
      color: {
        dark: '#000',  // QR code color
        light: '#FFF'  // Background color
      },
      width: 300,
      margin: 1
    });
    
    return publicPath;
  } catch (error) {
    console.error('Error generating QR code:', error);
    throw error;
  }
};

/**
 * Check if a QR code already exists for an event
 * @param {string} eventId - The ID of the event
 * @returns {boolean} Whether the QR code exists
 */
export const qrCodeExists = (eventId) => {
  const qrPath = path.join(process.cwd(), 'public', 'qrcodes', `event-${eventId}.png`);
  return fs.existsSync(qrPath);
};

/**
 * Get the public path to a QR code for an event
 * @param {string} eventId - The ID of the event
 * @returns {string|null} The path to the QR code or null if it doesn't exist
 */
export const getQrCodePath = (eventId) => {
  if (qrCodeExists(eventId)) {
    return `/qrcodes/event-${eventId}.png`;
  }
  return null;
};
