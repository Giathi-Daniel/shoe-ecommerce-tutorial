export default function Footer() {
  return (
    <footer className="pt-10 pb-6 mt-10 text-white bg-gray-900">
      <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 md:grid-cols-3">
          
          {/* Logo and Description */}
          <div>
            <h2 className="text-2xl font-bold">
              Shoe<span className="text-accent">Store</span>
            </h2>
            <p className="mt-3 text-sm text-gray-400">
              The best place to buy stylish and comfortable shoes. Quality guaranteed, prices you'll love.
            </p>
          </div>

          {/* Navigation Links */}
          <div>
            <h3 className="mb-4 text-lg font-semibold">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li><a href="/" className="hover:text-accent">Home</a></li>
              <li><a href="/products" className="hover:text-accent">Products</a></li>
              <li><a href="/cart" className="hover:text-accent">Cart</a></li>
              <li><a href="/login" className="hover:text-accent">Login</a></li>
            </ul>
          </div>

          {/* Contact & Social */}
          <div>
            <h3 className="mb-4 text-lg font-semibold">Contact</h3>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>Email: support@shoestore.com</li>
              <li>Phone: +254 716 738 500</li>
            </ul>

            {/* SOcials */}
            <div className="flex mt-4 space-x-4">
              <a href="#" className="hover:text-accent">Facebook</a>
              <a href="#" className="hover:text-accent">Twitter</a>
              <a href="#" className="hover:text-accent">Instagram</a>
            </div>
          </div>
        </div>

        <div className="pt-6 mt-10 text-sm text-center text-gray-500 border-t border-gray-700">
          &copy; {new Date().getFullYear()} ShoeStore. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
