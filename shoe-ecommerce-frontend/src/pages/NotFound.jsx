import { Link } from 'react-router-dom';
import usePageTitle from '../hooks/usePageTitle';

export default function NotFound() {
  usePageTitle('Page not found');

  return (
    <div className="mx-auto flex max-w-lg flex-col items-center px-4 py-20 text-center">
      <p className="text-7xl font-bold text-brand">404</p>
      <h1 className="mt-2 text-2xl font-medium">Looking for something?</h1>
      <p className="mt-2 text-sm text-[#565959]">We&apos;re sorry. The page you requested was not found on our site.</p>
      <div className="mt-6 flex gap-2">
        <Link to="/" className="btn-cta hover:text-[#0f1111]">Go to home</Link>
        <Link to="/products" className="btn-light hover:text-[#0f1111]">Browse shoes</Link>
      </div>
    </div>
  );
}
