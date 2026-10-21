import { formatCurrency, splitPrice } from '../utils/productUtils.js';

const SIZES = {
  sm: { symbol: 'text-xs', whole: 'text-lg', fraction: 'text-xs' },
  md: { symbol: 'text-sm', whole: 'text-2xl', fraction: 'text-sm' },
  lg: { symbol: 'text-base', whole: 'text-3xl', fraction: 'text-base' },
};

export default function Price({ value, compareAt = 0, size = 'md', showDiscount = false }) {
  const { whole, fraction } = splitPrice(value);
  const classes = SIZES[size];
  const hasDiscount = compareAt > value;
  const percent = hasDiscount ? Math.round((1 - value / compareAt) * 100) : 0;

  return (
    <span className="inline-flex flex-wrap items-baseline gap-x-2">
      {showDiscount && hasDiscount && <span className="text-xl font-light text-[#cc0c39]">-{percent}%</span>}
      <span className="inline-flex items-start text-[#0f1111]" aria-label={formatCurrency(value)}>
        <span className={`${classes.symbol} leading-tight`}>$</span>
        <span className={`${classes.whole} font-medium leading-none`}>{whole}</span>
        <span className={`${classes.fraction} leading-tight`}>{fraction}</span>
      </span>
      {hasDiscount && (
        <span className="text-xs text-[#565959]">
          List: <s>{formatCurrency(compareAt)}</s>
        </span>
      )}
    </span>
  );
}
