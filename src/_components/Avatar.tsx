/** @format */

// File: src/_components/Avatar.tsx
// Purpose: Render a compact avatar preview with fallback initials
// Author: Diego M. Lafuente
// Email: dlafuente@gmail.com

type AvatarProps = Readonly<{
  uri?: string;
  alt?: string;
  size?: number;
}>;

function getInitials(alt?: string): string {
  const normalizedAlt = alt?.trim();

  if (!normalizedAlt) {
    return '?';
  }

  const segments = normalizedAlt.split(' ').filter(Boolean);

  if (segments.length === 0) {
    return '?';
  }

  return segments
    .slice(0, 2)
    .map(function getSegmentInitial(segment: string): string {
      return segment.charAt(0).toUpperCase();
    })
    .join('');
}

export default function Avatar({
  uri,
  alt = 'Avatar',
  size = 40,
}: AvatarProps) {
  const normalizedUri = uri?.trim();
  const dimensions = {
    width: `${size}px`,
    height: `${size}px`,
    minWidth: `${size}px`,
    minHeight: `${size}px`,
  } as const;

  if (normalizedUri) {
    return (
      <img
        src={normalizedUri}
        alt={alt}
        width={size}
        height={size}
        style={{
          ...dimensions,
          objectFit: 'cover',
          borderRadius: '50%',
          display: 'block',
        }}
      />
    );
  }

  return (
    <span
      aria-label={alt}
      title={alt}
      className='display--inline-flex align-items--center justify-content--center color--white background-color--gray font-weight--600'
      style={{
        ...dimensions,
        borderRadius: '50%',
        fontSize: `${Math.max(12, Math.floor(size * 0.35))}px`,
      }}
    >
      {getInitials(alt)}
    </span>
  );
}
