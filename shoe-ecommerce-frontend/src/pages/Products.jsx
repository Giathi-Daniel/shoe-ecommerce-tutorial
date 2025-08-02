import { useState, useEffect, useCallback } from "react";
import ProductCard from "../components/ProductCard";
import useInfiniteScroll from "../hooks/useInfiniteScroll";
import useDebounce from "../hooks/useDebounce";

export default function Products() {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);

  const debouncedSearch = useDebounce(search, 300);

  const fetchProducts = useCallback(async () => {
    if (!hasMore) return;

    try {
        setLoading(true);

        const params = new URLSearchParams({
        page,
        search,
        category: categoryFilter,
        sort,
        min: "0", 
        max: "1000",
        });

        const res = await fetch(`/api/products?${params.toString()}`, {
        headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        });

        const data = await res.json();

        if (!data || data.products.length === 0) {
        setHasMore(false);
        return;
        }

        setProducts((prev) => [...prev, ...data.products]);
    } catch (err) {
        console.error("Failed to fetch products", err);
    } finally {
        setLoading(false);
    }
  }, [page, hasMore, search, categoryFilter, sort]);



  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  useEffect(() => {
    setProducts([])
    setPage(1)
    setHasMore(true)
  }, [debouncedSearch, categoryFilter, sort])


  const loadNextPage = () => setPage((prev) => prev + 1);
  const lastElementRef = useInfiniteScroll(loadNextPage, hasMore, loading);

  const filteredProducts = products;

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

      {/* Product Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3">
        {filteredProducts.map((product, idx) => {
          const isLast = idx === filteredProducts.length - 1;
          return (
            <div key={product._id} ref={isLast ? lastElementRef : null}>
              <ProductCard product={product} />
            </div>
          );
        })}
      </div>

      {loading && <p className="mt-4 text-center">Loading...</p>}
      {!hasMore && !loading && (
        <p className="mt-4 text-center text-gray-500">No more products.</p>
      )}
    </section>
  );
}