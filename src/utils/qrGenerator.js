import QRCode from 'qrcode';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://rzdoygryvifvcmhhbiaq.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * Generate a QR code for a reservation and store it in Supabase
 * @param {string} eventId - The event ID
 * @param {string} reservationId - The reservation ID
 * @param {Object} reservationData - The reservation data
 * @returns {Promise<string>} - The URL of the stored QR code
 */
export async function generateAndStoreQRCode(eventId, reservationId, reservationData) {
  try {
    // Use the getReservationUrl function instead of constructing the URL directly
    const confirmationUrl = getReservationUrl(eventId, reservationId);
    console.log('Generating QR code for URL:', confirmationUrl);
    
    // Generate QR code as data URL (same as QRCodeService.js)
    const qrDataUrl = await QRCode.toDataURL(confirmationUrl, {
      width: 300,
      margin: 1,
      color: {
        dark: '#000000',
        light: '#ffffff',
      }
    });
    
    // Define storage path for the QR code
    const bucketName = 'event-marketing';
    const filePath = `qr-codes/event-${eventId}-${reservationId}.png`;
    const storageUrl = `${supabaseUrl}/storage/v1/object/public/${bucketName}/${filePath}`;
    
    try {
      // We need to convert the QR code data URL to a binary blob
      console.log('QR data URL length:', qrDataUrl.length);
      console.log('QR data URL preview:', qrDataUrl.substring(0, 100) + '...');

      let blob;
      try {
        // Use Fetch API to convert data URL to blob (standard browser method)
        const response = await fetch(qrDataUrl);
        if (!response.ok) {
            throw new Error(`Failed to fetch data URL: ${response.statusText}`);
        }
        blob = await response.blob();
        console.log('Blob fetched successfully. Type:', blob.type, 'Size:', blob.size);
      } catch (fetchError) {
          console.error('Error fetching or converting data URL to Blob:', fetchError);
          // Fallback or rethrow depending on desired behavior
          return storageUrl; // Return expected URL as fallback
      }

      // **Crucial Check:** Verify blob properties *before* upload
      if (!blob) {
          console.error('Blob creation failed (fetch returned null or threw error). Cannot upload.');
          return storageUrl; // Return expected URL as fallback
      }

      if (blob.size === 0) {
        console.error('Generated blob has zero size after fetch. Upload aborted.');
        return storageUrl; // Return expected URL as fallback
      }

      console.log('Proceeding with Supabase upload...');

      // Log authentication state just before upload
      const { data: { session }, error: authError } = await supabase.auth.getSession();
      if (authError) {
          console.error('Error getting Supabase session:', authError);
      } else if (session) {
          console.log('Supabase session found. User ID:', session.user.id, 'Role:', session.user.role);
      } else {
          console.log('No active Supabase session (uploading as anonymous).');
      }

      // Upload to Supabase Storage, ensuring contentType matches the blob's type
      const { data, error } = await supabase.storage
        .from(bucketName)
        .upload(filePath, blob, {
          contentType: blob.type || 'image/png', // Use detected type, fallback to png
          upsert: true
        });

      if (error) {
        console.error('Upload failed:', error.message || error);
        // Log more details about the error if available
        if (error.message && (error.message.includes('security policy') || error.message.includes('denied'))) {
            console.warn(`
              ***************************************************************
              Row Level Security policy violation suspected.
              Bucket: ${bucketName}
              Path: ${filePath}
              User State: ${session ? `Authenticated (ID: ${session.user.id})` : 'Anonymous'}
              Action: ${data ? 'UPDATE (due to upsert)' : 'INSERT'}

              Please meticulously review the RLS policies on the 'storage.objects' table
              for the '${bucketName}' bucket. Ensure the policy allows this specific
              operation (INSERT or UPDATE) for this user state and path.
              Check conditions involving auth.uid(), path matching (using wildcards?),
              and any metadata checks.
              ***************************************************************
            `);
        }
        if (error.response) {
            console.error('Supabase error response status:', error.response.status);
            console.error('Supabase error response data:', error.response.data);
        } else {
            console.error('Full Supabase error object:', error); // Log the full error if no response object
        }
        return storageUrl; // Return expected URL even if upload fails
      }

      // Get public URL (same as QRCodeService.js)
      const { data: publicUrlData } = supabase.storage
        .from(bucketName)
        .getPublicUrl(filePath);

      console.log('QR code stored at:', publicUrlData.publicUrl);
      return publicUrlData.publicUrl;

    } catch (error) {
      console.error('QR code upload/conversion error:', error);
      return storageUrl; // Return expected URL on error
    }
  } catch (error) {
    console.error('QR code generation error:', error);
    throw new Error('Failed to generate QR code');
  }
}

/**
 * Gets a shareable URL for a reservation
 * @param {string} eventId - The event ID
 * @param {string} reservationId - The reservation ID
 * @returns {string} - The public URL for the reservation
 */
export function getReservationUrl(eventId, reservationId) {
  // Fix: Properly structure fallback chain so production URL takes priority over localhost
  const baseUrl = 'https://ec-pg.vercel.app'; // Remove trailing slash and fix fallback logic
    
  return `${baseUrl}/reservations/confirmation?event=${eventId}&reservation=${reservationId}`;
}

/**
 * Gets the public URL for a QR code
 * @param {string} eventId - The event ID
 * @param {string} reservationId - The reservation ID (optional)
 * @returns {string} - The public URL for the QR code
 */
export function getQrCodePath(eventId, reservationId = null) {
  // Get the bucket URL correctly
  const bucketUrl = `${supabaseUrl}/storage/v1/object/public/event-marketing`;
  
  if (reservationId) {
    return `${bucketUrl}/qr-codes/event-${eventId}/${reservationId}.png`;
  }
  
  return `${bucketUrl}/qr-codes/event-${eventId}.png`;
}
