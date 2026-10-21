import { useEffect, useState } from 'react';
import apiFetch from '../utils/apiFetch.jsx';

const EMPTY_META = { categories: [], brands: [], priceRange: { min: 0, max: 0 } };

export default function useProductMeta() {
  const [meta, setMeta] = useState(EMPTY_META);

  useEffect(() => {
    let cancelled = false;
    apiFetch('/api/products/meta')
      .then((res) => (res.ok ? res.json() : EMPTY_META))
      .then((data) => !cancelled && setMeta({ ...EMPTY_META, ...data }))
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  return meta;
}
