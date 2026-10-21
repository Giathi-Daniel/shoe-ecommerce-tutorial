import { Link } from 'react-router-dom';
import Logo from './Logo';
import { CATEGORIES } from '../utils/productUtils.js';

const COLUMNS = [
  {
    title: 'Get to Know Us',
    links: [
      { label: 'About ShoeStore', to: '/help/about' },
      { label: 'Contact Us', to: '/help/contact' },
      { label: 'Privacy Notice', to: '/help/privacy' },
      { label: 'Terms of Use', to: '/help/terms' },
    ],
  },
  {
    title: 'Shop by Category',
    links: CATEGORIES.map(({ full, value }) => ({ label: full, to: `/products?category=${value}` })),
  },
  {
    title: 'Let Us Help You',
    links: [
      { label: 'Your Account', to: '/account' },
      { label: 'Your Orders', to: '/orders' },
      { label: 'Shipping & Delivery', to: '/help/shipping' },
      { label: 'Returns & Replacements', to: '/help/returns' },
      { label: 'Your Wishlist', to: '/wishlist' },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="text-white">
      <button
        type="button"
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        className="w-full bg-nav-hover py-3.5 text-center text-[13px] hover:bg-[#485769]"
      >
        Back to top
      </button>

      <div className="bg-nav-light">
        <div className="mx-auto grid max-w-[1000px] grid-cols-2 gap-8 px-6 py-10 md:grid-cols-3">
          {COLUMNS.map(({ title, links }) => (
            <div key={title}>
              <h3 className="mb-3 text-base font-bold">{title}</h3>
              <ul className="space-y-2 text-sm">
                {links.map(({ label, to }) => (
                  <li key={label}>
                    <Link to={to} className="text-[#ddd] hover:text-white hover:underline">{label}</Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      <div className="border-t border-[#3a4553] bg-nav py-8 text-center">
        <Logo className="mx-auto" />
        <ul className="mt-4 flex flex-wrap justify-center gap-x-5 gap-y-1 px-4 text-xs text-[#ddd]">
          <li><Link to="/help/terms" className="text-[#ddd] hover:text-white">Conditions of Use</Link></li>
          <li><Link to="/help/privacy" className="text-[#ddd] hover:text-white">Privacy Notice</Link></li>
          <li><Link to="/help/contact" className="text-[#ddd] hover:text-white">support@shoestore.com</Link></li>
        </ul>
        <p className="mt-2 text-xs text-[#ddd]">&copy; {new Date().getFullYear()} ShoeStore. A portfolio project: no real orders are fulfilled.</p>
      </div>
    </footer>
  );
}
