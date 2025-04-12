import { supabase } from './supabaseClient';

export async function getAllEvents() {
  console.log('Fetching events from Supabase...');
  
  try {
    console.log('Supabase client status:', !!supabase);
    
    // Get all events without date filtering
    const { data, error } = await supabase
      .from('events')
      .select('*');
    
    if (error) {
      console.error('Error fetching events:', error);
      return [];
    }
    
    // Log the data to see what we're getting back
    console.log(`Successfully fetched ${data?.length || 0} events`);
    
    // Sort events by proximity to current date
    const now = new Date();
    
    // Custom sorting function
    const sortedEvents = data.sort((a, b) => {
      const dateA = new Date(a.event_date);
      const dateB = new Date(b.event_date);
      
      // Check if dates are in the future or past
      const aIsFuture = dateA >= now;
      const bIsFuture = dateB >= now;
      
      // If one is future and one is past, future comes first
      if (aIsFuture && !bIsFuture) return -1;
      if (!aIsFuture && bIsFuture) return 1;
      
      // If both are future, closer date comes first
      if (aIsFuture && bIsFuture) {
        return dateA - dateB; // Ascending order for future events
      }
      
      // If both are past, closer date comes first
      return dateB - dateA; // Descending order for past events
    });
    
    if (sortedEvents.length > 0) {
      console.log('First event sample after sorting:', sortedEvents[0]);
    }
    
    return sortedEvents || [];
  } catch (e) {
    console.error('Unexpected error in getAllEvents:', e);
    return [];
  }
}

export async function getEventById(id) {
  try {
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      console.error('Error fetching event by ID:', error);
      return null;
    }
    
    return data;
  } catch (e) {
    console.error(`Unexpected error fetching event ID ${id}:`, e);
    return null;
  }
}

// Add a function to get featured events specifically
export async function getFeaturedEvents(limit = 3) {
  try {
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .eq('is_featured', true)
      .order('event_date', { ascending: true })
      .limit(limit);
      
    if (error) {
      console.error('Error fetching featured events:', error);
      return [];
    }
    
    console.log(`Successfully fetched ${data?.length || 0} featured events`);
    return data || [];
  } catch (e) {
    console.error('Unexpected error in getFeaturedEvents:', e);
    return [];
  }
}
