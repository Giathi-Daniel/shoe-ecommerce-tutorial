export default function Home() {
  return (
    <div className="px-4 py-8 mx-auto max-w-7xl sm:px-6 lg:px-8">
      <h1 className="mb-6 text-3xl font-bold text-primary">
        Featured Shoes
      </h1>
      <p className="mb-4 text-gray-600">
        Discover our latest collection of stylish and comfortable shoes.
      </p>
      {/* Product list will go here */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {/* Placeholder for ProductCard components */}
        <div className="p-4 bg-white rounded-lg shadow-md">
          <div className="h-40 mb-4 bg-gray-200 rounded"></div>
          <h2 className="text-lg font-semibold">Sample Shoe</h2>
          <p className="mt-1 font-bold text-accent">$99.00</p>
        </div>
      </div>
    </div>
  );
}
