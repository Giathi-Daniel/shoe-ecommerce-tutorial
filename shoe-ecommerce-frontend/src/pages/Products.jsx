import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import ProductCard from "../components/ProductCard";
import useDebounce from "../hooks/useDebounce"; 
import useProducts from "../hooks/useProducts";
import ProductSlider from "../components/ProductSlider"; 

const categories = [
  { label: 'Men', value: 'men' },
  { label: 'Women', value: 'women' },
  { label: 'Kids', value: 'kids' },
  { label: 'Sports', value: 'sports' },
  { label: 'Casual', value: 'casual' },
  { label: 'Formal', value: 'formal' },
];

export default function Products() {
  const [searchParams] = useSearchParams();
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("");
  const [categoryFilter, setCategoryFilter] = useState(searchParams.get('category') || "");
  const [page, setPage] = useState(1);

  const debouncedSearch = useDebounce(search, 300);

  const { products, loading, hasMore } = useProducts({
    limit: 16, 
    search: debouncedSearch,
    categoryFilter,
    sort,
    page,
  });

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, categoryFilter, sort]);

  return (
    <section className="px-4 py-10 mx-auto mt-10 max-w-7xl">
      {/* Filters */}
      <div className="flex flex-col items-start justify-between gap-4 mb-6 md:flex-row">
        <input
          type="text"
          placeholder="Search products..."
          className="w-full p-2 border border-gray-300 rounded-lg md:w-1/3"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          className="w-full p-2 border border-gray-300 rounded-lg md:w-1/4"
          value={sort}
          onChange={(e) => setSort(e.target.value)}
        >
          <option value="">Sort by</option>
          <option value="price-asc">Price: Low to High</option>
          <option value="price-desc">Price: High to Low</option>
        </select>
        <select
          className="w-full p-2 border border-gray-300 rounded-lg md:w-1/4"
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
        >
          <option value="">All Categories</option>
          {categories.map((category) => (
            <option key={category.value} value={category.value}>
              {category.label}
            </option>
          ))}
        </select>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {products.map((product) => (
          <div key={product._id}>
            <ProductCard product={product} />
          </div>
        ))}
      </div>

      {hasMore && products.length > 0 && (
        <div className="mt-8 text-center">
          <button
            onClick={() => setPage((p) => p + 1)}
            disabled={loading}
            className="px-6 py-2 bg-primary text-white rounded hover:bg-secondary transition disabled:opacity-50"
          >
            {loading ? 'Loading...' : 'Load More'}
          </button>
        </div>
      )}

      {products.length >= 8 && (
        <ProductSlider products={products} />
      )}


    </section>
  );
}
