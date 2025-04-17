import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { user_id, ...userData } = req.body;
    
    if (!user_id) {
      return res.status(400).json({ message: 'User ID is required' });
    }

    // Validate that the user has permission to update this profile
    // TODO: Add authentication check using auth token from request headers

    const { data, error } = await supabase
      .from('users')
      .update(userData)
      .eq('user_id', user_id)
      .select();

    if (error) {
      console.error('Error updating user profile:', error);
      return res.status(500).json({ 
        message: 'Failed to update user profile',
        error: error
      });
    }

    return res.status(200).json({ 
      success: true, 
      data: data[0]
    });
  } catch (error) {
    console.error('Error processing request:', error);
    return res.status(500).json({ 
      message: 'Failed to process request',
      error: error.message || String(error)
    });
  }
}
