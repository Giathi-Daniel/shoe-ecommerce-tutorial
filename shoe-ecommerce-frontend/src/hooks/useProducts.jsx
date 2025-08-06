import { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';

export default function useProducts({ limit = 0, search = '', categoryFilter = '', sort = '', page = 1 }) {
  const [products, setProducts] = useState([]);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);

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

      if (limit > 0) {
        params.append('limit', limit);
      }

      const res = await fetch(`/api/products?${params.toString()}`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'Failed to fetch products');
      }

      const data = await res.json();

      if (!data || data.products.length === 0) {
        setHasMore(false);
        return;
      }

      setProducts((prev) => [...prev, ...data.products]);

    } catch (err) {
      console.error("Failed to fetch products", err);
      toast.error(err.message || 'Failed to fetch products');
    } finally {
      setLoading(false);
    }
  }, [page, hasMore, search, categoryFilter, sort, limit]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  return { products, loading, hasMore };
}