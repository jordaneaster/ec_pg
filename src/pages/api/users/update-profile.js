// Import createClient from Supabase SDK
import { createClient } from '@supabase/supabase-js';

// Ensure environment variables are loaded (Next.js does this automatically)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
// IMPORTANT: Use the Service Role Key for server-side admin actions
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Create a Supabase client instance using the Service Role Key
// This client bypasses RLS policies. Use with caution.
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { auth_id, ...userData } = req.body;

  if (!auth_id) {
    return res.status(400).json({ error: 'auth_id is required' });
  }

  // **Security Note**: In a real app, you might want to verify
  // that the request comes from an authenticated user who is
  // authorized to update this profile, perhaps by validating a session token.
  // For now, we trust that the frontend sends the correct auth_id for the logged-in user.

  console.log('[API - Admin] Updating user with auth_id:', auth_id);
  console.log('[API - Admin] Update data:', userData);

  // Prepare data for update
  const updateData = {
    ...userData,
    updated_at: new Date().toISOString(),
  };
  delete updateData.auth_id;
  delete updateData.created_at;
  delete updateData.email; // Email shouldn't be updated here typically

  try {
    // Use the supabaseAdmin client (with service role) for the update
    const { data, error } = await supabaseAdmin
      .from('users')
      .update(updateData)
      .eq('auth_id', auth_id)
      .select()
      .single();

    if (error) {
      console.error('[API - Admin] Error updating user:', error);
      // Check if the error is specifically "Not Found" even with service key
      if (error.code === 'PGRST116') {
        console.error(`[API - Admin] User with auth_id ${auth_id} truly not found in DB.`);
        return res.status(404).json({ error: 'User not found' });
      }
      // Handle other potential errors (e.g., database constraints)
      return res.status(500).json({ error: error.message });
    }

    // If data is null after a successful update without error (shouldn't happen with .select().single())
    if (!data) {
        console.error('[API - Admin] Update seemed successful but no data returned.');
        return res.status(500).json({ error: 'Failed to retrieve updated user data.' });
    }

    console.log('[API - Admin] Update successful, returned data:', data);
    return res.status(200).json(data); // Return the updated user data

  } catch (error) {
    // Catch unexpected errors during the process
    console.error('[API - Admin] Unexpected error:', error);
    return res.status(500).json({ error: error.message || 'An unexpected error occurred' });
  }
}
