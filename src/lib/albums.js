import { supabase } from './supabaseClient';

export async function getAllAlbums() {
  const { data, error } = await supabase
    .from('albums')
    .select('*')
    .order('release_date', { ascending: false });
  
  if (error) {
    console.error('Error fetching albums:', error);
    return [];
  }
  
  return data || [];
}

export async function getAlbumById(id) {
  const { data, error } = await supabase
    .from('albums')
    .select('*, tracks(*)')
    .eq('id', id)
    .single();
  
  if (error) {
    console.error('Error fetching album:', error);
    return null;
  }
  
  return data;
}
