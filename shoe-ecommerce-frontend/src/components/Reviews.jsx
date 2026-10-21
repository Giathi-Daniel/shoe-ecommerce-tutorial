import { useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import StarRating, { Star } from './StarRating';
import { useAuth } from '../context/AuthContext';
import { apiJson } from '../utils/apiFetch.jsx';
import { formatDate } from '../utils/productUtils.js';

function RatingInput({ value, onChange }) {
  return (
    <div role="radiogroup" aria-label="Your rating" className="flex gap-1">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          role="radio"
          aria-checked={value === n}
          aria-label={`${n} star${n > 1 ? 's' : ''}`}
          onClick={() => onChange(n)}
          className="rounded p-0.5"
        >
          <Star fill={n <= value ? 1 : 0} size={28} />
        </button>
      ))}
    </div>
  );
}

export default function Reviews({ product, onProductChange }) {
  const { user } = useAuth();
  const [form, setForm] = useState({ rating: 0, title: '', comment: '' });
  const [submitting, setSubmitting] = useState(false);

  const reviews = [...(product.reviews || [])].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  const alreadyReviewed = user && reviews.some((r) => String(r.user) === String(user.id));
  const counts = [5, 4, 3, 2, 1].map((stars) => reviews.filter((r) => r.rating === stars).length);

  const submit = async (e) => {
    e.preventDefault();
    if (!form.rating) return toast.error('Please select a star rating.');
    if (form.comment.trim().length < 3) return toast.error('Please write a short review.');

    setSubmitting(true);
    try {
      const data = await apiJson(`/api/products/${product._id}/reviews`, { method: 'POST', body: JSON.stringify(form) });
      onProductChange(data.product);
      setForm({ rating: 0, title: '', comment: '' });
      toast.success('Thanks for your review!');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const remove = async (reviewId) => {
    try {
      const data = await apiJson(`/api/products/${product._id}/reviews/${reviewId}`, { method: 'DELETE' });
      onProductChange(data.product);
      toast.success('Review deleted');
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <section id="reviews" className="grid gap-8 border-t border-line pt-6 lg:grid-cols-[300px_1fr]" aria-labelledby="reviews-heading">
      <div>
        <h2 id="reviews-heading" className="text-2xl font-bold">Customer reviews</h2>
        <div className="mt-2 flex items-center gap-2">
          <StarRating rating={product.rating} size={20} />
          <span className="text-lg">{product.rating.toFixed(1)} out of 5</span>
        </div>
        <p className="mt-1 text-sm text-[#565959]">{product.numReviews} global rating{product.numReviews === 1 ? '' : 's'}</p>

        <div className="mt-3 space-y-1.5">
          {[5, 4, 3, 2, 1].map((stars, i) => {
            const percent = reviews.length ? Math.round((counts[i] / reviews.length) * 100) : 0;
            return (
              <div key={stars} className="flex items-center gap-2 text-sm">
                <span className="w-12 text-link">{stars} star</span>
                <div className="h-5 flex-1 overflow-hidden rounded-sm border border-[#bbb] bg-[#f0f2f2]" role="presentation">
                  <div className="h-full bg-star" style={{ width: `${percent}%` }} />
                </div>
                <span className="w-9 text-right text-link">{percent}%</span>
              </div>
            );
          })}
        </div>

        <div className="mt-6 border-t border-line pt-4">
          <h3 className="font-bold">Review this product</h3>
          {!user ? (
            <p className="mt-1 text-sm">
              <Link to="/login" state={{ from: `/products/${product._id}` }}>Sign in</Link> to share your thoughts with other customers.
            </p>
          ) : alreadyReviewed ? (
            <p className="mt-1 text-sm text-[#565959]">You&apos;ve already reviewed this product. Thank you!</p>
          ) : (
            <form onSubmit={submit} className="mt-2 space-y-3">
              <RatingInput value={form.rating} onChange={(rating) => setForm((f) => ({ ...f, rating }))} />
              <input
                className="field"
                placeholder="Headline (optional)"
                aria-label="Review headline"
                maxLength={120}
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              />
              <textarea
                className="field min-h-24"
                placeholder="What did you like or dislike about these shoes?"
                aria-label="Review"
                maxLength={2000}
                value={form.comment}
                onChange={(e) => setForm((f) => ({ ...f, comment: e.target.value }))}
              />
              <button type="submit" disabled={submitting} className="btn-light w-full">
                {submitting ? 'Submitting...' : 'Submit review'}
              </button>
            </form>
          )}
        </div>
      </div>

      <div>
        <h3 className="mb-4 text-lg font-bold">Top reviews</h3>
        {reviews.length === 0 ? (
          <p className="text-sm text-[#565959]">No reviews yet. Be the first to review this product.</p>
        ) : (
          <ul className="space-y-6">
            {reviews.map((review) => (
              <li key={review._id}>
                <div className="mb-1 flex items-center gap-2 text-sm">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#d5d9d9] text-xs font-bold uppercase" aria-hidden="true">
                    {review.name?.[0]}
                  </span>
                  {review.name}
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <StarRating rating={review.rating} size={15} />
                  {review.title && <span className="font-bold">{review.title}</span>}
                </div>
                <p className="mt-0.5 text-xs text-[#565959]">Reviewed on {formatDate(review.createdAt)}</p>
                <p className="mt-2 whitespace-pre-line text-sm">{review.comment}</p>
                {user && String(review.user) === String(user.id) && (
                  <button type="button" onClick={() => remove(review._id)} className="mt-1 text-xs text-link hover:underline">
                    Delete my review
                  </button>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
