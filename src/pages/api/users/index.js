import { createClient } from '@supabase/supabase-js';

// Initialize the Supabase client directly in the API route
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY; 

// For server-side API routes, it's better to use a service role key if available
// But we'll use the anon key for now since that's what we have
const supabase = createClient(supabaseUrl, supabaseKey);

export default async function handler(req, res) {
  console.log('API route /api/users called with method:', req.method);
  
  // Handle POST request to create a new user
  if (req.method === 'POST') {
    try {
      const { auth_id, email, created_at } = req.body;
      
      console.log('Creating user with data:', { auth_id, email, created_at });
      
      if (!auth_id || !email) {
        return res.status(400).json({ error: 'Missing required fields: auth_id and email are required' });
      }
      
      // Create the user in the database
      const { data, error } = await supabase
        .from('users')
        .insert([
          { 
            auth_id,
            email,
            created_at: created_at || new Date().toISOString()
          }
        ])
        .select();
      
      if (error) {
        console.error('Supabase error creating user:', error);
        return res.status(500).json({ error: error.message });
      }
      
      console.log('User created successfully:', data);
      return res.status(201).json(data[0]);
    } catch (error) {
      console.error('Error creating user:', error);
      return res.status(500).json({ error: error.message || 'Failed to create user' });
    }
  }
  
  // Method not allowed
  res.setHeader('Allow', ['POST']);
  return res.status(405).end(`Method ${req.method} Not Allowed`);
}
