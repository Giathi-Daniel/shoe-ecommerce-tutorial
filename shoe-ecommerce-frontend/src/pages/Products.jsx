import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Dialog, DialogBackdrop, DialogPanel } from '@headlessui/react';
import { AdjustmentsHorizontalIcon, MagnifyingGlassIcon, XMarkIcon } from '@heroicons/react/24/outline';
import ProductCard from '../components/ProductCard';
import FilterPanel from '../components/FilterPanel';
import Pagination from '../components/Pagination';
import EmptyState from '../components/EmptyState';
import { ProductGridSkeleton } from '../components/Skeletons';
import useProducts from '../hooks/useProducts';
import useProductMeta from '../hooks/useProductMeta';
import usePageTitle from '../hooks/usePageTitle';
import { CATEGORIES, SORT_OPTIONS } from '../utils/productUtils.js';

const PAGE_SIZE = 20;
const FILTER_KEYS = ['search', 'category', 'brand', 'min', 'max', 'rating', 'deals', 'inStock', 'featured', 'sort'];

export default function Products() {
  const [params, setParams] = useSearchParams();
  const [filtersOpen, setFiltersOpen] = useState(false);
  const meta = useProductMeta();

  const filters = useMemo(
    () => Object.fromEntries(FILTER_KEYS.map((key) => [key, params.get(key) || ''])),
    [params]
  );
  const page = Math.max(Number(params.get('page')) || 1, 1);

  const { products, total, pages, loading } = useProducts({ ...filters, page, limit: PAGE_SIZE });

  const title = filters.search
    ? `Results for "${filters.search}"`
    : filters.deals === 'true'
      ? "Today's Deals"
      : CATEGORIES.find((c) => c.value === filters.category)?.full || 'All Shoes';
  usePageTitle(title);

  const update = (changes, { keepPage = false } = {}) => {
    const next = new URLSearchParams(params);
    Object.entries(changes).forEach(([key, value]) => (value ? next.set(key, value) : next.delete(key)));
    if (!keepPage) next.delete('page');
    setParams(next);
  };

  const clearFilters = () => setParams(filters.search ? { search: filters.search } : {});

  const changePage = (nextPage) => {
    update({ page: nextPage > 1 ? String(nextPage) : '' }, { keepPage: true });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const chips = [
    ...filters.category.split(',').filter(Boolean).map((value) => ({ key: 'category', value, label: CATEGORIES.find((c) => c.value === value)?.label || value })),
    ...filters.brand.split(',').filter(Boolean).map((value) => ({ key: 'brand', value, label: value })),
    ...(filters.rating ? [{ key: 'rating', label: `${filters.rating}★ & up` }] : []),
    ...(filters.min || filters.max ? [{ key: 'price', label: `$${filters.min || 0} - ${filters.max ? `$${filters.max}` : 'any'}` }] : []),
    ...(filters.deals === 'true' ? [{ key: 'deals', label: "Today's Deals" }] : []),
    ...(filters.inStock === 'true' ? [{ key: 'inStock', label: 'In stock' }] : []),
  ];

  const removeChip = ({ key, value }) => {
    if (key === 'price') return update({ min: '', max: '' });
    if (value) {
      const list = filters[key].split(',').filter((v) => v !== value);
      return update({ [key]: list.join(',') });
    }
    update({ [key]: '' });
  };

  const rangeStart = total === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const rangeEnd = Math.min(page * PAGE_SIZE, total);

  const panel = <FilterPanel filters={filters} meta={meta} onChange={update} onClear={clearFilters} />;

  return (
    <div className="mx-auto max-w-[1500px] px-3 py-4 sm:px-4">
      <div className="mb-3 flex flex-wrap items-center gap-x-4 gap-y-2 border-b border-line bg-white px-4 py-2.5 text-sm shadow-card rounded">
        <button
          type="button"
          onClick={() => setFiltersOpen(true)}
          className="btn-light lg:hidden"
        >
          <AdjustmentsHorizontalIcon className="h-4 w-4" /> Filters{chips.length > 0 && ` (${chips.length})`}
        </button>

        <p aria-live="polite" className="min-w-0 flex-1">
          {loading ? 'Loading results…' : total === 0 ? 'No results' : `${rangeStart}-${rangeEnd} of ${total} results`}
          {filters.search && <> for <span className="font-bold text-price">“{filters.search}”</span></>}
        </p>

        <label className="flex items-center gap-2">
          <span className="hidden sm:inline">Sort by:</span>
          <select
            value={filters.sort}
            onChange={(e) => update({ sort: e.target.value })}
            className="rounded-lg border border-[#d5d9d9] bg-[#f0f2f2] px-2 py-1 text-sm shadow-sm hover:bg-[#e3e6e6]"
          >
            {SORT_OPTIONS.map(({ label, value }) => (
              <option key={label} value={value}>{label}</option>
            ))}
          </select>
        </label>
      </div>

      <div className="flex items-start gap-4">
        <aside className="card sticky top-[150px] hidden max-h-[calc(100vh-170px)] w-56 shrink-0 overflow-y-auto px-4 py-2 lg:block" aria-label="Filters">
          {panel}
        </aside>

        <section className="min-w-0 flex-1">
          <h1 className="mb-2 text-2xl font-bold">{title}</h1>

          {chips.length > 0 && (
            <div className="mb-3 flex flex-wrap items-center gap-2">
              {chips.map((chip) => (
                <button
                  key={`${chip.key}-${chip.value || chip.label}`}
                  type="button"
                  onClick={() => removeChip(chip)}
                  className="flex items-center gap-1 rounded-full border border-line bg-white px-3 py-1 text-xs hover:bg-[#f7fafa]"
                >
                  {chip.label} <XMarkIcon className="h-3 w-3" aria-label="Remove filter" />
                </button>
              ))}
              <button type="button" onClick={clearFilters} className="text-xs text-link hover:underline">Clear all</button>
            </div>
          )}

          {loading ? (
            <ProductGridSkeleton count={8} className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-4" />
          ) : products.length === 0 ? (
            <EmptyState
              icon={MagnifyingGlassIcon}
              title="No results found"
              action={<button type="button" onClick={() => setParams({})} className="btn-cta">Clear search and filters</button>}
            >
              Try checking your spelling, use more general terms or remove some filters.
            </EmptyState>
          ) : (
            <div className="grid animate-fade-in grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-4">
              {products.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          )}

          {!loading && <Pagination page={page} pages={pages} onChange={changePage} />}
        </section>
      </div>

      <Dialog open={filtersOpen} onClose={() => setFiltersOpen(false)} className="relative z-[100] lg:hidden">
        <DialogBackdrop className="fixed inset-0 bg-black/50" />
        <DialogPanel className="fixed inset-y-0 left-0 flex w-[85%] max-w-sm flex-col bg-white shadow-pop">
          <div className="flex items-center justify-between border-b border-line px-4 py-3">
            <h2 className="text-lg font-bold">Filters</h2>
            <button type="button" onClick={() => setFiltersOpen(false)} aria-label="Close filters"><XMarkIcon className="h-6 w-6" /></button>
          </div>
          <div className="flex-1 overflow-y-auto px-4">{panel}</div>
          <div className="border-t border-line p-3">
            <button type="button" onClick={() => setFiltersOpen(false)} className="btn-cta w-full">
              Show {total} result{total === 1 ? '' : 's'}
            </button>
          </div>
        </DialogPanel>
      </Dialog>
    </div>
  );
}
