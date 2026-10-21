import { CheckIcon } from '@heroicons/react/24/solid';
import { ORDER_STEPS } from '../utils/productUtils.js';

const LABELS = { pending: 'Order placed', processing: 'Processing', shipped: 'Shipped', delivered: 'Delivered' };

const BADGES = {
  pending: 'bg-[#fef3c7] text-[#92400e]',
  processing: 'bg-[#dbeafe] text-[#1e40af]',
  shipped: 'bg-[#e0e7ff] text-[#3730a3]',
  delivered: 'bg-[#dcfce7] text-[#166534]',
  cancelled: 'bg-[#fee2e2] text-[#991b1b]',
  paid: 'bg-[#dcfce7] text-[#166534]',
  failed: 'bg-[#fee2e2] text-[#991b1b]',
};

export function StatusBadge({ status, children }) {
  return (
    <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-bold capitalize ${BADGES[status] || 'bg-[#f0f2f2]'}`}>
      {children || status}
    </span>
  );
}

export default function OrderStatus({ status }) {
  if (status === 'cancelled') {
    return <p className="rounded bg-[#fee2e2] px-3 py-2 text-sm font-bold text-[#991b1b]">This order was cancelled.</p>;
  }

  const current = ORDER_STEPS.indexOf(status);

  return (
    <ol className="flex items-start" aria-label="Order progress">
      {ORDER_STEPS.map((step, i) => {
        const done = i <= current;
        return (
          <li key={step} className="relative flex flex-1 flex-col items-center text-center" aria-current={i === current ? 'step' : undefined}>
            {i > 0 && <span className={`absolute right-1/2 top-3 h-1 w-full ${i <= current ? 'bg-[#007600]' : 'bg-[#e0e0e0]'}`} aria-hidden="true" />}
            <span className={`relative z-10 flex h-7 w-7 items-center justify-center rounded-full ${done ? 'bg-[#007600] text-white' : 'bg-[#e0e0e0]'}`}>
              {done && <CheckIcon className="h-4 w-4" />}
            </span>
            <span className={`mt-1.5 text-xs sm:text-sm ${done ? 'font-bold' : 'text-[#565959]'}`}>{LABELS[step]}</span>
          </li>
        );
      })}
    </ol>
  );
}
