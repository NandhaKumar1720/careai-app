import { initialsFrom } from '../../utils/formatting';

const SIZES = {
  sm: 'h-12 w-12 text-lg',
  md: 'h-16 w-16 text-xl',
  lg: 'h-24 w-24 text-3xl',
  xl: 'h-32 w-32 text-4xl',
} as const;

export function ProfileAvatar({
  name,
  dataUrl,
  size = 'md',
}: {
  name: string;
  dataUrl?: string | null;
  size?: keyof typeof SIZES;
}) {
  if (dataUrl) {
    return (
      <img
        src={dataUrl}
        alt={`Profile picture of ${name}`}
        className={`${SIZES[size]} shrink-0 rounded-full border-2 border-black object-cover`}
      />
    );
  }

  return (
    <span
      role="img"
      aria-label={`${name} has no profile picture`}
      className={`${SIZES[size]} flex shrink-0 items-center justify-center rounded-full border-2 border-black bg-black font-bold text-white`}
    >
      {initialsFrom(name)}
    </span>
  );
}
