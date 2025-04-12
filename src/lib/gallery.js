import { supabase } from './supabaseClient';

export async function getGalleryImages(category = null, limit = 12) {
  let query = supabase
    .from('gallery')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit);
  
  if (category) {
    query = query.eq('category', category);
  }
  
  const { data, error } = await query;
  
  if (error) {
    console.error('Error fetching gallery images:', error);
    return [];
  }
  
  return data || [];
}
