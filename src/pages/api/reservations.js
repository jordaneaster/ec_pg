import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client with service role key for server operations
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://rzdoygryvifvcmhhbiaq.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const reservationData = req.body;
    
    // Validate required fields
    if (!reservationData.id || !reservationData.event_id || !reservationData.full_name || 
        !reservationData.email || !reservationData.phone || !reservationData.num_tickets) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Make sure expiration_time is set
    if (!reservationData.expiration_time) {
      const now = new Date();
      reservationData.expiration_time = new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString();
    }
    
    // Ensure QR code URL follows the correct format if it's not already set
    if (!reservationData.qr_code_url) {
      reservationData.qr_code_url = `${supabaseUrl}/storage/v1/object/public/event-marketing/qr-codes/event-${reservationData.event_id}/${reservationData.id}.png`;
    }

    // Include user_id if available
    if (req.headers.authorization) {
      try {
        // Extract the token
        const token = req.headers.authorization.split(' ')[1];
        
        // Verify the token
        const { data: { user }, error } = await supabase.auth.getUser(token);
        
        if (user && !error) {
          reservationData.user_id = user.id;
        }
      } catch (error) {
        console.error('Error extracting user from token:', error);
        // Continue without user_id
      }
    }

    console.log("Saving reservation with ID:", reservationData.id);
    console.log("QR code URL:", reservationData.qr_code_url);
    
    // Save to Supabase
    const { data, error } = await supabase
      .from('reservations')
      .insert([reservationData])
      .select();

    if (error) {
      console.error('Error saving reservation to Supabase:', error);
      return res.status(500).json({ 
        message: 'Failed to save reservation',
        error: error
      });
    }

    console.log("Reservation saved successfully:", data[0].id);

    return res.status(200).json({ 
      success: true, 
      reservationId: reservationData.id,
      qrCodeUrl: reservationData.qr_code_url,
      data: data[0]
    });
  } catch (error) {
    console.error('Error processing reservation:', error);
    return res.status(500).json({ 
      message: 'Failed to process reservation',
      error: error.message || String(error)
    });
  }
}
