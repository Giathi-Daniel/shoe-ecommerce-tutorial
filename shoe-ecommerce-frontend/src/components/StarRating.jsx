import { useId } from 'react';

const STAR_PATH = 'M10 1.5l2.6 5.5 6 .8-4.4 4.2 1.1 6-5.3-2.9-5.3 2.9 1.1-6L1.4 7.8l6-.8L10 1.5z';

export function Star({ fill, size }) {
  const id = useId();

  return (
    <svg viewBox="0 0 20 20" width={size} height={size} aria-hidden="true" className="shrink-0">
      <defs>
        <linearGradient id={id}>
          <stop offset={`${fill * 100}%`} stopColor="#ffa41c" />
          <stop offset={`${fill * 100}%`} stopColor="#e0e0e0" />
        </linearGradient>
      </defs>
      <path d={STAR_PATH} fill={`url(#${id})`} stroke="#de7921" strokeWidth="0.6" strokeLinejoin="round" />
    </svg>
  );
}

export default function StarRating({ rating = 0, size = 16, showValue = false }) {
  const value = Math.max(0, Math.min(5, Number(rating) || 0));

  return (
    <span className="inline-flex items-center gap-0.5" role="img" aria-label={`${value.toFixed(1)} out of 5 stars`}>
      {showValue && <span className="mr-1 text-sm">{value.toFixed(1)}</span>}
      {Array.from({ length: 5 }, (_, i) => (
        <Star key={i} size={size} fill={Math.max(0, Math.min(1, value - i))} />
      ))}
    </span>
  );
}
