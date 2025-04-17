import React from 'react';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { FaSpotify, FaApple, FaCalendarAlt, FaUser, FaMusic, FaArrowLeft, FaYoutube } from 'react-icons/fa';
import { getAlbumById } from '../../lib/albums';

export default function AlbumDetailPage() {
  const router = useRouter();
  const { id } = router.query;
  const [album, setAlbum] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadAlbum() {
      if (!id) return;
      
      try {
        setLoading(true);
        const albumData = await getAlbumById(id);
        
        // Log the fetched data to the browser console
        console.log('Fetched Album Data:', albumData); 
        
        if (!albumData) {
          setError('Album not found');
          return;
        }
        
        setAlbum(albumData);
      } catch (err) {
        console.error('Error loading album:', err);
        setError('Failed to load album details');
      } finally {
        setLoading(false);
      }
    }
    
    loadAlbum();
  }, [id]);

  if (!id) return null;
  
  if (loading) {
    return (
      <div className="album-detail-page">
        <div className="album-detail-container">
          <div className="page-loader">
            <div className="loader-spinner"></div>
            <p>Loading album details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !album) {
    return (
      <div className="album-detail-page">
        <div className="album-detail-container">
          <div className="page-error">
            <div>
              <h1 className="text-2xl font-bold mb-4">Error</h1>
              <p>{error || 'Album not found'}</p>
              <Link href="/music" className="mt-4 inline-block text-blue-400 hover:text-blue-300">
                Back to Albums
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const releaseDate = album.release_date ? new Date(album.release_date) : null;
  
  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  // Log the album state right before rendering
  if (album) {
    console.log('Album state before render:', album);
  }

  return (
    <div className="album-detail-page">
      <div className="album-detail-container">
        <Link href="/music" className="back-link">
          <span className="back-link-arrow"><FaArrowLeft /></span> 
          Back to Albums
        </Link>
        
        <div className="album-detail-card">
          <div className="album-detail-content">
            {/* LEFT COLUMN - Album Cover */}
            <div className="album-cover-column">
              <div className="album-cover-container">
                <Image
                  src={album.cover_image_url || '/placeholder-album.jpg'}
                  alt={album.title}
                  fill
                  priority
                  className="album-cover-image"
                  sizes="(max-width: 768px) 256px, 288px"
                />
                
                {album.is_featured && (
                  <div className="featured-badge">
                    Featured
                  </div>
                )}
              </div>
              
              {/* Music platform links under album cover */}
              {/* Update container condition to include live_mixtapes_url */}
              {album && (album.spotify_url || album.apple_music_url || album.youtube_url || album.live_mixtapes_url) && (
                <div className="album-platform-links">
                  {album.spotify_url && (
                    <Link href={album.spotify_url} target="_blank" rel="noopener noreferrer" 
                      className="platform-link platform-link-spotify" title="Listen on Spotify">
                      <FaSpotify />
                    </Link>
                  )}
                  {/* Add Live Mixtapes link */}
                  {album.live_mixtapes_url && (
                    <Link href={album.live_mixtapes_url} target="_blank" rel="noopener noreferrer" 
                      className="platform-link platform-link-livemixtapes" title="Listen on Live Mixtapes">
                      {/* Using FaMusic as a placeholder icon */}
                      <FaMusic /> 
                    </Link>
                  )}
                  {album.apple_music_url && (
                    <Link href={album.apple_music_url} target="_blank" rel="noopener noreferrer" 
                      className="platform-link platform-link-apple" title="Listen on Apple Music">
                      <FaApple />
                    </Link>
                  )}
                  {album.youtube_url && (
                    <Link href={album.youtube_url} target="_blank" rel="noopener noreferrer" 
                      className="platform-link platform-link-youtube" title="Watch on YouTube">
                      <FaYoutube />
                    </Link>
                  )}
                </div>
              )}
            </div>
            
            {/* RIGHT COLUMN - Album Details */}
            <div className="album-details-column">
              <h1 className="album-title">{album.title}</h1>
              
              {/* Artist & Release Date */}
              <div className="album-meta-grid">
                <div className="album-meta-item">
                  <div className="meta-icon-container">
                    <FaUser className="meta-icon" />
                  </div>
                  <div>
                    <p className="meta-label">Artist</p>
                    <p className="meta-value">{album.artist}</p>
                  </div>
                </div>
                
                {releaseDate && (
                  <div className="album-meta-item">
                    <div className="meta-icon-container">
                      <FaCalendarAlt className="meta-icon" />
                    </div>
                    <div>
                      <p className="meta-label">Release Date</p>
                      <p className="meta-value">{formatDate(releaseDate)}</p>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Album Description */}
              {album.description && (
                <div className="album-section">
                  <h2 className="album-section-title">
                    <FaMusic className="album-section-icon" /> 
                    Album Overview
                  </h2>
                  <div className="album-section-content">
                    <p>{album.description}</p>
                  </div>
                </div>
              )}
              
              {/* Artist Bio Section */}
              <div className="album-section">
                <h2 className="album-section-title">
                  <FaUser className="album-section-icon" /> 
                  About the Artist
                </h2>
                <div className="album-section-content">
                  <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam in dui mauris. Vivamus hendrerit arcu sed erat molestie vehicula. Sed auctor neque eu tellus rhoncus ut eleifend nibh porttitor. Ut in nulla enim.</p>
                </div>
              </div>
              
              {/* Album Synopsis Section */}
              <div className="album-section">
                <h2 className="album-section-title">
                  <FaMusic className="album-section-icon" /> 
                  Album Synopsis
                </h2>
                <div className="album-section-content">
                  <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam in dui mauris. Vivamus hendrerit arcu sed erat molestie vehicula. Sed auctor neque eu tellus rhoncus ut eleifend nibh porttitor. Ut in nulla enim. Phasellus molestie magna non est bibendum non venenatis nisl tempor.</p>
                  <p>Suspendisse in orci enim. Donec sed ligula ipsum. Ut in arcu a odio volutpat blandit. Proin nibh massa, cursus eu molestie ac, lobortis eget tellus.</p>
                </div>
              </div>
              
              {/* Call-to-action buttons */}
              <div className="album-cta-container">
                {album.spotify_url && (
                  <Link
                    href={album.spotify_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="cta-button cta-button-spotify"
                  >
                    <FaSpotify />
                    Listen on Spotify
                  </Link>
                )}
                
                {/* Add Live Mixtapes CTA button */}
                {album.live_mixtapes_url && (
                  <Link
                    href={album.live_mixtapes_url}
                    target="_blank"
                    rel="noopener noreferrer" 
                    className="cta-button cta-button-livemixtapes" // Add specific class for styling
                  >
                    <FaMusic /> {/* Using FaMusic icon */}
                    Listen on Live Mixtapes
                  </Link>
                )}

                {album.apple_music_url && (
                  <Link
                    href={album.apple_music_url}
                    target="_blank"
                    rel="noopener noreferrer" 
                    className="cta-button cta-button-apple"
                  >
                    <FaApple />
                    Listen on Apple Music
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Adding styles for platform links */}
      <style jsx>{`
        .album-platform-links {
          display: flex;
          justify-content: center;
          gap: 1rem;
          margin-top: 1.5rem;
        }
        
        .platform-link {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 3rem;
          height: 3rem;
          border-radius: 50%;
          font-size: 1.5rem;
          color: white;
          transition: transform 0.2s ease-in-out;
        }
        
        .platform-link:hover {
          transform: scale(1.1);
        }
        
        .platform-link-spotify {
          background-color: #1DB954;
        }

        /* Add style for Live Mixtapes button */
        .platform-link-livemixtapes {
          background-color: #ff6600; /* Example color - adjust as needed */
        }
        
        .platform-link-apple {
          background-color: #FB2D4D;
        }
        
        .platform-link-youtube {
          background-color: #FF0000;
        }
      `}</style>
    </div>
  );
}
