import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArchiveBoxIcon } from '@heroicons/react/24/outline';
import Breadcrumbs from '../components/Breadcrumbs';
import EmptyState from '../components/EmptyState';
import { StatusBadge } from '../components/OrderStatus';
import { PageSpinner } from '../components/Skeletons';
import { useCart } from '../context/CartContext';
import usePageTitle from '../hooks/usePageTitle';
import { apiJson } from '../utils/apiFetch.jsx';
import { formatCurrency, formatDate, resizeImage, variantLabel } from '../utils/productUtils.js';

const FILTERS = [
  { label: 'All orders', value: '' },
  { label: 'Open', value: 'open' },
  { label: 'Delivered', value: 'delivered' },
  { label: 'Cancelled', value: 'cancelled' },
];

export default function Orders() {
  usePageTitle('Your Orders');
  const { addToCart } = useCart();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');

  useEffect(() => {
    apiJson('/api/orders/my')
      .then((data) => setOrders(data.orders))
      .catch(() => setOrders([]))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <PageSpinner label="Loading your orders" />;

  const visible = orders.filter((o) => {
    if (filter === 'open') return !['delivered', 'cancelled'].includes(o.orderStatus);
    return !filter || o.orderStatus === filter;
  });

  return (
    <div className="mx-auto max-w-[1000px] px-3 py-4 sm:px-4">
      <Breadcrumbs items={[{ label: 'Your Account', to: '/account' }, { label: 'Your Orders' }]} />
      <h1 className="mb-3 text-[28px] font-medium">Your Orders</h1>

      <div className="mb-4 flex flex-wrap gap-2 border-b border-line pb-3" role="tablist">
        {FILTERS.map(({ label, value }) => (
          <button
            key={label}
            type="button"
            role="tab"
            aria-selected={filter === value}
            onClick={() => setFilter(value)}
            className={`rounded-full border px-4 py-1 text-sm ${filter === value ? 'border-[#e77600] bg-[#fef8f0] font-bold' : 'border-line bg-white hover:bg-[#f7fafa]'}`}
          >
            {label}
          </button>
        ))}
      </div>

      {visible.length === 0 ? (
        <EmptyState
          icon={ArchiveBoxIcon}
          title={orders.length ? 'No orders match this filter' : "You haven't placed any orders yet"}
          action={<Link to="/products" className="btn-cta hover:text-[#0f1111]">Start shopping</Link>}
        />
      ) : (
        <ul className="space-y-4">
          {visible.map((order) => (
            <li key={order._id} className="card overflow-hidden">
              <div className="flex flex-wrap items-center gap-x-8 gap-y-2 border-b border-line bg-[#f0f2f2] px-4 py-3 text-xs text-[#565959]">
                <div><p className="font-bold uppercase">Order placed</p><p className="text-sm text-[#0f1111]">{formatDate(order.createdAt)}</p></div>
                <div><p className="font-bold uppercase">Total</p><p className="text-sm text-[#0f1111]">{formatCurrency(order.totalAmount)}</p></div>
                <div className="hidden sm:block"><p className="font-bold uppercase">Ship to</p><p className="text-sm text-link">{order.shippingAddress.fullName || order.shippingAddress.city}</p></div>
                <div className="ml-auto text-right">
                  <p className="font-bold uppercase">Order # {order._id.slice(-8).toUpperCase()}</p>
                  <Link to={`/orders/${order._id}`} className="text-sm">View order details</Link>
                </div>
              </div>

              <div className="p-4">
                <div className="mb-3 flex flex-wrap items-center gap-2">
                  <StatusBadge status={order.orderStatus} />
                  <StatusBadge status={order.paymentStatus}>{order.paymentStatus === 'paid' ? 'Paid' : `Payment ${order.paymentStatus}`}</StatusBadge>
                </div>

                <ul className="space-y-4">
                  {order.items.map((item) => (
                    <li key={item._id} className="flex gap-4">
                      <Link to={`/products/${item.productId}`} className="shrink-0">
                        <img src={resizeImage(item.image, 200)} alt="" className="h-20 w-20 rounded bg-[#f7f7f7] object-contain mix-blend-multiply" />
                      </Link>
                      <div className="min-w-0 flex-1 text-sm">
                        <Link to={`/products/${item.productId}`} className="line-clamp-2-safe font-medium">{item.name}</Link>
                        <p className="text-[#565959]">Qty {item.quantity} · {formatCurrency(item.price)}{variantLabel(item) && ` · ${variantLabel(item)}`}</p>
                        <button type="button" onClick={() => addToCart(item.productId, item.quantity, { size: item.size, color: item.color })} className="btn-cta mt-2 !py-1">Buy it again</button>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
