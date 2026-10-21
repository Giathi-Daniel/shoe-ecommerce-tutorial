import { useEffect } from 'react';

export default function usePageTitle(title) {
  useEffect(() => {
    document.title = title ? `${title} | ShoeStore` : 'ShoeStore: Shoes for Everyone';
  }, [title]);
}
