import { supabase } from '../../../lib/supabaseClient';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { auth_id, ...userData } = req.body;

  if (!auth_id) {
    return res.status(400).json({ error: 'auth_id is required' });
  }

  console.log('[API] Updating user with auth_id:', auth_id);
  console.log('[API] Update data:', userData);

  try {
    // Try PostgreSQL UPDATE with RETURNING
    const { data, error } = await supabase
      .from('users')
      .update({
        display_name: userData.display_name,
        full_name: userData.full_name,
        phone_number: userData.phone_number,
        bio: userData.bio, 
        profile_image_url: userData.profile_image_url,
        updated_at: userData.updated_at
      })
      .eq('auth_id', auth_id)
      .select();

    if (error) {
      console.error('[API] Error updating user:', error);
      return res.status(500).json({ error: error.message });
    }

    console.log('[API] Update result:', data);

    // If update succeeded but returned no data, fetch the user
    if (!data || data.length === 0) {
      const { data: fetchedUser, error: fetchError } = await supabase
        .from('users')
        .select('*')
        .eq('auth_id', auth_id)
        .single();

      if (fetchError) {
        console.error('[API] Error fetching user after update:', fetchError);
        return res.status(500).json({ error: fetchError.message });
      }

      console.log('[API] Fetched user after update:', fetchedUser);
      return res.status(200).json(fetchedUser);
    }

    // Return the user data from the update query
    return res.status(200).json(data[0]);
  } catch (error) {
    console.error('[API] Unexpected error:', error);
    return res.status(500).json({ error: error.message });
  }
}
