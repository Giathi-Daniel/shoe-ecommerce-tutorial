import { Link } from 'react-router-dom';

export default function Logo({ dark = false, className = '' }) {
  return (
    <Link
      to="/"
      aria-label="ShoeStore home"
      className={`relative inline-flex flex-col rounded px-1.5 py-1 leading-none hover:no-underline ${dark ? 'text-[#0f1111] hover:text-[#0f1111]' : 'text-white hover:text-white'} ${className}`}
    >
      <span className="text-2xl font-bold tracking-tight">
        shoe<span className="text-brand">store</span>
      </span>
      <svg viewBox="0 0 100 10" className="-mt-0.5 h-2 w-full text-brand" aria-hidden="true">
        <path d="M4 2c30 9 62 9 92 0" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
      </svg>
    </Link>
  );
}
