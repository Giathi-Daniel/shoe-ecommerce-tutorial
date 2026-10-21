import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { Dialog, DialogBackdrop, DialogPanel, Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react';
import {
  Bars3Icon,
  ChevronDownIcon,
  MagnifyingGlassIcon,
  MapPinIcon,
  ShoppingCartIcon,
  UserCircleIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import Logo from './Logo';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import useDebounce from '../hooks/useDebounce';
import apiFetch from '../utils/apiFetch.jsx';
import { CATEGORIES } from '../utils/productUtils.js';

const NAV_LINKS = [
  { label: "Today's Deals", to: '/products?deals=true' },
  ...CATEGORIES.map(({ label, value }) => ({ label, to: `/products?category=${value}` })),
  { label: 'Best Sellers', to: '/products?sort=popular' },
  { label: 'New Arrivals', to: '/products?sort=newest' },
  { label: 'Customer Service', to: '/help/contact' },
];

function SearchBar({ idPrefix }) {
  const [params] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();
  const onResults = location.pathname === '/products';

  const [query, setQuery] = useState(onResults ? params.get('search') || '' : '');
  const [category, setCategory] = useState(onResults ? params.get('category') || '' : '');
  const [suggestions, setSuggestions] = useState([]);
  const [open, setOpen] = useState(false);
  const wrapper = useRef(null);
  const debounced = useDebounce(query.trim(), 250);

  useEffect(() => {
    if (debounced.length < 2) {
      setSuggestions([]);
      return;
    }
    const controller = new AbortController();
    apiFetch(`/api/products?search=${encodeURIComponent(debounced)}&limit=6`, { signal: controller.signal })
      .then((res) => (res.ok ? res.json() : { products: [] }))
      .then((data) => setSuggestions(data.products || []))
      .catch(() => {});
    return () => controller.abort();
  }, [debounced]);

  useEffect(() => {
    const close = (e) => !wrapper.current?.contains(e.target) && setOpen(false);
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, []);

  const submit = (term = query) => {
    const next = new URLSearchParams();
    if (term.trim()) next.set('search', term.trim());
    if (category) next.set('category', category);
    setOpen(false);
    navigate(`/products${next.toString() ? `?${next}` : ''}`);
  };

  return (
    <form
      role="search"
      onSubmit={(e) => {
        e.preventDefault();
        submit();
      }}
      ref={wrapper}
      className="relative flex h-10 w-full rounded-md focus-within:ring-[3px] focus-within:ring-brand"
    >
      <label htmlFor={`${idPrefix}-category`} className="sr-only">Search category</label>
      <select
        id={`${idPrefix}-category`}
        value={category}
        onChange={(e) => setCategory(e.target.value)}
        className="hidden w-[72px] max-w-[160px] shrink-0 cursor-pointer rounded-l-md border-0 bg-[#e6e6e6] px-2 text-xs text-[#555] hover:bg-[#d4d4d4] focus:outline-none focus:ring-0 sm:block sm:w-auto"
      >
        <option value="">All</option>
        {CATEGORIES.map(({ label, value }) => (
          <option key={value} value={value}>{label}</option>
        ))}
      </select>

      <label htmlFor={`${idPrefix}-search`} className="sr-only">Search ShoeStore</label>
      <input
        id={`${idPrefix}-search`}
        type="search"
        value={query}
        autoComplete="off"
        placeholder="Search ShoeStore"
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        className="min-w-0 flex-1 rounded-l-md border-0 px-3 text-[15px] text-[#0f1111] focus:outline-none focus:ring-0 sm:rounded-none"
      />

      <button
        type="submit"
        aria-label="Search"
        className="flex w-11 shrink-0 items-center justify-center rounded-r-md bg-brand-soft text-nav hover:bg-brand"
      >
        <MagnifyingGlassIcon className="h-6 w-6" strokeWidth={2} />
      </button>

      {open && suggestions.length > 0 && (
        <ul className="absolute left-0 right-0 top-11 z-50 overflow-hidden rounded-md border border-line bg-white py-1 text-[#0f1111] shadow-pop">
          {suggestions.map((product) => (
            <li key={product._id}>
              <button
                type="button"
                onClick={() => {
                  setOpen(false);
                  navigate(`/products/${product._id}`);
                }}
                className="flex w-full items-center gap-3 px-3 py-2 text-left text-sm hover:bg-[#f0f2f2]"
              >
                <MagnifyingGlassIcon className="h-4 w-4 shrink-0 text-[#565959]" />
                <span className="truncate">{product.name}</span>
                <span className="ml-auto shrink-0 text-xs text-[#565959]">in {product.category}</span>
              </button>
            </li>
          ))}
          <li className="border-t border-line">
            <button type="button" onClick={() => submit()} className="w-full px-3 py-2 text-left text-sm text-link hover:bg-[#f0f2f2]">
              See all results for “{query.trim()}”
            </button>
          </li>
        </ul>
      )}
    </form>
  );
}

function AccountMenu() {
  const { user, isAdmin, logout } = useAuth();
  const location = useLocation();
  const item = 'block px-4 py-1.5 text-sm text-[#0f1111] hover:text-link-hover hover:underline';

  return (
    <Menu as="div" className="relative hidden lg:block">
      <MenuButton className="flex flex-col rounded border border-transparent px-2 py-1 text-left leading-tight text-white hover:border-white">
        <span className="text-xs">Hello, {user ? user.name.split(' ')[0] : 'sign in'}</span>
        <span className="flex items-center text-sm font-bold">
          Account &amp; Lists <ChevronDownIcon className="ml-0.5 h-3 w-3" strokeWidth={3} />
        </span>
      </MenuButton>

      <MenuItems anchor={{ to: 'bottom end', gap: 4 }} className="z-[60] w-72 rounded-md bg-white py-4 shadow-pop focus:outline-none">
        {!user && (
          <div className="mb-3 border-b border-line px-4 pb-4 text-center">
            <MenuItem>
              <Link to="/login" state={{ from: location.pathname + location.search }} className="btn-cta w-full hover:text-[#0f1111]">
                Sign in
              </Link>
            </MenuItem>
            <p className="mt-2 text-xs">
              New customer? <Link to="/signup">Start here.</Link>
            </p>
          </div>
        )}

        <div className="px-4 pb-1 text-base font-bold">Your Account</div>
        {[
          { label: 'Your Account', to: '/account' },
          { label: 'Your Orders', to: '/orders' },
          { label: 'Your Wishlist', to: '/wishlist' },
          ...(isAdmin ? [{ label: 'Admin Dashboard', to: '/admin' }] : []),
        ].map(({ label, to }) => (
          <MenuItem key={label}>
            <Link to={to} className={item}>{label}</Link>
          </MenuItem>
        ))}
        {user && (
          <MenuItem>
            <button type="button" onClick={logout} className={`${item} w-full text-left`}>Sign Out</button>
          </MenuItem>
        )}
      </MenuItems>
    </Menu>
  );
}

function Drawer({ open, onClose }) {
  const { user, isAdmin, logout } = useAuth();
  const row = 'flex items-center justify-between px-5 py-3 text-sm text-[#111] hover:bg-[#eaeded] hover:text-[#111] hover:no-underline';

  const section = (title, links) => (
    <div className="border-b border-line py-3">
      <h3 className="px-5 pb-1 text-lg font-bold">{title}</h3>
      {links.map(({ label, to }) => (
        <Link key={label} to={to} onClick={onClose} className={row}>{label}</Link>
      ))}
    </div>
  );

  return (
    <Dialog open={open} onClose={onClose} className="relative z-[100]">
      <DialogBackdrop className="fixed inset-0 bg-black/60" />
      <DialogPanel className="fixed inset-y-0 left-0 w-[85%] max-w-[365px] overflow-y-auto bg-white shadow-pop">
        <div className="flex items-center gap-3 bg-nav-light px-5 py-3 text-lg font-bold text-white">
          <UserCircleIcon className="h-7 w-7" />
          <span className="truncate">Hello, {user ? user.name.split(' ')[0] : 'sign in'}</span>
          <button type="button" onClick={onClose} aria-label="Close menu" className="ml-auto">
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        {section('Shop by Department', [
          ...CATEGORIES.map(({ label, value }) => ({ label, to: `/products?category=${value}` })),
          { label: 'All Shoes', to: '/products' },
        ])}
        {section('Programs & Features', [
          { label: "Today's Deals", to: '/products?deals=true' },
          { label: 'Best Sellers', to: '/products?sort=popular' },
          { label: 'New Arrivals', to: '/products?sort=newest' },
        ])}
        {section('Your Account', [
          { label: 'Your Account', to: '/account' },
          { label: 'Your Orders', to: '/orders' },
          { label: 'Your Wishlist', to: '/wishlist' },
          ...(isAdmin ? [{ label: 'Admin Dashboard', to: '/admin' }] : []),
          ...(user ? [] : [{ label: 'Sign In', to: '/login' }]),
        ])}
        {section('Help & Settings', [
          { label: 'Customer Service', to: '/help/contact' },
          { label: 'Shipping & Delivery', to: '/help/shipping' },
          { label: 'Returns', to: '/help/returns' },
        ])}

        {user && (
          <button
            type="button"
            onClick={() => {
              onClose();
              logout();
            }}
            className={`${row} w-full`}
          >
            Sign Out
          </button>
        )}
      </DialogPanel>
    </Dialog>
  );
}

export default function Header() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const { user } = useAuth();
  const { itemCount } = useCart();
  const location = useLocation();

  useEffect(() => setDrawerOpen(false), [location.pathname]);

  const deliverTo = user?.address?.city
    ? `${user.address.city}, ${user.address.country}`
    : 'Select your address';

  return (
    <header className="sticky top-0 z-50 text-white">
      <div className="bg-nav">
        <div className="mx-auto flex max-w-[1500px] items-center gap-1 px-2 py-2 sm:gap-2 sm:px-3">
          <button
            type="button"
            onClick={() => setDrawerOpen(true)}
            aria-label="Open menu"
            className="rounded border border-transparent p-1.5 hover:border-white lg:hidden"
          >
            <Bars3Icon className="h-6 w-6" />
          </button>

          <Logo className="shrink-0 border border-transparent hover:border-white" />

          <Link
            to={user ? '/account/settings' : '/login'}
            className="hidden shrink-0 items-end gap-1 rounded border border-transparent px-2 py-1 text-white hover:border-white hover:text-white hover:no-underline xl:flex"
          >
            <MapPinIcon className="h-5 w-5" />
            <span className="flex flex-col leading-tight">
              <span className="text-xs text-[#ccc]">Deliver to</span>
              <span className="max-w-[140px] truncate text-sm font-bold">{deliverTo}</span>
            </span>
          </Link>

          <div className="mx-1 hidden flex-1 md:block">
            <SearchBar idPrefix="desktop" />
          </div>
          <div className="flex-1 md:hidden" />

          <AccountMenu />

          <Link
            to={user ? '/account' : '/login'}
            aria-label={user ? 'Your account' : 'Sign in'}
            className="rounded border border-transparent px-2 py-1 text-sm font-bold text-white hover:border-white hover:text-white hover:no-underline lg:hidden"
          >
            <span className="flex items-center gap-1">
              <UserCircleIcon className="h-6 w-6" />
              <span className="hidden sm:inline">{user ? user.name.split(' ')[0] : 'Sign in'}</span>
            </span>
          </Link>

          <Link
            to="/orders"
            className="hidden shrink-0 flex-col rounded border border-transparent px-2 py-1 leading-tight text-white hover:border-white hover:text-white hover:no-underline lg:flex"
          >
            <span className="text-xs">Returns</span>
            <span className="text-sm font-bold">&amp; Orders</span>
          </Link>

          <Link
            to="/cart"
            aria-label={`Cart, ${itemCount} item${itemCount === 1 ? '' : 's'}`}
            className="relative flex shrink-0 items-end gap-0.5 rounded border border-transparent px-2 py-1 text-white hover:border-white hover:text-white hover:no-underline"
          >
            <span className="relative">
              <ShoppingCartIcon className="h-8 w-8" />
              <span className="absolute -top-0.5 left-1/2 -translate-x-1/2 text-base font-bold leading-none text-brand">
                {itemCount > 99 ? '99+' : itemCount}
              </span>
            </span>
            <span className="hidden text-sm font-bold sm:inline">Cart</span>
          </Link>
        </div>

        <div className="px-2 pb-2 md:hidden">
          <SearchBar idPrefix="mobile" />
        </div>
      </div>

      <nav aria-label="Departments" className="bg-nav-light">
        <div className="scrollbar-none mx-auto flex max-w-[1500px] items-center gap-0.5 overflow-x-auto px-2 text-sm sm:px-3">
          <button
            type="button"
            onClick={() => setDrawerOpen(true)}
            className="hidden shrink-0 items-center gap-1 rounded border border-transparent px-2 py-1.5 font-bold hover:border-white lg:flex"
          >
            <Bars3Icon className="h-5 w-5" /> All
          </button>
          {NAV_LINKS.map(({ label, to }) => (
            <NavLink
              key={label}
              to={to}
              className="shrink-0 whitespace-nowrap rounded border border-transparent px-2 py-1.5 text-white hover:border-white hover:text-white hover:no-underline"
            >
              {label}
            </NavLink>
          ))}
        </div>
      </nav>

      <Drawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />
    </header>
  );
}
