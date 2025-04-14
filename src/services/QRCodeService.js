import QRCode from 'qrcode';
import { supabase } from '../lib/supabaseClient.js';
import { v4 as uuidv4 } from 'uuid';

export class QRCodeService {
  static async generateEventQR(eventId, shouldUpload = false) {
    try {
      // Generate the URL for the event check-in page
      const eventUrl = `${process.env.NEXT_PUBLIC_BASE_URL || 'https://yourdomain.com'}/checkin/${eventId}`;
      
      // Generate QR code as data URL
      const qrDataUrl = await QRCode.toDataURL(eventUrl, {
        width: 400,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#ffffff',
        }
      });
      
      // Convert data URL to Buffer
      const base64Data = qrDataUrl.replace(/^data:image\/png;base64,/, '');
      const qrBuffer = Buffer.from(base64Data, 'base64');
      
      // Upload to Supabase Storage if requested
      if (shouldUpload) {
        const fileName = `event-${eventId}-${uuidv4()}.png`;
        const filePath = `qr-codes/${fileName}`;
        
        // Upload to Supabase storage with correct bucket name
        const { data, error } = await supabase.storage
          .from('event') // Updated bucket name to match your URL
          .upload(filePath, qrBuffer, {
            contentType: 'image/png',
            upsert: true
          });
          
        if (error) {
          throw new Error(`Failed to upload QR code: ${error.message}`);
        }
        
        // Get public URL for the uploaded file
        const { data: publicUrlData } = supabase.storage
          .from('event') // Updated bucket name to match your URL
          .getPublicUrl(filePath);
          
        return publicUrlData.publicUrl;
      }
      
      return qrDataUrl; // Return data URL if not uploading
    } catch (error) {
      console.error('Error generating QR code:', error);
      throw error;
    }
  }
}
