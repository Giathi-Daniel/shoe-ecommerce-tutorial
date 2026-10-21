import { Link } from 'react-router-dom';
import Logo from './Logo';

export default function AuthLayout({ title, children, footer }) {
  return (
    <div className="mx-auto flex w-full max-w-[350px] flex-col items-center px-4 py-8">
      <Logo dark />
      <div className="card mt-4 w-full p-5">
        <h1 className="mb-3 text-[28px] font-normal leading-tight">{title}</h1>
        {children}
      </div>
      {footer && <div className="mt-5 w-full text-center text-xs">{footer}</div>}
      <div className="mt-8 w-full border-t border-line pt-5 text-center text-xs text-[#565959]">
        <Link to="/help/terms" className="mr-4">Conditions of Use</Link>
        <Link to="/help/privacy">Privacy Notice</Link>
        <p className="mt-1">&copy; {new Date().getFullYear()} ShoeStore</p>
      </div>
    </div>
  );
}
