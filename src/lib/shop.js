import { supabase } from './supabaseClient';

export async function getShopItems(category = null, limit = 50) {
  let query = supabase
    .from('merchandise')
    .select('*')
    .order('created_at', { ascending: false });
  
  if (limit) {
    query = query.limit(limit);
  }
  
  if (category) {
    query = query.eq('category', category);
  }
  
  const { data, error } = await query;
  
  if (error) {
    console.error('Error fetching shop items:', error);
    return [];
  }
  
  return data || [];
}

export async function getShopCategories() {
  const { data, error } = await supabase
    .from('merchandise_categories')
    .select('*')
    .order('name');
  
  if (error) {
    console.error('Error fetching shop categories:', error);
    return [];
  }
  
  return data || [];
}
