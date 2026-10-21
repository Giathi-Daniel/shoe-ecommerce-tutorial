import { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import ProductCard from './ProductCard';
import { ProductCardSkeleton } from './Skeletons';

export default function ProductRow({ title, products, loading = false, seeMoreTo }) {
  const scroller = useRef(null);
  const [edges, setEdges] = useState({ start: true, end: false });

  const updateEdges = useCallback(() => {
    const el = scroller.current;
    if (!el) return;
    setEdges({
      start: el.scrollLeft <= 4,
      end: el.scrollLeft + el.clientWidth >= el.scrollWidth - 4,
    });
  }, []);

  useEffect(() => {
    updateEdges();
    window.addEventListener('resize', updateEdges);
    return () => window.removeEventListener('resize', updateEdges);
  }, [products, loading, updateEdges]);

  const scrollBy = (direction) => {
    const el = scroller.current;
    el?.scrollBy({ left: direction * el.clientWidth * 0.85, behavior: 'smooth' });
  };

  if (!loading && !products.length) return null;

  return (
    <section className="card relative p-4" aria-label={title}>
      <div className="mb-3 flex items-baseline gap-4">
        <h2 className="text-xl font-bold sm:text-[21px]">{title}</h2>
        {seeMoreTo && <Link to={seeMoreTo} className="text-sm">See more</Link>}
      </div>

      {!edges.start && (
        <button
          type="button"
          onClick={() => scrollBy(-1)}
          aria-label="Scroll left"
          className="absolute left-1 top-1/2 z-10 hidden h-20 w-10 -translate-y-1/2 items-center justify-center rounded border border-line bg-white shadow-pop hover:bg-[#f7fafa] md:flex"
        >
          <ChevronLeftIcon className="h-6 w-6" />
        </button>
      )}
      {!edges.end && (
        <button
          type="button"
          onClick={() => scrollBy(1)}
          aria-label="Scroll right"
          className="absolute right-1 top-1/2 z-10 hidden h-20 w-10 -translate-y-1/2 items-center justify-center rounded border border-line bg-white shadow-pop hover:bg-[#f7fafa] md:flex"
        >
          <ChevronRightIcon className="h-6 w-6" />
        </button>
      )}

      <div
        ref={scroller}
        onScroll={updateEdges}
        className="scrollbar-none -mx-1 flex snap-x gap-3 overflow-x-auto px-1 pb-1"
      >
        {(loading ? Array.from({ length: 6 }) : products).map((product, i) => (
          <div key={product?._id || i} className="w-[44%] shrink-0 snap-start sm:w-[30%] md:w-[23%] lg:w-[18%] xl:w-[16.2%]">
            {product ? <ProductCard product={product} compact /> : <ProductCardSkeleton />}
          </div>
        ))}
      </div>
    </section>
  );
}
