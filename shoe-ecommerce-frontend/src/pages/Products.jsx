import { useState, useEffect } from "react";
import ProductCard from "../components/ProductCard";
import useDebounce from "../hooks/useDebounce"; 
import useProducts from "../hooks/useProducts";
import ProductSlider from "../components/ProductSlider"; 

export default function Products() {
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [page, setPage] = useState(1);
  const [products, setProducts] = useState([]);

  const debouncedSearch = useDebounce(search, 300);

  const { products: fetchedProducts, loading, hasMore } = useProducts({
    limit: 16, 
    search: debouncedSearch,
    categoryFilter,
    sort,
    page,
  });

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, categoryFilter, sort]);

  useEffect(() => {
    if (page === 1) {
      setProducts(fetchedProducts); 
    } else {
      setProducts((prev) => [...prev, ...fetchedProducts]);
    }
  }, [fetchedProducts, page]);

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
          <option value="Sneakers">Sneakers</option>
          <option value="Formal">Formal</option>
          <option value="Running">Running</option>
        </select>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {products.slice(0, 16).map((product, idx) => (
          <div key={`${product._id}-${idx}`}>
            <ProductCard product={product} />
          </div>
        ))}
      </div>

      {products.length > 16 && (
        <ProductSlider products={products} />
      )}

      {loading && <p className="mt-4 text-center">Loading...</p>}
    </section>
  );
}