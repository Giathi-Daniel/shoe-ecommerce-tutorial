import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import apiFetch from '../utils/apiFetch.jsx';
import { normalizeProduct } from '../utils/productUtils.js';

export default function useProducts({ limit = 0, search = '', categoryFilter = '', sort = '', page = 1 }) {
  const [products, setProducts] = useState([]);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const controller = new AbortController();

    async function fetchProducts() {
      setLoading(true);

      try {
        const params = new URLSearchParams({
          page: String(page),
          search: search.trim(),
          category: categoryFilter,
          sort,
          min: '0',
          max: '1000',
        });

        if (limit > 0) {
          params.append('limit', String(limit));
        }

        const res = await apiFetch(`/api/products?${params.toString()}`, {
          method: 'GET',
          signal: controller.signal,
        });

        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.message || 'Failed to fetch products');
        }

        const data = await res.json();
        const nextProducts = Array.isArray(data.products)
          ? data.products.map(normalizeProduct)
          : [];

        setProducts((prev) => (page === 1 ? nextProducts : [...prev, ...nextProducts]));
        setHasMore(limit > 0 ? nextProducts.length >= limit : nextProducts.length > 0);

      } catch (err) {
        if (err.name === 'AbortError') return;

        console.error("Failed to fetch products", err);
        toast.error(err.message || 'Failed to fetch products');
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    fetchProducts();

    return () => controller.abort();
  }, [page, search, categoryFilter, sort, limit]);

  return { products, loading, hasMore };
}
