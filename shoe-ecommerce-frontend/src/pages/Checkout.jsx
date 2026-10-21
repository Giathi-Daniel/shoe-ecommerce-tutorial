import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { BanknotesIcon, CreditCardIcon, LockClosedIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import AddressForm, { AddressLines } from '../components/AddressForm';
import PricingLines, { FreeShippingProgress } from '../components/OrderSummaryBox';
import Logo from '../components/Logo';
import { PageSpinner } from '../components/Skeletons';
import usePageTitle from '../hooks/usePageTitle';
import { apiJson } from '../utils/apiFetch.jsx';
import { formatCurrency, getDeliveryEstimate, resizeImage, variantLabel } from '../utils/productUtils.js';

const PAYMENT_OPTIONS = [
  { value: 'cod', label: 'Pay on delivery', hint: 'Pay with cash or card when your order arrives.', Icon: BanknotesIcon },
  { value: 'stripe', label: 'Credit or debit card', hint: 'Secure payment with Stripe. You will be redirected to pay.', Icon: CreditCardIcon },
  { value: 'paypal', label: 'PayPal', hint: 'Pay with your PayPal balance, bank account or card.', Icon: LockClosedIcon },
];

const EMPTY_ADDRESS = { fullName: '', phone: '', address: '', city: '', postalCode: '', country: '' };

const addressFromUser = (user) => ({
  ...EMPTY_ADDRESS,
  fullName: user?.name || '',
  ...Object.fromEntries(Object.entries(user?.address || {}).filter(([, value]) => value)),
});

function Step({ number, title, children, summary, editing, onEdit }) {
  return (
    <section className="card p-4 sm:p-5">
      <div className="flex gap-3 sm:gap-6">
        <span className="w-5 text-lg font-bold">{number}</span>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <h2 className="text-lg font-bold">{title}</h2>
            {!editing && <button type="button" onClick={onEdit} className="text-sm text-link hover:underline">Change</button>}
          </div>
          {editing ? children : summary}
        </div>
      </div>
    </section>
  );
}

export default function Checkout() {
  usePageTitle('Checkout');
  const navigate = useNavigate();
  const { user, fetchProfile } = useAuth();
  const { cartItems, loading, pricing, itemCount, resetCart } = useCart();

  const [address, setAddress] = useState(() => addressFromUser(user));
  const [saveAddress, setSaveAddress] = useState(true);
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [step, setStep] = useState(user?.address?.address ? 'payment' : 'address');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (user?.address?.address) {
      setAddress((prev) => (prev.address ? prev : addressFromUser(user)));
    }
  }, [user]);

  if (loading) return <PageSpinner />;

  if (!cartItems.length && !submitting) {
    return (
      <div className="mx-auto max-w-md px-4 py-16 text-center">
        <h1 className="text-2xl font-medium">Your cart is empty</h1>
        <Link to="/products" className="btn-cta mt-4 hover:text-[#0f1111]">Continue shopping</Link>
      </div>
    );
  }

  const addressComplete = ['fullName', 'address', 'city', 'postalCode', 'country'].every((key) => address[key]?.trim());

  const continueFromAddress = (e) => {
    e.preventDefault();
    if (address.address.trim().length < 5) return toast.error('Please enter a valid street address.');
    setStep('payment');
  };

  const placeOrder = async () => {
    if (!addressComplete) {
      setStep('address');
      return toast.error('Please complete your delivery address.');
    }

    setSubmitting(true);
    try {
      const { order } = await apiJson('/api/orders', {
        method: 'POST',
        body: JSON.stringify({ shippingAddress: address, paymentMethod }),
      });
      resetCart();

      if (saveAddress) {
        apiJson('/api/auth/profile', { method: 'PUT', body: JSON.stringify({ address }) })
          .then(fetchProfile)
          .catch(() => {});
      }

      if (paymentMethod === 'cod') {
        toast.success('Order placed. Thank you!');
        return navigate(`/orders/${order._id}?placed=1`, { replace: true });
      }

      try {
        const endpoint = paymentMethod === 'stripe' ? '/api/payments/stripe/session' : '/api/payments/paypal/create';
        const { url } = await apiJson(endpoint, { method: 'POST', body: JSON.stringify({ orderId: order._id }) });
        if (!url) throw new Error('No payment URL returned');
        window.location.assign(url);
      } catch (err) {
        toast.warn(`${err.message} You can retry payment from your order.`);
        navigate(`/orders/${order._id}?placed=1`, { replace: true });
      }
    } catch (err) {
      toast.error(err.message);
      setSubmitting(false);
    }
  };

  const selectedPayment = PAYMENT_OPTIONS.find((o) => o.value === paymentMethod);
  const renderPlaceOrder = (className = '') => (
    <button type="button" onClick={placeOrder} disabled={submitting} className={`btn-cta w-full py-2 ${className}`}>
      {submitting ? 'Placing your order...' : paymentMethod === 'cod' ? 'Place your order' : 'Place order & pay'}
    </button>
  );

  return (
    <div className="bg-white">
      <div className="border-b border-line bg-gradient-to-b from-white to-[#f0f2f2] px-4 py-3">
        <div className="mx-auto flex max-w-[1100px] items-center justify-between">
          <Logo dark />
          <h1 className="text-2xl font-normal">Checkout <span className="text-base text-[#565959]">({itemCount} item{itemCount === 1 ? '' : 's'})</span></h1>
          <LockClosedIcon className="h-6 w-6 text-[#565959]" aria-label="Secure checkout" />
        </div>
      </div>

      <div className="mx-auto grid max-w-[1100px] gap-5 px-3 py-5 sm:px-4 lg:grid-cols-[1fr_310px]">
        <div className="space-y-4">
          <Step
            number={1}
            title="Delivery address"
            editing={step === 'address'}
            onEdit={() => setStep('address')}
            summary={addressComplete && <div className="mt-1"><AddressLines address={address} /></div>}
          >
            <form onSubmit={continueFromAddress} className="mt-3 space-y-4">
              <AddressForm value={address} onChange={setAddress} idPrefix="checkout" />
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={saveAddress} onChange={(e) => setSaveAddress(e.target.checked)} className="h-4 w-4 rounded text-brand focus:ring-brand" />
                Save this as my default address
              </label>
              <button type="submit" className="btn-cta">Use this address</button>
            </form>
          </Step>

          <Step
            number={2}
            title="Payment method"
            editing={step === 'payment'}
            onEdit={() => setStep('payment')}
            summary={<p className="mt-1 text-sm">{selectedPayment.label}</p>}
          >
            <fieldset className="mt-3 space-y-2">
              <legend className="sr-only">Choose a payment method</legend>
              {PAYMENT_OPTIONS.map(({ value, label, hint, Icon }) => (
                <label
                  key={value}
                  className={`flex cursor-pointer items-start gap-3 rounded-lg border p-3 ${paymentMethod === value ? 'border-[#e77600] bg-[#fef8f0]' : 'border-line hover:bg-[#f7fafa]'}`}
                >
                  <input type="radio" name="payment" value={value} checked={paymentMethod === value} onChange={() => setPaymentMethod(value)} className="mt-1 text-brand focus:ring-brand" />
                  <Icon className="mt-0.5 h-6 w-6 shrink-0 text-[#565959]" />
                  <span>
                    <span className="block text-sm font-bold">{label}</span>
                    <span className="block text-xs text-[#565959]">{hint}</span>
                  </span>
                </label>
              ))}
            </fieldset>
            <button type="button" onClick={() => setStep('review')} className="btn-cta mt-4">Use this payment method</button>
          </Step>

          <Step
            number={3}
            title="Review items and delivery"
            editing={step === 'review'}
            onEdit={() => setStep('review')}
            summary={<p className="mt-1 text-sm text-[#565959]">{itemCount} item{itemCount === 1 ? '' : 's'} · arriving {getDeliveryEstimate(3, 5)}</p>}
          >
            <div className="mt-3 rounded-lg border border-line p-4">
              <p className="mb-3 text-lg font-bold text-[#007600]">Arriving {getDeliveryEstimate(3, 5)}</p>
              <ul className="space-y-4">
                {cartItems.map(({ _id: lineId, product, quantity, size, color }) => (
                  <li key={lineId} className="flex gap-3">
                    <img src={resizeImage(product.image, 200)} alt="" className="h-20 w-20 rounded bg-[#f7f7f7] object-contain mix-blend-multiply" />
                    <div className="text-sm">
                      <Link to={`/products/${product._id}`} className="font-bold text-[#0f1111] hover:text-link-hover">{product.name}</Link>
                      <p className="font-bold text-price">{formatCurrency(product.price)}</p>
                      <p>Qty: {quantity}{variantLabel({ size, color }) && ` · ${variantLabel({ size, color })}`}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
            <div className="mt-4 hidden lg:block">{renderPlaceOrder('!w-auto px-6')}</div>
          </Step>
        </div>

        <aside className="card h-fit space-y-3 p-4 lg:sticky lg:top-4">
          {renderPlaceOrder()}
          <p className="text-center text-xs text-[#565959]">
            By placing your order, you agree to ShoeStore&apos;s <Link to="/help/terms">conditions of use</Link> and <Link to="/help/privacy">privacy notice</Link>.
          </p>
          <hr className="border-line" />
          <h2 className="font-bold">Order Summary</h2>
          <PricingLines pricing={pricing} />
          <hr className="border-line" />
          <FreeShippingProgress pricing={pricing} />
        </aside>
      </div>
    </div>
  );
}
