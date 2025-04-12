import { supabase } from './supabaseClient';
import { VideoService } from './video';

/**
 * Get all videos from the database
 * @returns {Promise<Array>} Array of video objects
 */
export async function getAllVideos() {
  const { data, error } = await supabase
    .from('videos')
    .select('*')
    .order('published_date', { ascending: false });
  
  if (error) {
    console.error('Error fetching videos:', error);
    return [];
  }
  
  return data || [];
}

/**
 * Get a specific video by ID
 * @param {string} id - Video ID
 * @returns {Promise<Object|null>} Video object or null if not found
 */
export async function getVideoById(id) {
  const { data, error } = await supabase
    .from('videos')
    .select('*')
    .eq('id', id)
    .single();
  
  if (error) {
    console.error('Error fetching video:', error);
    return null;
  }
  
  return data;
}

/**
 * Get featured videos from the database
 * @param {number} limit - Maximum number of videos to return
 * @returns {Promise<Array>} Array of featured video objects
 */
export async function getFeaturedVideos(limit = 3) {
  // Reusing the existing method from VideoService
  return VideoService.getFeaturedVideos(limit);
}
