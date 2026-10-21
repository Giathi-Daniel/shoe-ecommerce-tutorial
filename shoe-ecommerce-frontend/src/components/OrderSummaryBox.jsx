import { CheckCircleIcon } from '@heroicons/react/24/solid';
import { FREE_SHIPPING_THRESHOLD, formatCurrency } from '../utils/productUtils.js';

export function FreeShippingProgress({ pricing }) {
  const reached = pricing.itemsPrice >= FREE_SHIPPING_THRESHOLD;
  const percent = Math.min(100, (pricing.itemsPrice / FREE_SHIPPING_THRESHOLD) * 100);

  return (
    <div className="text-sm">
      {reached ? (
        <p className="flex items-start gap-1.5 text-[#007600]">
          <CheckCircleIcon className="h-5 w-5 shrink-0" />
          <span>Your order qualifies for <b>FREE delivery</b>.</span>
        </p>
      ) : (
        <p>
          Add <b className="text-price">{formatCurrency(pricing.amountToFreeShipping)}</b> of eligible items to your order to qualify for <b>FREE delivery</b>.
        </p>
      )}
      <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-[#e7e9e9]" role="progressbar" aria-valuenow={Math.round(percent)} aria-valuemin={0} aria-valuemax={100}>
        <div className={`h-full rounded-full transition-all ${reached ? 'bg-[#007600]' : 'bg-brand'}`} style={{ width: `${percent}%` }} />
      </div>
    </div>
  );
}

export default function PricingLines({ pricing, strongTotal = true }) {
  const row = 'flex justify-between';

  return (
    <dl className="space-y-1 text-sm">
      <div className={row}><dt>Items:</dt><dd>{formatCurrency(pricing.itemsPrice)}</dd></div>
      <div className={row}>
        <dt>Shipping &amp; handling:</dt>
        <dd>{pricing.shippingPrice === 0 ? 'FREE' : formatCurrency(pricing.shippingPrice)}</dd>
      </div>
      <div className={row}><dt>Estimated tax (8%):</dt><dd>{formatCurrency(pricing.taxPrice)}</dd></div>
      <div className={`${row} border-t border-line pt-2 text-lg ${strongTotal ? 'font-bold text-price' : ''}`}>
        <dt>Order total:</dt><dd>{formatCurrency(pricing.totalAmount)}</dd>
      </div>
    </dl>
  );
}
