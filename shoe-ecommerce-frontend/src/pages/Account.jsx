import { Link } from 'react-router-dom';
import { ArchiveBoxIcon, HeartIcon, LockClosedIcon, MapPinIcon, ShieldCheckIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../context/AuthContext';
import usePageTitle from '../hooks/usePageTitle';

const CARDS = [
  { title: 'Your Orders', text: 'Track, return, cancel or buy things again', to: '/orders', Icon: ArchiveBoxIcon },
  { title: 'Login & security', text: 'Edit your name and change your password', to: '/account/settings#security', Icon: LockClosedIcon },
  { title: 'Your Addresses', text: 'Edit your default delivery address', to: '/account/settings#address', Icon: MapPinIcon },
  { title: 'Your Wish List', text: 'View and manage the shoes you saved', to: '/wishlist', Icon: HeartIcon },
];

export default function Account() {
  usePageTitle('Your Account');
  const { user, isAdmin } = useAuth();

  const cards = isAdmin
    ? [...CARDS, { title: 'Admin Dashboard', text: 'Manage products and customer orders', to: '/admin', Icon: ShieldCheckIcon }]
    : CARDS;

  return (
    <div className="mx-auto max-w-[1000px] px-3 py-4 sm:px-4">
      <h1 className="mb-1 text-[28px] font-medium">Your Account</h1>
      <p className="mb-4 text-sm text-[#565959]">Signed in as {user.email}</p>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map(({ title, text, to, Icon }) => (
          <Link key={title} to={to} className="card flex gap-4 p-5 text-[#0f1111] transition hover:bg-[#f7fafa] hover:text-[#0f1111] hover:no-underline">
            <Icon className="h-12 w-12 shrink-0 text-[#565959]" aria-hidden="true" />
            <span>
              <span className="block text-lg font-medium">{title}</span>
              <span className="block text-sm text-[#565959]">{text}</span>
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
