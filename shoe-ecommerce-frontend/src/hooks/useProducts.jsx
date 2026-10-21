import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import apiFetch from '../utils/apiFetch.jsx';
import { normalizeProduct } from '../utils/productUtils.js';

export default function useProducts(filters = {}) {
  const [state, setState] = useState({ products: [], total: 0, pages: 1, loading: true, error: false });
  const key = JSON.stringify(filters);

  useEffect(() => {
    const controller = new AbortController();
    const params = new URLSearchParams();

    Object.entries(JSON.parse(key)).forEach(([name, value]) => {
      if (value !== '' && value !== undefined && value !== null && value !== false) {
        params.set(name, String(value));
      }
    });

    setState((prev) => ({ ...prev, loading: true, error: false }));

    apiFetch(`/api/products?${params.toString()}`, { signal: controller.signal })
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Failed to fetch products');
        setState({
          products: (data.products || []).map(normalizeProduct),
          total: data.total ?? 0,
          pages: data.pages ?? 1,
          loading: false,
          error: false,
        });
      })
      .catch((err) => {
        if (err.name === 'AbortError') return;
        toast.error(err.message || 'Failed to fetch products');
        setState((prev) => ({ ...prev, loading: false, error: true }));
      });

    return () => controller.abort();
  }, [key]);

  return state;
}
