import React from 'react';

// Recognize common CDNs and generate a resized URL. Fallback to original.
function getOptimizedImageUrl(url: string, width: number, quality = 75): string {
  if (!url) return url;
  try {
    const u = new URL(url, window.location.origin);
    const host = u.hostname.toLowerCase();

    // Cloudinary pattern: https://res.cloudinary.com/<cloud>/image/upload/.../file.jpg
    if (host.includes('res.cloudinary.com')) {
      // Insert transformation after '/upload/'
      const parts = u.pathname.split('/');
      const uploadIndex = parts.findIndex(p => p === 'upload');
      if (uploadIndex !== -1) {
        const transform = `c_fill,f_auto,q_auto:good,w_${Math.round(width)}`;
        parts.splice(uploadIndex + 1, 0, transform);
        u.pathname = parts.join('/');
        return u.toString();
      }
      return `${url}`;
    }

    // Imgix pattern
    if (host.includes('imgix.net')) {
      u.searchParams.set('auto', 'format,compress');
      u.searchParams.set('q', String(quality));
      u.searchParams.set('w', String(Math.round(width)));
      return u.toString();
    }

    // ImageKit pattern
    if (host.includes('ik.imagekit.io')) {
      // ?tr=w-<width>,q-<quality>
      const tr = `w-${Math.round(width)},q-${quality}`;
      const curr = u.searchParams.get('tr');
      u.searchParams.set('tr', curr ? `${curr},${tr}` : tr);
      return u.toString();
    }

    // Shopify CDN
    if (host.includes('cdn.shopify.com')) {
      u.searchParams.set('width', String(Math.round(width)));
      return u.toString();
    }

    // Generic: some CDNs accept w / q
    const knownParams = ['w', 'width'];
    if (![...u.searchParams.keys()].some(k => knownParams.includes(k))) {
      // try appending w
      u.searchParams.set('w', String(Math.round(width)));
      u.searchParams.set('q', String(quality));
      return u.toString();
    }

    return u.toString();
  } catch {
    return url; // if URL parsing fails, return original
  }
}

export type OptimizedImageProps = React.ImgHTMLAttributes<HTMLImageElement> & {
  src: string;
  // CSS sizes attribute; defaults to responsive full-width container
  sizes?: string;
  // Width candidates for srcset
  widths?: number[];
  // Desired quality 1-100
  quality?: number;
};

export const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  sizes = '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw',
  widths = [200, 400, 800, 1200],
  quality = 75,
  loading = 'lazy',
  decoding = 'async',
  fetchPriority,
  ...rest
}) => {
  // Build srcset with multiple widths
  const srcSet = widths
    .sort((a, b) => a - b)
    .map(w => `${getOptimizedImageUrl(src, w, quality)} ${w}w`)
    .join(', ');

  // Pick a reasonable default src (largest candidate)
  const defaultSrc = getOptimizedImageUrl(src, widths[widths.length - 1], quality);

  // Above-the-fold heuristic: allow caller to pass fetchPriority
  const imgProps: any = { loading, decoding };
  // React does not recognize fetchPriority prop; use lowercase attribute name
  if (fetchPriority) (imgProps as any)['fetchpriority'] = fetchPriority;

  return (
    <img
      src={defaultSrc}
      srcSet={srcSet}
      sizes={sizes}
      {...imgProps}
      {...rest}
    />
  );
};
