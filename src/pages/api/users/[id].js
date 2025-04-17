import { createClient } from '@supabase/supabase-js';

// Initialize the Supabase client directly in the API route
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

export default async function handler(req, res) {
  const { id } = req.query;
  console.log('API route /api/users/[id] called with id:', id);
  
  // Handle GET request to fetch user profile
  if (req.method === 'GET') {
    try {
      // Fetch the user from the database
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('auth_id', id)
        .single();
      
      if (error) {
        if (error.code === 'PGRST116') {
          // No user found with this auth_id
          console.log(`User not found with auth_id: ${id}`);
          return res.status(404).json({ error: 'User not found' });
        }
        console.error('Supabase error fetching user:', error);
        throw error;
      }
      
      console.log('User fetched successfully:', data);
      return res.status(200).json(data);
    } catch (error) {
      console.error('Error fetching user:', error);
      return res.status(500).json({ error: error.message || 'Failed to fetch user' });
    }
  }
  
  // Method not allowed
  res.setHeader('Allow', ['GET']);
  return res.status(405).end(`Method ${req.method} Not Allowed`);
}
