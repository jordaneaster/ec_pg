import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { FaCalendarAlt, FaUser } from 'react-icons/fa';
import { cardOverrides } from '../../styles/custom-overrides';

export default function AlbumCard({ album }) {
  const releaseDate = album.release_date ? new Date(album.release_date) : null;
  
  return (
    <div className={`album-card ${cardOverrides.albumCard}`}>
      {/* Image Container with consistent aspect ratio */}
      <div className="album-card__image-container">
        <Image 
          src={album.cover_image_url || '/placeholder-album.jpg'} 
          alt={`${album.title} cover`}
          fill
          className="album-card__image"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
        
        {album.is_featured && (
          <div className="album-card__featured-badge">
            Featured
          </div>
        )}
      </div>

      {/* Content Container */}
      <div className="album-card__content">
        <h3 className={`album-card__title ${cardOverrides.albumCardTitle}`}>
          {album.title}
        </h3>
        
        <div className={`album-card__meta ${cardOverrides.albumCardMeta}`}>
          <FaUser className="album-card__icon" />
          <span className="album-card__artist">{album.artist}</span>
        </div>
        
        {releaseDate && (
          <div className={`album-card__meta ${cardOverrides.albumCardMeta}`}>
            <FaCalendarAlt className="album-card__icon" />
            <span>{releaseDate.toLocaleDateString()}</span>
          </div>
        )}
        
        {album.description && (
          <p className={`album-card__description ${cardOverrides.albumCardText}`}>
            {album.description}
          </p>
        )}

        {/* Action Buttons */}
        <div className="album-card__actions">
          <Link
            href={`/albums/${album.id}`}
            className={`album-card__button album-card__button--primary ${cardOverrides.eventCardButton}`}
          >
            Details
          </Link>
          {album.spotify_url && (
            <Link
              href={album.spotify_url}
              className={`album-card__button album-card__button--primary ${cardOverrides.eventCardButton}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              Spotify
            </Link>
          )}
          {album.live_mixtapes_url && (
            <Link
              href={album.live_mixtapes_url}
              className={`album-card__button album-card__button--livemixtapes ${cardOverrides.eventCardButton}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              Live Mixtapes
            </Link>
          )}
          {album.apple_music_url && (
            <Link
              href={album.apple_music_url}
              className={`album-card__button album-card__button--secondary ${cardOverrides.eventCardButton}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              Apple Music
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
