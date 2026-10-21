import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import ConfirmDialog from '../components/ConfirmDialog';
import ProductFormDialog from '../components/ProductFormDialog';
import { StatusBadge } from '../components/OrderStatus';
import { PageSpinner } from '../components/Skeletons';
import useDebounce from '../hooks/useDebounce';
import usePageTitle from '../hooks/usePageTitle';
import { apiJson } from '../utils/apiFetch.jsx';
import { formatCurrency, formatDate, normalizeProduct, resizeImage } from '../utils/productUtils.js';

const STATUSES = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];

function Stat({ label, value }) {
  return (
    <div className="card p-4">
      <p className="text-sm text-[#565959]">{label}</p>
      <p className="text-2xl font-bold">{value}</p>
    </div>
  );
}

function OrdersPanel() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');

  useEffect(() => {
    setLoading(true);
    apiJson(`/api/orders${filter ? `?status=${filter}` : ''}`)
      .then((data) => setOrders(data.orders))
      .catch((err) => toast.error(err.message))
      .finally(() => setLoading(false));
  }, [filter]);

  const changeStatus = async (order, status) => {
    try {
      const data = await apiJson(`/api/orders/${order._id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) });
      setOrders((prev) => prev.map((o) => (o._id === order._id ? { ...o, ...data.order, user: o.user } : o)));
      toast.success(`Order marked ${status}`);
    } catch (err) {
      toast.error(err.message);
    }
  };

  const revenue = orders.filter((o) => o.orderStatus !== 'cancelled').reduce((sum, o) => sum + o.totalAmount, 0);

  return (
    <div>
      <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
        <Stat label="Orders" value={orders.length} />
        <Stat label="Revenue (excl. cancelled)" value={formatCurrency(revenue)} />
        <Stat label="Awaiting action" value={orders.filter((o) => ['pending', 'processing'].includes(o.orderStatus)).length} />
      </div>

      <div className="mb-3 flex items-center gap-2 text-sm">
        <label htmlFor="status-filter">Status:</label>
        <select id="status-filter" value={filter} onChange={(e) => setFilter(e.target.value)} className="rounded-lg border border-[#d5d9d9] bg-[#f0f2f2] px-2 py-1">
          <option value="">All</option>
          {STATUSES.map((s) => <option key={s} value={s} className="capitalize">{s}</option>)}
        </select>
      </div>

      {loading ? <PageSpinner /> : orders.length === 0 ? (
        <p className="card p-6 text-center text-sm text-[#565959]">No orders found.</p>
      ) : (
        <div className="card overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="border-b border-line bg-[#f0f2f2] text-xs uppercase text-[#565959]">
              <tr>
                {['Order', 'Customer', 'Date', 'Items', 'Total', 'Payment', 'Status'].map((h) => <th key={h} scope="col" className="px-3 py-2">{h}</th>)}
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order._id} className="border-b border-line last:border-0">
                  <td className="px-3 py-2"><Link to={`/orders/${order._id}`}>#{order._id.slice(-8).toUpperCase()}</Link></td>
                  <td className="px-3 py-2">{order.user?.name || 'Deleted user'}<br /><span className="text-xs text-[#565959]">{order.user?.email}</span></td>
                  <td className="px-3 py-2 whitespace-nowrap">{formatDate(order.createdAt, { month: 'short', day: 'numeric', year: 'numeric' })}</td>
                  <td className="px-3 py-2">{order.items.reduce((n, i) => n + i.quantity, 0)}</td>
                  <td className="px-3 py-2 font-bold">{formatCurrency(order.totalAmount)}</td>
                  <td className="px-3 py-2"><StatusBadge status={order.paymentStatus} /><span className="ml-1 text-xs uppercase text-[#565959]">{order.paymentMethod}</span></td>
                  <td className="px-3 py-2">
                    <select
                      value={order.orderStatus}
                      disabled={order.orderStatus === 'cancelled'}
                      onChange={(e) => changeStatus(order, e.target.value)}
                      aria-label={`Status for order ${order._id.slice(-8)}`}
                      className="rounded border border-[#d5d9d9] bg-white px-1.5 py-1 capitalize"
                    >
                      {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function ProductsPanel() {
  const [products, setProducts] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [editing, setEditing] = useState(null);
  const [formOpen, setFormOpen] = useState(false);
  const [toDelete, setToDelete] = useState(null);
  const debounced = useDebounce(search, 300);

  const load = useCallback(() => {
    setLoading(true);
    apiJson(`/api/products?limit=60&search=${encodeURIComponent(debounced)}`)
      .then((data) => {
        setProducts(data.products.map(normalizeProduct));
        setTotal(data.total);
      })
      .catch((err) => toast.error(err.message))
      .finally(() => setLoading(false));
  }, [debounced]);

  useEffect(load, [load]);

  const remove = async () => {
    try {
      await apiJson(`/api/products/${toDelete._id}`, { method: 'DELETE' });
      toast.success('Product deleted');
      setToDelete(null);
      load();
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <div>
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <input type="search" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search products" aria-label="Search products" className="field max-w-xs" />
        <span className="text-sm text-[#565959]">{total} products</span>
        <button type="button" onClick={() => { setEditing(null); setFormOpen(true); }} className="btn-cta ml-auto">Add product</button>
      </div>

      {loading ? <PageSpinner /> : (
        <div className="card overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="border-b border-line bg-[#f0f2f2] text-xs uppercase text-[#565959]">
              <tr>{['Product', 'Category', 'Price', 'Stock', ''].map((h) => <th key={h} scope="col" className="px-3 py-2">{h}</th>)}</tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p._id} className="border-b border-line last:border-0">
                  <td className="px-3 py-2">
                    <div className="flex items-center gap-3">
                      <img src={resizeImage(p.image, 100)} alt="" className="h-10 w-10 rounded bg-[#f7f7f7] object-cover" />
                      <div><Link to={`/products/${p._id}`} className="font-medium">{p.name}</Link><p className="text-xs text-[#565959]">{p.brand}</p></div>
                    </div>
                  </td>
                  <td className="px-3 py-2 capitalize">{p.category}</td>
                  <td className="px-3 py-2">{formatCurrency(p.price)}</td>
                  <td className={`px-3 py-2 ${p.stock === 0 ? 'font-bold text-price' : p.stock <= 5 ? 'text-[#b12704]' : ''}`}>{p.stock}</td>
                  <td className="whitespace-nowrap px-3 py-2 text-right">
                    <button type="button" onClick={() => { setEditing(p); setFormOpen(true); }} className="mr-3 text-link hover:underline">Edit</button>
                    <button type="button" onClick={() => setToDelete(p)} className="text-[#c40000] hover:underline">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <ProductFormDialog open={formOpen} product={editing} onClose={() => setFormOpen(false)} onSaved={load} />
      <ConfirmDialog open={!!toDelete} title="Delete product?" confirmLabel="Delete" danger onClose={() => setToDelete(null)} onConfirm={remove}>
        {toDelete?.name} will be removed from the catalogue.
      </ConfirmDialog>
    </div>
  );
}

export default function Admin() {
  usePageTitle('Admin Dashboard');
  const [tab, setTab] = useState('orders');

  return (
    <div className="mx-auto max-w-[1200px] px-3 py-4 sm:px-4">
      <h1 className="mb-3 text-[28px] font-medium">Admin Dashboard</h1>

      <div className="mb-4 flex gap-1 border-b border-line" role="tablist">
        {[['orders', 'Orders'], ['products', 'Products']].map(([value, label]) => (
          <button
            key={value}
            type="button"
            role="tab"
            aria-selected={tab === value}
            onClick={() => setTab(value)}
            className={`-mb-px border-b-2 px-4 py-2 text-sm ${tab === value ? 'border-brand font-bold' : 'border-transparent text-[#565959] hover:text-[#0f1111]'}`}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === 'orders' ? <OrdersPanel /> : <ProductsPanel />}
    </div>
  );
}
