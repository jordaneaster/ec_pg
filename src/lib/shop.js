import { supabase } from './supabaseClient';

export async function getShopItems(categoryId = null, limit = 50) {
  let query = supabase
    .from('products')
    .select(`
      *,
      categories:category_id (id, name)
    `)
    .order('created_at', { ascending: false });
  
  if (limit) {
    query = query.limit(limit);
  }
  
  if (categoryId) {
    query = query.eq('category_id', categoryId);
  }
  
  const { data, error } = await query;
  
  if (error) {
    console.error('Error fetching shop items:', error);
    return [];
  }
  
  // Format the data to make category name directly accessible
  return (data || []).map(product => ({
    ...product,
    category: product.categories ? product.categories.name : 'Uncategorized'
  }));
}

export async function getShopCategories() {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('name');
  
  if (error) {
    console.error('Error fetching shop categories:', error);
    return [];
  }
  
  return data || [];
}

export async function getShopItemById(id) {
  const { data, error } = await supabase
    .from('products')
    .select(`
      *,
      categories:category_id (id, name)
    `)
    .eq('id', id)
    .single();
  
  if (error) {
    console.error('Error fetching shop item by id:', error);
    return null;
  }
  
  if (data) {
    // Format the data to make category name directly accessible
    return {
      ...data,
      category: data.categories ? data.categories.name : 'Uncategorized'
    };
  }
  
  return null;
}
