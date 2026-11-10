import { useState, useEffect } from 'react';
import { getProfileImageUrl } from './api';

interface AvatarProps {
  imageFilename?: string | null;
  name?: string | null;
  className?: string;
  fallbackClassName?: string;
  previewUrl?: string | null;
}

export default function Avatar({
  imageFilename,
  name,
  className = '',
  fallbackClassName = '',
  previewUrl,
}: AvatarProps) {
  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const [hasError, setHasError] = useState(false);

  const initial = (name || 'U').charAt(0).toUpperCase();

  useEffect(() => {
    setHasError(false);

    if (previewUrl) {
      setBlobUrl(previewUrl);
      return;
    }

    if (!imageFilename) {
      setBlobUrl(null);
      return;
    }

    let isMounted = true;
    let createdUrl: string | null = null;

    const token = localStorage.getItem('token');
    const headers: Record<string, string> = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const fullUrl = getProfileImageUrl(imageFilename);
    if (!fullUrl) {
      setBlobUrl(null);
      return;
    }

    fetch(fullUrl, { headers })
      .then(async (res) => {
        if (!res.ok) {
          throw new Error(`Failed to load image: ${res.status}`);
        }
        const blob = await res.blob();
        if (isMounted) {
          createdUrl = URL.createObjectURL(blob);
          setBlobUrl(createdUrl);
          setHasError(false);
        }
      })
      .catch(() => {
        if (isMounted) {
          // If fetch fails, try falling back to direct URL
          setBlobUrl(null);
        }
      });

    return () => {
      isMounted = false;
      if (createdUrl) {
        URL.revokeObjectURL(createdUrl);
      }
    };
  }, [imageFilename, previewUrl]);

  const directUrl = previewUrl || (imageFilename ? getProfileImageUrl(imageFilename) : null);
  const activeSrc = blobUrl || directUrl;

  if (!activeSrc || hasError) {
    return (
      <div className={`avatar-fallback ${fallbackClassName}`} aria-hidden="true">
        {initial}
      </div>
    );
  }

  return (
    <img
      src={activeSrc}
      alt={name || 'Avatar'}
      className={className}
      onError={() => setHasError(true)}
    />
  );
}

