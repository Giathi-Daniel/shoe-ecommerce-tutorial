import { useState } from 'react';
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const menuItems = [
    { label: 'Home', href: '/' },
    { label: 'Products', href: '/products' },
    { label: 'Cart', href: '/cart' },
    { label: 'Login', href: '/login' },
  ];

  return (
    <header className="fixed top-0 z-50 w-full text-white shadow-lg bg-primary">
      <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="text-2xl font-bold">
            Shoe<span className="text-accent">Store</span>
          </div>

          {/* Desktop Menu */}
          <nav className="hidden space-x-6 md:flex">
            {menuItems.map((item) => (
              <a
                key={item.label}
                href={item.href}
                className="transition hover:text-accent"
              >
                {item.label}
              </a>
            ))}
          </nav>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden focus:outline-none"
            onClick={() => setMobileMenuOpen(true)}
          >
            <Bars3Icon className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Backdrop Overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-black bg-opacity-50"
          onClick={() => setMobileMenuOpen(false)}
        ></div>
      )}

      {/* Slide-in Mobile Menu */}
      <div
        className={`fixed top-0 left-0 z-50 h-full w-4/5 bg-secondary text-white transform transition-transform duration-300 ease-in-out ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        } md:hidden`}
      >
        <div className="flex items-center justify-between px-4 py-4 border-b border-white/20">
          <div className="text-xl font-bold">
            Menu
          </div>
          <button onClick={() => setMobileMenuOpen(false)}>
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>
        <nav className="flex flex-col px-4 py-6 space-y-4">
          {menuItems.map((item) => (
            <a
              key={item.label}
              href={item.href}
              className="text-lg hover:text-accent"
              onClick={() => setMobileMenuOpen(false)}
            >
              {item.label}
            </a>
          ))}
        </nav>
      </div>
    </header>
  );
}
