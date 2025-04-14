import React, { useState, useRef, useEffect } from 'react';
import { FaPlay, FaPause, FaVolumeUp, FaVolumeMute, FaExpand, FaEye, FaCalendarAlt, FaExclamationTriangle } from 'react-icons/fa';
import { VideoService } from '../../lib/video';
import { cardOverrides } from '../../styles/custom-overrides';
import Link from 'next/link';

export default function VideoCard({ video }) {
  const [isHovering, setIsHovering] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [videoUrl, setVideoUrl] = useState(null);
  const [autoplayAttempted, setAutoplayAttempted] = useState(false);
  const [playError, setPlayError] = useState(null);
  const [videoFormat, setVideoFormat] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [networkError, setNetworkError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);
  const [loadingTimeout, setLoadingTimeout] = useState(null);
  const [useFallback, setUseFallback] = useState(false);
  const [directUrl, setDirectUrl] = useState('');
  const videoRef = useRef(null);

  const formatDuration = (seconds) => {
    if (!seconds) return '0:00';
    
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    
    if (mins >= 60) {
      const hours = Math.floor(mins / 60);
      const remainingMins = mins % 60;
      return `${hours}:${remainingMins < 10 ? '0' : ''}${remainingMins}:${secs < 10 ? '0' : ''}${secs}`;
    }
    
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getVideoFormat = (url) => {
    if (!url) return null;
    
    const extension = url.split('.').pop().toLowerCase();
    
    if (extension === 'mov') {
      return 'mov';
    } else if (['mp4', 'webm', 'ogg'].includes(extension)) {
      return extension;
    }
    
    return null;
  };

  const isFormatSupported = (format) => {
    const video = document.createElement('video');
    
    if (format === 'mov') {
      return video.canPlayType('video/quicktime') !== '';
    }
    
    return true;
  };

  const checkVideoPlayability = (url) => {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open('HEAD', url, true);
      
      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          resolve(true);
        } else {
          reject(new Error(`HTTP error ${xhr.status}: ${xhr.statusText}`));
        }
      };
      
      xhr.onerror = () => {
        reject(new Error('Network error occurred'));
      };
      
      xhr.send();
    });
  };

  const debugVideoElement = (videoEl) => {
    if (!videoEl) return;
    
    console.log('Video Element Debug:');
    console.log('- networkState:', videoEl.networkState, 
      ['NETWORK_EMPTY', 'NETWORK_IDLE', 'NETWORK_LOADING', 'NETWORK_NO_SOURCE'][videoEl.networkState] || 'Unknown');
    console.log('- readyState:', videoEl.readyState,
      ['HAVE_NOTHING', 'HAVE_METADATA', 'HAVE_CURRENT_DATA', 'HAVE_FUTURE_DATA', 'HAVE_ENOUGH_DATA'][videoEl.readyState] || 'Unknown');
    console.log('- paused:', videoEl.paused);
    console.log('- currentSrc:', videoEl.currentSrc);
    console.log('- src attribute:', videoEl.getAttribute('src'));
    console.log('- error:', videoEl.error);
    
    const sources = videoEl.querySelectorAll('source');
    console.log('- sources:', sources.length);
    sources.forEach((src, i) => {
      console.log(`  source ${i}:`, src.src, src.type);
    });
  };

  const cancelLoading = () => {
    setIsLoading(false);
    if (loadingTimeout) {
      clearTimeout(loadingTimeout);
      setLoadingTimeout(null);
    }
  };

  const handlePlayPause = () => {
    if (videoRef.current) {
      setPlayError(null);
      cancelLoading();
      
      debugVideoElement(videoRef.current);
      console.log('Direct URL state:', directUrl);

      if (isPlaying) {
        videoRef.current.pause();
        setIsPlaying(false);
      } else {
        setIsLoading(true);
        console.log('Manual play attempt...');
        
        const timeout = setTimeout(() => {
          console.log('Play timeout reached - cancelling loading state');
          setIsLoading(false);
          
          if (videoRef.current && !videoRef.current.paused) {
            console.log('Video is actually playing despite timeout');
            setIsPlaying(true);
          } else {
            setPlayError('Video playback timed out. Try again or check console for details.');
            debugVideoElement(videoRef.current);
          }
        }, 5000);
        
        setLoadingTimeout(timeout);
        
        videoRef.current.play()
          .then(() => {
            console.log('Manual play succeeded!');
            setIsPlaying(true);
            cancelLoading();
          })
          .catch(err => {
            console.error('Manual play failed:', err);
            setPlayError(`Unable to play this video: ${err.message || 'Unknown error'}`);
            setIsPlaying(false);
            cancelLoading();
            
            if (retryCount < 2) {
              console.log(`Retry attempt ${retryCount + 1}...`);
              setRetryCount(prevCount => prevCount + 1);
              setTimeout(() => {
                console.log('Retrying play after timeout...');
                videoRef.current.play()
                  .then(() => {
                    console.log('Retry play succeeded!');
                    setIsPlaying(true);
                  })
                  .catch(e => console.error('Retry also failed:', e));
              }, 1000);
            }
          });
      }
    }
  };

  const handleMute = () => {
    if (videoRef.current) {
      const newMutedState = !isMuted;
      videoRef.current.muted = newMutedState;
      setIsMuted(newMutedState);
    }
  };

  const handleFullscreen = () => {
    if (videoRef.current) {
      if (videoRef.current.requestFullscreen) {
        videoRef.current.requestFullscreen();
      } else if (videoRef.current.webkitRequestFullscreen) {
        videoRef.current.webkitRequestFullscreen();
      } else if (videoRef.current.msRequestFullscreen) {
        videoRef.current.msRequestFullscreen();
      }
    }
  };

  const attemptVideoSetup = (url, format) => {
    console.log(`Setting up video with URL: ${url}`);
    
    setDirectUrl(url);
    
    const videoElement = document.createElement('video');
    videoElement.muted = true;
    videoElement.setAttribute('playsinline', '');
    videoElement.setAttribute('muted', '');
    videoElement.src = url;
    
    if (format) {
      const mimeType = format === 'mov' ? 'video/quicktime' : `video/${format}`;
      try {
        const source = document.createElement('source');
        source.src = url;
        source.type = mimeType;
        videoElement.appendChild(source);
      } catch (err) {
        console.warn('Failed to add source element:', err);
      }
    }
    
    videoElement.addEventListener('loadedmetadata', () => {
      console.log('Test video loaded metadata successfully');
    });
    
    videoElement.addEventListener('error', (e) => {
      console.error('Test video encountered error:', e);
    });
    
    try {
      videoElement.load();
    } catch (err) {
      console.error('Failed in test video load:', err);
    }
    
    if (videoRef.current) {
      videoRef.current.src = url;
      
      if (format) {
        try {
          videoRef.current.setAttribute('type', format === 'mov' ? 'video/quicktime' : `video/${format}`);
        } catch (err) {
          console.warn('Failed to set type attribute:', err);
        }
      }

      console.log(`Applied URL directly to video element: ${url}`);
      
      try {
        videoRef.current.load();
      } catch (err) {
        console.error('Error during video load:', err);
      }
    }
  };

  const attemptAutoplay = () => {
    if (!videoRef.current || !videoUrl || autoplayAttempted) return;
    
    console.log(`Attempting to autoplay: ${video.title || 'Untitled'}`);
    setAutoplayAttempted(true);
    setPlayError(null);
    setIsLoading(true);
    
    const timeout = setTimeout(() => {
      console.log('Autoplay timeout reached - cancelling loading state');
      setIsLoading(false);
      debugVideoElement(videoRef.current);
    }, 8000);
    
    setLoadingTimeout(timeout);
    
    videoRef.current.muted = true;
    setIsMuted(true);
    
    checkVideoPlayability(videoUrl)
      .then(() => {
        console.log('Video resource is accessible');
        const playPromise = videoRef.current.play();
        
        if (playPromise !== undefined) {
          playPromise
            .then(() => {
              console.log(`Autoplay successful for: ${video.title || 'Untitled'}`);
              setIsPlaying(true);
              cancelLoading();
            })
            .catch((error) => {
              console.warn(`Autoplay failed:`, error);
              cancelLoading();
              
              if (videoFormat === 'mov') {
                setPlayError('This browser may not support .MOV video files.');
                console.warn('MOV format detected, which has limited browser support');
                return;
              }
              
              setTimeout(() => {
                console.log('Retrying autoplay with timeout...');
                videoRef.current.play()
                  .then(() => {
                    console.log('Retry successful');
                    setIsPlaying(true);
                  })
                  .catch(e => {
                    console.warn('Retry failed:', e);
                    setPlayError('Unable to play this video. Try clicking play manually.');
                    debugVideoElement(videoRef.current);
                  });
              }, 1000);
            });
        } else {
          console.warn('Play didn\'t return a promise');
          cancelLoading();
        }
      })
      .catch(err => {
        console.error('Video resource is not accessible:', err);
        setNetworkError(`Cannot access video: ${err.message}`);
        cancelLoading();
      });
  };

  useEffect(() => {
    const getVideoUrl = async () => {
      if (video.url) {
        setIsLoading(true);
        try {
          console.log(`Fetching video URL for: ${video.title || 'Untitled'}`);
          const signedUrl = await VideoService.getVideoUrl(video.url);
          console.log(`Got signed URL for: ${video.title || 'Untitled'}`);
          
          const format = getVideoFormat(signedUrl);
          setVideoFormat(format);
          
          if (format === 'mov') {
            console.warn('MOV format detected. This may have limited browser support.');
            if (!isFormatSupported('mov')) {
              console.error('Browser does not support MOV format');
              setPlayError('Your browser may not support .MOV files. Please try with a different browser or contact support.');
            }
          }
          
          setVideoUrl(signedUrl);
          attemptVideoSetup(signedUrl, format);
          
        } catch (error) {
          console.error(`Error getting video URL:`, error);
          setVideoUrl(video.url);
          setPlayError('Error loading video');
          setNetworkError(`Network error: ${error.message}`);
        }
      }
    };
    
    if (video.url) getVideoUrl();
    
    return () => {
      if (loadingTimeout) {
        clearTimeout(loadingTimeout);
      }
    };
  }, [video.url, video.title]);

  useEffect(() => {
    const videoElement = videoRef.current;
    if (!videoElement || !videoUrl) return;

    const handlePlay = () => {
      console.log('Play event fired');
      setIsPlaying(true);
    };
    
    const handlePause = () => {
      console.log('Pause event fired');
      setIsPlaying(false);
    };
    
    const handleEnded = () => {
      console.log('Ended event fired');
      if (videoElement.loop) {
        videoElement.currentTime = 0;
        videoElement.play().catch(e => console.warn('Replay failed:', e));
      } else {
        setIsPlaying(false);
      }
    };
    
    const handleCanPlay = () => {
      console.log('Video can play now');
      attemptAutoplay();
    };
    
    const handleLoadedMetadata = () => {
      console.log('Video metadata loaded');
      attemptAutoplay();
    };

    const handleError = (e) => {
      console.error('Video error:', e, videoElement.error);
      let errorMessage = 'Unknown video error';
      
      if (videoElement.error) {
        switch (videoElement.error.code) {
          case 1:
            errorMessage = 'Video loading aborted';
            break;
          case 2:
            errorMessage = 'Network error occurred while loading video';
            break;
          case 3:
            errorMessage = 'Video decoding failed - format may be unsupported';
            break;
          case 4:
            errorMessage = 'Video not found or access denied';
            break;
          default:
            errorMessage = `Video error: ${videoElement.error.message || 'unknown'}`;
        }
      }
      
      setPlayError(errorMessage);
      setIsLoading(false);
    };
    
    const handleProgress = () => {
      if (videoElement.buffered.length > 0) {
        const loadedPercentage = (videoElement.buffered.end(0) / videoElement.duration) * 100;
        setLoadingProgress(loadedPercentage);
        console.log(`Video buffer progress: ${loadedPercentage.toFixed(1)}%`);
      }
    };
    
    const handleStalled = () => {
      console.warn('Video playback has stalled');
      debugVideoElement(videoElement);
    };
    
    const handleWaiting = () => {
      console.log('Video is waiting for more data');
    };
    
    const handleLoadedData = () => {
      console.log('Video data loaded - can display current frame');
      if (videoElement.readyState >= 2) {
        setIsLoading(false);
      }
    };
    
    const handleTimeUpdate = () => {
      if (!isPlaying && videoElement.currentTime > 0 && !videoElement.paused) {
        console.log('Video is playing based on time updates');
        setIsPlaying(true);
        setIsLoading(false);
      }
    };
    
    const handleSourceChange = () => {
      console.log('Video source changed:', videoElement.currentSrc);
    };
    
    const safetyTimeout = setTimeout(() => {
      setIsLoading(false);
      debugVideoElement(videoElement);
      
      if (!videoElement.paused) {
        setIsPlaying(true);
        console.log('Video is actually playing despite loading state');
      }
    }, 10000);
    
    setTimeout(() => {
      if (!videoElement.src && directUrl) {
        console.log('Video src was not set! Applying directly:', directUrl);
        videoElement.src = directUrl;
        videoElement.load();
      }
      
      attemptAutoplay();
    }, 1000);
    
    videoElement.addEventListener('play', handlePlay);
    videoElement.addEventListener('pause', handlePause);
    videoElement.addEventListener('ended', handleEnded);
    videoElement.addEventListener('canplay', handleCanPlay);
    videoElement.addEventListener('loadedmetadata', handleLoadedMetadata);
    videoElement.addEventListener('error', handleError);
    videoElement.addEventListener('progress', handleProgress);
    videoElement.addEventListener('stalled', handleStalled);
    videoElement.addEventListener('waiting', handleWaiting);
    videoElement.addEventListener('loadeddata', handleLoadedData);
    videoElement.addEventListener('timeupdate', handleTimeUpdate);
    videoElement.addEventListener('loadstart', handleSourceChange);
    
    return () => {
      clearTimeout(safetyTimeout);
      videoElement.removeEventListener('play', handlePlay);
      videoElement.removeEventListener('pause', handlePause);
      videoElement.removeEventListener('ended', handleEnded);
      videoElement.removeEventListener('canplay', handleCanPlay);
      videoElement.removeEventListener('loadedmetadata', handleLoadedMetadata);
      videoElement.removeEventListener('error', handleError);
      videoElement.removeEventListener('progress', handleProgress);
      videoElement.removeEventListener('stalled', handleStalled);
      videoElement.removeEventListener('waiting', handleWaiting);
      videoElement.removeEventListener('loadeddata', handleLoadedData);
      videoElement.removeEventListener('timeupdate', handleTimeUpdate);
      videoElement.removeEventListener('loadstart', handleSourceChange);
    };
  }, [videoRef.current, videoUrl, directUrl]);

  return (
    <div 
      className={`video-card ${cardOverrides.videoCard}`}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      <div className="video-card__image-container">
        {videoUrl ? (
          <div 
            className="video-card__video-container" 
            onClick={handlePlayPause}
            style={{ 
              position: 'relative',
              overflow: 'hidden',
              width: '100%',
              height: '0',
              paddingBottom: '56.25%', // 16:9 aspect ratio
              background: '#000'
            }}
          >
            {!useFallback ? (
              <video
                ref={videoRef}
                className="video-card__video"
                muted={true}
                playsInline
                loop
                autoPlay
                preload="auto"
                controls={false}
                crossOrigin="anonymous"
                src={directUrl}
                style={{
                  position: 'absolute',
                  top: '0',
                  left: '0',
                  width: '100%',
                  height: '100%',
                  objectFit: 'fill'
                }}
              />
            ) : (
              <iframe 
                className="video-card__iframe"
                src={directUrl}
                allowFullScreen
                title={video.title || 'Video'}
                style={{
                  position: 'absolute',
                  top: '0',
                  left: '0',
                  width: '100%',
                  height: '100%',
                  border: 'none'
                }}
              />
            )}
            
            {isLoading && (
              <div className="video-card__loading-overlay">
                <div className="video-card__loading">
                  <div className="video-card__loading-spinner"></div>
                  <p>Loading video... {loadingProgress > 0 ? `${loadingProgress.toFixed(0)}%` : ''}</p>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      cancelLoading();
                      debugVideoElement(videoRef.current);
                      setPlayError('Loading cancelled. Try playing manually.');
                    }}
                    className="video-card__cancel-button"
                  >
                    Cancel Loading
                  </button>
                </div>
              </div>
            )}
            
            {(playError || networkError) && (
              <div className="video-card__error-overlay">
                <div className="video-card__error">
                  <FaExclamationTriangle className="video-card__error-icon" />
                  <p>{playError || networkError}</p>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      setPlayError(null);
                      setNetworkError(null);
                      debugVideoElement(videoRef.current);
                      handlePlayPause();
                    }}
                    className="video-card__retry-button"
                  >
                    Try Again
                  </button>
                </div>
              </div>
            )}
            
            {isHovering && (
              <div className="video-card__controls-overlay">
                <div className="video-card__controls">
                  <button 
                    className="video-card__control-button" 
                    onClick={handlePlayPause}
                    aria-label={isPlaying ? "Pause video" : "Play video"}
                  >
                    {isPlaying ? <FaPause /> : <FaPlay />}
                  </button>
                  
                  <button 
                    className="video-card__control-button" 
                    onClick={handleMute}
                    aria-label={isMuted ? "Unmute video" : "Mute video"}
                  >
                    {isMuted ? <FaVolumeMute /> : <FaVolumeUp />}
                  </button>
                  
                  <button 
                    className="video-card__control-button" 
                    onClick={handleFullscreen}
                    aria-label="View fullscreen"
                  >
                    <FaExpand />
                  </button>
                </div>
                
                <div className="video-card__debug-info">
                  {videoRef.current && 
                    <small>
                      State: {videoRef.current.readyState}/4
                      {videoRef.current.error ? ` Error: ${videoRef.current.error.code}` : ''}
                      <br />
                      URL set: {directUrl ? 'Yes' : 'No'}
                    </small>
                  }
                </div>
              </div>
            )}
          </div>
        ) : (
          <div 
            className="video-card__thumbnail"
            style={{ 
              position: 'relative',
              overflow: 'hidden',
              width: '100%',
              height: '0',
              paddingBottom: '56.25%', // 16:9 aspect ratio
              background: '#000',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <div className="video-card__play-overlay">
              <div className="video-card__play-button">
                <FaPlay />
              </div>
            </div>
          </div>
        )}
        
        {video.duration && (
          <div className="video-card__duration">
            {formatDuration(video.duration)}
          </div>
        )}
        
        {video.is_featured && video.url && (
          <div className="video-card__featured-badge">
            Featured
          </div>
        )}
      </div>

      <div className="video-card__content">
        <h3 className={`video-card__title ${cardOverrides.videoCardTitle}`}>
          {video.title}
        </h3>
        
        <div className={`video-card__meta ${cardOverrides.videoCardMeta}`}>
          {video.views !== undefined && (
            <span className="video-card__meta-item">
              <FaEye className="video-card__icon" />
              {video.views.toLocaleString()} views
            </span>
          )}
          
          {video.published_date && (
            <span className="video-card__meta-item">
              <FaCalendarAlt className="video-card__icon" />
              {formatDate(video.published_date)}
            </span>
          )}
        </div>
        
        {video.description && (
          <p className={`video-card__description ${cardOverrides.videoCardText}`}>
            {video.description}
          </p>
        )}
        
        <div className="video-card__actions">
          <Link 
            href={`/videos/${video.id}`}
            className={`video-card__button video-card__button--primary ${cardOverrides.eventCardButton}`}
          >
            Details
          </Link>
          
          {video.share_url && (
            <button 
              onClick={() => navigator.clipboard.writeText(video.share_url)}
              className={`video-card__button video-card__button--secondary ${cardOverrides.eventCardButton}`}
            >
              Share
            </button>
          )}
        </div>
      </div>
    </div>
  );
}