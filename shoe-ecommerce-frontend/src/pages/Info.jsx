import { Link, useParams } from 'react-router-dom';
import Breadcrumbs from '../components/Breadcrumbs';
import usePageTitle from '../hooks/usePageTitle';
import { FLAT_SHIPPING_RATE, FREE_SHIPPING_THRESHOLD, formatCurrency } from '../utils/productUtils.js';
import NotFound from './NotFound';

const TOPICS = {
  about: {
    title: 'About ShoeStore',
    sections: [
      ['Who we are', 'ShoeStore is a full-stack e-commerce portfolio project: a React storefront backed by a Node, Express and MongoDB API. It models the flows of a large online marketplace: search and filtering, reviews, a persistent cart, wish lists, multi-step checkout, order tracking and an admin dashboard.'],
      ['Under the hood', 'JWT authentication, server-side stock reservation at checkout, Stripe and PayPal payment flows, server-rendered pages and a responsive Tailwind interface.'],
    ],
  },
  contact: {
    title: 'Customer Service',
    sections: [
      ['Contact us', 'Email support@shoestore.com and we will reply within one business day.'],
      ['Order problems', 'Open Your Orders to track, cancel unpaid orders or review the items you bought.'],
      ['Account help', 'Use Forgot password on the sign in page if you cannot access your account.'],
    ],
  },
  shipping: {
    title: 'Shipping & Delivery',
    sections: [
      ['Delivery times', 'Orders are delivered within 3 to 5 business days after they are processed.'],
      ['Shipping costs', `Orders of ${formatCurrency(FREE_SHIPPING_THRESHOLD)} or more ship free. Smaller orders ship for a flat ${formatCurrency(FLAT_SHIPPING_RATE)}.`],
      ['Tracking', 'Follow your order progress from Placed to Processing, Shipped and Delivered in Your Orders.'],
    ],
  },
  returns: {
    title: 'Returns & Replacements',
    sections: [
      ['30-day returns', 'Return unworn shoes in their original box within 30 days of delivery for a full refund.'],
      ['Cancelling an order', 'You can cancel an unpaid order that has not shipped from the order details page. Stock is released immediately.'],
    ],
  },
  privacy: {
    title: 'Privacy Notice',
    sections: [
      ['What we collect', 'Your name, email address, delivery address and order history, used only to run your account and fulfil orders.'],
      ['Payments', 'Card details are handled entirely by Stripe and PayPal. ShoeStore never sees or stores them.'],
      ['Your data', 'You can delete your account and all associated data at any time from Login & security.'],
    ],
  },
  terms: {
    title: 'Conditions of Use',
    sections: [
      ['Demo store', 'ShoeStore is a portfolio project. Products are illustrative and no real orders are shipped.'],
      ['Your account', 'Keep your password secure. You are responsible for activity under your account.'],
    ],
  },
};

export default function Info() {
  const { topic } = useParams();
  const page = TOPICS[topic];
  usePageTitle(page?.title);

  if (!page) return <NotFound />;

  return (
    <div className="mx-auto max-w-3xl px-3 py-6 sm:px-4">
      <Breadcrumbs items={[{ label: 'Home', to: '/' }, { label: page.title }]} />
      <article className="card p-6 sm:p-8">
        <h1 className="mb-4 text-3xl font-medium">{page.title}</h1>
        {page.sections.map(([heading, text]) => (
          <section key={heading} className="mb-5 last:mb-0">
            <h2 className="mb-1 text-lg font-bold">{heading}</h2>
            <p className="text-sm leading-relaxed text-[#333]">{text}</p>
          </section>
        ))}
        <p className="mt-6 border-t border-line pt-4 text-sm">
          Need more help? <Link to="/help/contact">Contact customer service</Link>.
        </p>
      </article>
    </div>
  );
}
