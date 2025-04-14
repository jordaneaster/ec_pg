const { createClient } = require('@supabase/supabase-js');
const QRCode = require('qrcode');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Initialize Supabase client
const supabaseUrl = "https://rzdoygryvifvcmhhbiaq.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ6ZG95Z3J5dmlmdmNtaGhiaWFxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0MjA3MTkwNCwiZXhwIjoyMDU3NjQ3OTA0fQ.3kPOo9sKdC6CsO8-7wJtzGDnUwz2JFkT1TCmpVKoMv0";
const siteUrl = "https://ec-pg.vercel.app";

if (!supabaseUrl || !supabaseKey) {
  console.error('Supabase credentials missing in environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Storage bucket details
const STORAGE_BUCKET = 'event-marketing';
const QR_FOLDER = 'qr-codes';

// Generate and upload QR code for an event
async function generateAndUploadQrCode(eventId) {
  const eventUrl = `${siteUrl}/events/${eventId}`;
  const fileName = `event-${eventId}.png`;
  const filePath = `${QR_FOLDER}/${fileName}`;
  
  try {
    // Generate QR code as buffer
    const qrBuffer = await QRCode.toBuffer(eventUrl, {
      color: {
        dark: '#000',
        light: '#FFF'
      },
      width: 300,
      margin: 1
    });
    
    // Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase
      .storage
      .from(STORAGE_BUCKET)
      .upload(filePath, qrBuffer, {
        contentType: 'image/png',
        upsert: true // Overwrite if exists
      });
    
    if (uploadError) {
      throw uploadError;
    }
    
    // Get the public URL
    const { data: publicUrlData } = supabase
      .storage
      .from(STORAGE_BUCKET)
      .getPublicUrl(filePath);
    
    const publicUrl = publicUrlData.publicUrl;
    
    // Update the event record with the QR code URL
    const { data: updateData, error: updateError } = await supabase
      .from('events')
      .update({ static_qr_code: publicUrl })
      .eq('id', eventId);
    
    if (updateError) {
      throw updateError;
    }
    
    console.log(`QR code generated and uploaded for event ${eventId}: ${publicUrl}`);
    return { success: true, url: publicUrl };
  } catch (error) {
    console.error(`Failed to process QR code for event ${eventId}:`, error);
    return { success: false, error };
  }
}

// Check if QR code already exists in Supabase for an event
async function checkQrCodeExists(eventId) {
  try {
    // Check if the event already has a QR code URL in the database
    const { data, error } = await supabase
      .from('events')
      .select('static_qr_code')
      .eq('id', eventId)
      .single();
    
    if (error) {
      throw error;
    }
    
    return data && data.static_qr_code && data.static_qr_code.length > 0;
  } catch (error) {
    console.error(`Error checking QR code existence for event ${eventId}:`, error);
    return false;
  }
}

// Generate QR codes for all events
async function generateAllQrCodes() {
  try {
    // Fetch all events from Supabase
    const { data: events, error } = await supabase
      .from('events')
      .select('id, static_qr_code');
    
    if (error) {
      throw error;
    }
    
    console.log(`Found ${events.length} events in database`);
    
    // Generate QR codes for all events
    const results = await Promise.all(
      events.map(async (event) => {
        const hasQrCode = await checkQrCodeExists(event.id);
        
        if (hasQrCode) {
          console.log(`QR code already exists for event ${event.id}`);
          return { eventId: event.id, generated: false, alreadyExists: true };
        } else {
          const result = await generateAndUploadQrCode(event.id);
          return { 
            eventId: event.id, 
            generated: result.success, 
            alreadyExists: false,
            url: result.success ? result.url : null
          };
        }
      })
    );
    
    // Print summary
    const generated = results.filter(r => r.generated).length;
    const alreadyExisted = results.filter(r => r.alreadyExists).length;
    const failed = results.filter(r => !r.generated && !r.alreadyExists).length;
    
    console.log(`
QR Code Generation Summary:
  Total events: ${events.length}
  QR codes generated: ${generated}
  QR codes already existed: ${alreadyExisted}
  Failed to generate: ${failed}
`);
    
  } catch (error) {
    console.error('Error generating QR codes:', error);
    process.exit(1);
  }
}

// Execute the script
generateAllQrCodes()
  .then(() => {
    console.log('QR code generation completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Uncaught error:', error);
    process.exit(1);
  });
