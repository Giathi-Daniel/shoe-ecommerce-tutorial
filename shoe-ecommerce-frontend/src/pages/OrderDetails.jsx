import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { CheckCircleIcon } from '@heroicons/react/24/solid';
import Breadcrumbs from '../components/Breadcrumbs';
import ConfirmDialog from '../components/ConfirmDialog';
import { AddressLines } from '../components/AddressForm';
import OrderStatus, { StatusBadge } from '../components/OrderStatus';
import { PageSpinner } from '../components/Skeletons';
import usePageTitle from '../hooks/usePageTitle';
import { apiJson } from '../utils/apiFetch.jsx';
import { formatCurrency, formatDate, getDeliveryEstimate, resizeImage, variantLabel } from '../utils/productUtils.js';

const PAYMENT_LABELS = { cod: 'Pay on delivery', stripe: 'Credit / debit card', paypal: 'PayPal' };

export default function OrderDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [confirmCancel, setConfirmCancel] = useState(false);
  const settled = useRef(new Set());

  usePageTitle(order ? `Order #${order._id.slice(-8).toUpperCase()}` : 'Order');

  const loadOrder = useCallback(async () => {
    try {
      setOrder((await apiJson(`/api/orders/${id}`)).order);
    } catch {
      setOrder(null);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    const sessionId = params.get('session_id');
    const paypalOrderId = params.get('token');
    const paymentKey = sessionId || paypalOrderId;

    const settle = async () => {
      if (paymentKey && settled.current.has(paymentKey)) return;
      if (paymentKey) settled.current.add(paymentKey);

      try {
        if (sessionId) {
          await apiJson('/api/payments/stripe/confirm', { method: 'POST', body: JSON.stringify({ sessionId }) });
          toast.success('Payment received. Thank you!');
        } else if (paypalOrderId) {
          await apiJson('/api/payments/paypal/capture', { method: 'POST', body: JSON.stringify({ orderId: id, paypalOrderId }) });
          toast.success('PayPal payment received. Thank you!');
        }
      } catch (err) {
        toast.error(err.message);
      }
      if (sessionId || paypalOrderId) setParams({}, { replace: true });
      loadOrder();
    };

    settle();
  }, [id, loadOrder, params, setParams]);

  const startPayment = async () => {
    setBusy(true);
    try {
      const endpoint = order.paymentMethod === 'stripe' ? '/api/payments/stripe/session' : '/api/payments/paypal/create';
      const { url } = await apiJson(endpoint, { method: 'POST', body: JSON.stringify({ orderId: order._id }) });
      window.location.assign(url);
    } catch (err) {
      toast.error(err.message);
      setBusy(false);
    }
  };

  const cancelOrder = async () => {
    setBusy(true);
    try {
      setOrder((await apiJson(`/api/orders/${order._id}/cancel`, { method: 'PATCH' })).order);
      toast.success('Order cancelled');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setBusy(false);
      setConfirmCancel(false);
    }
  };

  if (loading) return <PageSpinner label="Loading order" />;

  if (!order) {
    return (
      <div className="mx-auto max-w-md px-4 py-16 text-center">
        <h1 className="text-2xl font-medium">Order not found</h1>
        <Link to="/orders" className="btn-cta mt-4 hover:text-[#0f1111]">Back to your orders</Link>
      </div>
    );
  }

  const justPlaced = params.get('placed') === '1';
  const needsPayment = order.paymentMethod !== 'cod' && order.paymentStatus !== 'paid' && order.orderStatus !== 'cancelled';
  const canCancel = ['pending', 'processing'].includes(order.orderStatus) && order.paymentStatus !== 'paid';

  return (
    <div className="mx-auto max-w-[1000px] px-3 py-4 sm:px-4">
      <Breadcrumbs items={[{ label: 'Your Account', to: '/account' }, { label: 'Your Orders', to: '/orders' }, { label: `Order #${order._id.slice(-8).toUpperCase()}` }]} />

      {justPlaced && (
        <div className="card mb-4 flex items-start gap-3 border-[#007600] bg-[#f0fff4] p-4">
          <CheckCircleIcon className="h-8 w-8 shrink-0 text-[#007600]" />
          <div>
            <h2 className="text-lg font-bold text-[#007600]">Order placed, thanks!</h2>
            <p className="text-sm">Estimated delivery: <b>{getDeliveryEstimate(3, 5, new Date(order.createdAt))}</b>.</p>
          </div>
        </div>
      )}

      <h1 className="mb-1 text-[28px] font-medium">Order Details</h1>
      <p className="mb-4 text-sm text-[#565959]">
        Ordered on {formatDate(order.createdAt)} · Order # {order._id.slice(-8).toUpperCase()}
      </p>

      <section className="card mb-4 p-4 sm:p-6" aria-label="Order progress">
        <OrderStatus status={order.orderStatus} />
        {order.deliveredAt && <p className="mt-3 text-center text-sm text-[#007600]">Delivered on {formatDate(order.deliveredAt)}</p>}
      </section>

      {needsPayment && (
        <div className="card mb-4 flex flex-wrap items-center justify-between gap-3 border-[#e77600] bg-[#fef8f0] p-4">
          <p className="text-sm"><b>Payment pending.</b> Complete your {PAYMENT_LABELS[order.paymentMethod]} payment to process this order.</p>
          <button type="button" onClick={startPayment} disabled={busy} className="btn-cta">Pay {formatCurrency(order.totalAmount)} now</button>
        </div>
      )}

      <div className="card mb-4 grid gap-6 p-4 sm:grid-cols-3 sm:p-6">
        <div>
          <h2 className="mb-1 font-bold">Shipping Address</h2>
          <AddressLines address={order.shippingAddress} />
        </div>
        <div>
          <h2 className="mb-1 font-bold">Payment Method</h2>
          <p className="text-sm">{PAYMENT_LABELS[order.paymentMethod]}</p>
          <div className="mt-1"><StatusBadge status={order.paymentStatus}>{order.paymentStatus === 'paid' ? `Paid ${formatDate(order.paidAt)}` : `Payment ${order.paymentStatus}`}</StatusBadge></div>
        </div>
        <div>
          <h2 className="mb-1 font-bold">Order Summary</h2>
          <dl className="space-y-0.5 text-sm">
            <div className="flex justify-between"><dt>Items:</dt><dd>{formatCurrency(order.itemsPrice)}</dd></div>
            <div className="flex justify-between"><dt>Shipping:</dt><dd>{order.shippingPrice ? formatCurrency(order.shippingPrice) : 'FREE'}</dd></div>
            <div className="flex justify-between"><dt>Tax:</dt><dd>{formatCurrency(order.taxPrice)}</dd></div>
            <div className="flex justify-between font-bold"><dt>Total:</dt><dd>{formatCurrency(order.totalAmount)}</dd></div>
          </dl>
        </div>
      </div>

      <section className="card p-4 sm:p-6" aria-label="Items in this order">
        <ul className="divide-y divide-line">
          {order.items.map((item) => (
            <li key={item._id} className="flex gap-4 py-4 first:pt-0 last:pb-0">
              <Link to={`/products/${item.productId}`} className="shrink-0">
                <img src={resizeImage(item.image, 200)} alt="" className="h-24 w-24 rounded bg-[#f7f7f7] object-contain mix-blend-multiply" />
              </Link>
              <div className="flex-1 text-sm">
                <Link to={`/products/${item.productId}`} className="font-medium">{item.name}</Link>
                <p className="text-[#565959]">Qty: {item.quantity}{variantLabel(item) && ` · ${variantLabel(item)}`}</p>
                <p className="font-bold text-price">{formatCurrency(item.price)}</p>
                <div className="mt-2 flex gap-2">
                  <Link to={`/products/${item.productId}#reviews`} className="btn-light !py-1 hover:text-[#0f1111]">Write a product review</Link>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <div className="mt-4 flex flex-wrap gap-2">
        <button type="button" onClick={() => navigate('/orders')} className="btn-light">Back to orders</button>
        {canCancel && <button type="button" onClick={() => setConfirmCancel(true)} className="btn-light">Cancel order</button>}
      </div>

      <ConfirmDialog open={confirmCancel} title="Cancel this order?" confirmLabel="Yes, cancel order" danger busy={busy} onClose={() => setConfirmCancel(false)} onConfirm={cancelOrder}>
        Items will be returned to stock. This can&apos;t be undone.
      </ConfirmDialog>
    </div>
  );
}
