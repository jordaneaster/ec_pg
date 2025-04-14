// Script to generate QR codes for all existing events in the database

import { supabase } from '../lib/supabaseClient.js';
import { QRCodeService } from '../services/QRCodeService.js';

async function generateMissingQRCodes() {
  try {
    console.log('Fetching events without QR codes...');
    
    // Fetch all events that don't have a QR code
    const { data: events, error } = await supabase
      .from('events')
      .select('*')
      .is('static_qr_code', null);
    
    if (error) {
      console.error('Error fetching events:', error);
      return;
    }
    
    console.log(`Found ${events.length} events without QR codes.`);
    
    if (events.length === 0) {
      console.log('No QR codes need to be generated.');
      return;
    }
    
    // Generate QR codes for each event and upload to Supabase storage
    const results = [];
    
    for (const event of events) {
      try {
        console.log(`Generating QR code for event: ${event.title} (ID: ${event.id})`);
        
        // Generate and upload QR code, then update database
        const storageUrl = await QRCodeService.generateEventQR(event.id, true);
        
        // Update the event record with the storage URL
        const { error: updateError } = await supabase
          .from('events')
          .update({ static_qr_code: storageUrl })
          .eq('id', event.id);
          
        if (updateError) {
          throw new Error(`Error updating event record: ${updateError.message}`);
        }
        
        console.log(`✓ QR code generated and stored at: ${storageUrl}`);
        results.push({ 
          eventId: event.id, 
          eventTitle: event.title,
          success: true, 
          qrUrl: storageUrl 
        });
      } catch (err) {
        console.error(`× Failed to generate QR code for event ${event.id}:`, err);
        results.push({ 
          eventId: event.id, 
          eventTitle: event.title, 
          success: false, 
          error: err.message 
        });
      }
    }
    
    // Print summary
    console.log('\n--- QR Code Generation Summary ---');
    console.log(`Total events processed: ${events.length}`);
    console.log(`Successfully generated: ${results.filter(r => r.success).length}`);
    console.log(`Failed: ${results.filter(r => !r.success).length}`);
    
    if (results.filter(r => !r.success).length > 0) {
      console.log('\nFailed events:');
      results.filter(r => !r.success).forEach(result => {
        console.log(`- ${result.eventTitle} (ID: ${result.eventId}): ${result.error}`);
      });
    }
    
  } catch (err) {
    console.error('Unexpected error during QR code generation:', err);
  } finally {
    // Close any open connections
    process.exit(0);
  }
}

// Execute the function
generateMissingQRCodes();

