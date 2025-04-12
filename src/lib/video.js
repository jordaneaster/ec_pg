import { supabase } from './supabaseClient';

export class VideoService {
  /**
   * Get a signed URL for a video from Supabase Storage
   * 
   * @param {string} videoUrl - The video URL or path
   * @returns {Promise<string>} A signed URL for the video
   */
  static async getVideoUrl(videoUrl) {
    try {
      // If the URL is empty or undefined, return it as is
      if (!videoUrl) {
        return videoUrl;
      }

      console.log('Original video URL:', videoUrl);
      
      // Check if the URL is already a complete URL with http(s)
      if (videoUrl.startsWith('http')) {
        return videoUrl;
      }
      
      // Extract bucket and path from various URL formats
      let bucket = 'videos'; // Default bucket
      let path = videoUrl;
      
      // Remove any leading "/v1/object/public/" which could be causing issues
      if (path.includes('/v1/object/public/')) {
        const parts = path.split('/v1/object/public/');
        path = parts[parts.length - 1];
      }
      
      // Handle paths with "storage/" prefix
      if (path.includes('/storage/')) {
        const parts = path.split('/storage/');
        if (parts.length > 1) {
          const storageParts = parts[1].split('/');
          bucket = storageParts[0];
          path = storageParts.slice(1).join('/');
        }
      } 
      // Handle paths where the first segment might be the bucket
      else if (path.includes('/') && !path.startsWith('/')) {
        const parts = path.split('/');
        bucket = parts[0];
        path = parts.slice(1).join('/');
      }
      
      // Clean up the path - remove any leading/trailing slashes
      path = path.replace(/^\/+|\/+$/g, '');
      
      console.log(`Creating signed URL - bucket: ${bucket}, path: ${path}`);
      
      // Get a signed URL (valid for 1 hour)
      const { data, error } = await supabase
        .storage
        .from(bucket)
        .createSignedUrl(path, 3600);
        
      if (error) {
        console.error(`Supabase signed URL error:`, error);
        throw new Error(`Error getting Supabase video URL: ${error.message}`);
      }
      
      console.log('Successfully created signed URL');
      return data.signedUrl;
    } catch (error) {
      console.error('Error in getVideoUrl:', error);
      throw error;
    }
  }

  /**
   * Get a list of featured videos
   * 
   * @returns {Promise<Array>} Array of video objects
   */
  static async getFeaturedVideos() {
    const { data, error } = await supabase
      .from('videos')
      .select('*')
      .eq('is_featured', true)
      .order('published_date', { ascending: false });
      
    if (error) {
      throw new Error(`Error fetching featured videos: ${error.message}`);
    }
    
    return data;
  }
}
