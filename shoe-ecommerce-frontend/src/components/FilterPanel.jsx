import { useState } from 'react';
import StarRating from './StarRating';
import { CATEGORIES } from '../utils/productUtils.js';

const PRICE_RANGES = [
  { label: 'Under $50', min: '', max: '50' },
  { label: '$50 to $100', min: '50', max: '100' },
  { label: '$100 to $150', min: '100', max: '150' },
  { label: '$150 & above', min: '150', max: '' },
];

function Section({ title, children }) {
  return (
    <section className="border-b border-line py-3 last:border-0">
      <h3 className="mb-1.5 text-sm font-bold">{title}</h3>
      {children}
    </section>
  );
}

function LinkButton({ active, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`block w-full py-0.5 text-left text-sm hover:text-link-hover ${active ? 'font-bold text-[#0f1111]' : 'text-[#0f1111]'}`}
    >
      {children}
    </button>
  );
}

export default function FilterPanel({ filters, meta, onChange, onClear }) {
  const [minInput, setMinInput] = useState(filters.min);
  const [maxInput, setMaxInput] = useState(filters.max);
  const selectedCategories = filters.category ? filters.category.split(',') : [];
  const selectedBrands = filters.brand ? filters.brand.split(',') : [];

  const toggleListValue = (key, list, value) => {
    const next = list.includes(value) ? list.filter((v) => v !== value) : [...list, value];
    onChange({ [key]: next.join(',') });
  };

  const countFor = (value) => meta.categories.find((c) => c.value === value)?.count;

  return (
    <div>
      <Section title="Department">
        {CATEGORIES.map(({ label, value }) => (
          <label key={value} className="flex cursor-pointer items-center gap-2 py-0.5 text-sm">
            <input
              type="checkbox"
              checked={selectedCategories.includes(value)}
              onChange={() => toggleListValue('category', selectedCategories, value)}
              className="h-4 w-4 rounded border-[#888c8c] text-brand focus:ring-brand"
            />
            <span>{label}</span>
            {countFor(value) !== undefined && <span className="text-xs text-[#565959]">({countFor(value)})</span>}
          </label>
        ))}
      </Section>

      <Section title="Customer Reviews">
        {[4, 3, 2, 1].map((stars) => (
          <button
            key={stars}
            type="button"
            onClick={() => onChange({ rating: filters.rating === String(stars) ? '' : String(stars) })}
            className={`flex w-full items-center gap-1 py-0.5 text-sm hover:text-link-hover ${filters.rating === String(stars) ? 'font-bold' : ''}`}
          >
            <StarRating rating={stars} size={16} /> <span>&amp; Up</span>
          </button>
        ))}
      </Section>

      {meta.brands.length > 0 && (
        <Section title="Brand">
          <div className="max-h-52 overflow-y-auto pr-1">
            {meta.brands.map(({ value, count }) => (
              <label key={value} className="flex cursor-pointer items-center gap-2 py-0.5 text-sm">
                <input
                  type="checkbox"
                  checked={selectedBrands.includes(value)}
                  onChange={() => toggleListValue('brand', selectedBrands, value)}
                  className="h-4 w-4 rounded border-[#888c8c] text-brand focus:ring-brand"
                />
                <span>{value}</span>
                <span className="text-xs text-[#565959]">({count})</span>
              </label>
            ))}
          </div>
        </Section>
      )}

      <Section title="Price">
        {PRICE_RANGES.map(({ label, min, max }) => (
          <LinkButton
            key={label}
            active={filters.min === min && filters.max === max}
            onClick={() => {
              setMinInput(min);
              setMaxInput(max);
              onChange({ min, max });
            }}
          >
            {label}
          </LinkButton>
        ))}
        <form
          className="mt-2 flex items-center gap-1"
          onSubmit={(e) => {
            e.preventDefault();
            onChange({ min: minInput, max: maxInput });
          }}
        >
          <input type="number" min="0" inputMode="numeric" placeholder="$ Min" aria-label="Minimum price" value={minInput} onChange={(e) => setMinInput(e.target.value)} className="field w-[4.5rem] !px-2" />
          <input type="number" min="0" inputMode="numeric" placeholder="$ Max" aria-label="Maximum price" value={maxInput} onChange={(e) => setMaxInput(e.target.value)} className="field w-[4.5rem] !px-2" />
          <button type="submit" className="btn-light !px-3">Go</button>
        </form>
      </Section>

      <Section title="Deals & Availability">
        <label className="flex cursor-pointer items-center gap-2 py-0.5 text-sm">
          <input type="checkbox" checked={filters.deals === 'true'} onChange={(e) => onChange({ deals: e.target.checked ? 'true' : '' })} className="h-4 w-4 rounded border-[#888c8c] text-brand focus:ring-brand" />
          Today&apos;s Deals
        </label>
        <label className="flex cursor-pointer items-center gap-2 py-0.5 text-sm">
          <input type="checkbox" checked={filters.inStock === 'true'} onChange={(e) => onChange({ inStock: e.target.checked ? 'true' : '' })} className="h-4 w-4 rounded border-[#888c8c] text-brand focus:ring-brand" />
          In stock only
        </label>
      </Section>

      <button type="button" onClick={onClear} className="mt-3 text-sm text-link hover:text-link-hover hover:underline">
        Clear all filters
      </button>
    </div>
  );
}
