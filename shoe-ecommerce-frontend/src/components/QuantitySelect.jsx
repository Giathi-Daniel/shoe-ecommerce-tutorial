import { MAX_CART_QUANTITY } from '../utils/productUtils.js';

export default function QuantitySelect({ value, max = MAX_CART_QUANTITY, onChange, disabled = false, id }) {
  const limit = Math.max(1, Math.min(max, MAX_CART_QUANTITY));

  return (
    <select
      id={id}
      value={value}
      disabled={disabled}
      onChange={(e) => onChange(Number(e.target.value))}
      className="rounded-lg border border-[#d5d9d9] bg-[#f0f2f2] px-2 py-1 text-sm shadow-sm hover:bg-[#e3e6e6] disabled:opacity-60"
      aria-label="Quantity"
    >
      {Array.from({ length: limit }, (_, i) => i + 1).map((n) => (
        <option key={n} value={n}>{n}</option>
      ))}
    </select>
  );
}
