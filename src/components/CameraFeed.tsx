import './CameraFeed.css';

import { useEffect, useState } from 'react';

import { type Camera } from '../lib/cameras';
import { useVideoPlayer } from '../lib/useVideoPlayer';
import { CameraCard } from './CameraCard';

interface CameraFeedProps {
  camera: Camera;
  mode: string;
  onRemove: () => void;
  setDetailCam: (c: Camera) => void;
  index?: number;
  refreshInterval?: number;
}

export function CameraFeed({ camera, mode, onRemove, setDetailCam, index, refreshInterval = 0 }: CameraFeedProps) {
  const { videoRef, videoKey, error, stalled, retryCount, retry, handleError, setError } = useVideoPlayer(mode);
  const [imgTs, setImgTs] = useState(() => Date.now());

  useEffect(() => {
    if (mode !== 'image' || !refreshInterval) { return; }
    const id = setInterval(() => setImgTs(Date.now()), refreshInterval * 1000);
    return () => clearInterval(id);
  }, [mode, refreshInterval]);

  const imgSrc = refreshInterval ? `${camera.image_url}${camera.image_url.includes('?') ? '&' : '?'}t=${imgTs}` : camera.image_url;

  return (
    <div className="feed-item">
      <CameraCard camera={camera} onRemove={onRemove} onDetail={() => setDetailCam(camera)} index={index}>
        <div className="feed-media">
          {error ? (
            <div className="feed-error">
              <p className="feed-error-text">Feed unavailable</p>
              <button className="feed-error-retry" onClick={retry}>Retry</button>
            </div>
          ) : mode === 'video' ? (
            <>
              <video
                key={videoKey}
                ref={videoRef}
                src={camera.video_url}
                autoPlay
                muted
                playsInline
                controls
                onError={handleError}
              />
              {stalled && (
                <div className="feed-stalled-overlay">
                  <span className="feed-stalled">unstable feed{retryCount > 0 ? ` (retry ${retryCount}/3)` : ''}</span>
                </div>
              )}
            </>
          ) : (
            <img src={imgSrc} alt={camera.description} onError={() => setError(true)} />
          )}
        </div>
      </CameraCard>
    </div>
  );
}
