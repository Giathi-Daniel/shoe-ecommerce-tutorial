import { useEffect, useRef, useCallback } from "react";

export default function useInfiniteScroll(callback, hasMore, loading) {
  const observer = useRef(null);

  const lastElementRef = useCallback(
    (node) => {
      if (loading) return;
      if (observer.current) observer.current.disconnect();

      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore) {
          callback();
        }
      });

      if (node) observer.current.observe(node);
    },
    [callback, hasMore, loading]
  );

  return lastElementRef;
}
