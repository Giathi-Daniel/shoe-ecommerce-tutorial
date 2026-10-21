import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/20/solid';

function getPages(current, total) {
  const pages = new Set([1, total, current - 1, current, current + 1]);
  const sorted = [...pages].filter((p) => p >= 1 && p <= total).sort((a, b) => a - b);
  return sorted.flatMap((page, i) => (i > 0 && page - sorted[i - 1] > 1 ? ['gap-' + page, page] : [page]));
}

export default function Pagination({ page, pages, onChange }) {
  if (pages <= 1) return null;

  const base = 'flex h-9 min-w-9 items-center justify-center rounded border px-2 text-sm';

  return (
    <nav aria-label="Pagination" className="mt-8 flex flex-wrap items-center justify-center gap-1.5">
      <button
        type="button"
        disabled={page === 1}
        onClick={() => onChange(page - 1)}
        className={`${base} border-line bg-white hover:bg-[#f7fafa] disabled:opacity-40`}
      >
        <ChevronLeftIcon className="h-4 w-4" /> Previous
      </button>

      {getPages(page, pages).map((entry) =>
        typeof entry === 'string' ? (
          <span key={entry} className="px-1 text-[#565959]">…</span>
        ) : (
          <button
            key={entry}
            type="button"
            onClick={() => onChange(entry)}
            aria-current={entry === page ? 'page' : undefined}
            className={`${base} ${entry === page ? 'border-[#e77600] bg-[#fef8f0] font-bold shadow-[0_0_0_1px_#e77600]' : 'border-line bg-white hover:bg-[#f7fafa]'}`}
          >
            {entry}
          </button>
        )
      )}

      <button
        type="button"
        disabled={page === pages}
        onClick={() => onChange(page + 1)}
        className={`${base} border-line bg-white hover:bg-[#f7fafa] disabled:opacity-40`}
      >
        Next <ChevronRightIcon className="h-4 w-4" />
      </button>
    </nav>
  );
}
