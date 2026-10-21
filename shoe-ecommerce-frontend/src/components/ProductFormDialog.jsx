import { useEffect, useState } from 'react';
import { Dialog, DialogBackdrop, DialogPanel, DialogTitle } from '@headlessui/react';
import { toast } from 'react-toastify';
import { apiJson } from '../utils/apiFetch.jsx';
import { CATEGORIES } from '../utils/productUtils.js';

const EMPTY = {
  name: '', brand: '', category: 'men', price: '', compareAtPrice: '', stock: '',
  mainImage: '', description: '', colors: '', sizes: '', isFeatured: false,
};

const toForm = (product) => product
  ? {
      ...EMPTY,
      ...product,
      price: String(product.price),
      compareAtPrice: product.compareAtPrice ? String(product.compareAtPrice) : '',
      stock: String(product.stock),
      mainImage: product.mainImage || product.image,
      colors: (product.colors || []).join(', '),
      sizes: (product.sizes || []).join(', '),
    }
  : EMPTY;

const splitList = (value) => value.split(',').map((v) => v.trim()).filter(Boolean);

export default function ProductFormDialog({ open, product, onClose, onSaved }) {
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) setForm(toForm(product));
  }, [open, product]);

  const set = (name) => (e) => setForm((f) => ({ ...f, [name]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);

    const payload = {
      name: form.name,
      brand: form.brand || 'Generic',
      category: form.category,
      price: Number(form.price),
      compareAtPrice: Number(form.compareAtPrice) || 0,
      stock: Number(form.stock) || 0,
      mainImage: form.mainImage,
      description: form.description,
      colors: splitList(form.colors),
      sizes: splitList(form.sizes).map(Number).filter((n) => !Number.isNaN(n)),
      isFeatured: form.isFeatured,
    };

    try {
      const url = product ? `/api/products/${product._id}` : '/api/products';
      const data = await apiJson(url, { method: product ? 'PUT' : 'POST', body: JSON.stringify(payload) });
      toast.success(product ? 'Product updated' : 'Product created');
      onSaved(data.product);
      onClose();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  const input = (name, label, props = {}) => (
    <div className={props.wide ? 'sm:col-span-2' : ''}>
      <label htmlFor={`pf-${name}`} className="mb-1 block text-sm font-bold">{label}</label>
      <input id={`pf-${name}`} value={form[name]} onChange={set(name)} className="field" {...props} wide={undefined} />
    </div>
  );

  return (
    <Dialog open={open} onClose={onClose} className="relative z-[100]">
      <DialogBackdrop className="fixed inset-0 bg-black/50" />
      <div className="fixed inset-0 overflow-y-auto p-4">
        <DialogPanel className="mx-auto w-full max-w-2xl rounded-lg bg-white p-5 shadow-pop sm:p-6">
          <DialogTitle className="mb-4 text-xl font-bold">{product ? 'Edit product' : 'Add product'}</DialogTitle>

          <form onSubmit={submit} className="grid gap-3 sm:grid-cols-2">
            {input('name', 'Name', { required: true, wide: true })}
            {input('brand', 'Brand')}
            <div>
              <label htmlFor="pf-category" className="mb-1 block text-sm font-bold">Category</label>
              <select id="pf-category" value={form.category} onChange={set('category')} className="field">
                {CATEGORIES.map(({ value, label }) => <option key={value} value={value}>{label}</option>)}
              </select>
            </div>
            {input('price', 'Price (USD)', { type: 'number', min: '0.01', step: '0.01', required: true })}
            {input('compareAtPrice', 'List price (optional)', { type: 'number', min: '0', step: '0.01' })}
            {input('stock', 'Stock', { type: 'number', min: '0', step: '1', required: true })}
            {input('mainImage', 'Image URL', { type: 'url', required: true, wide: true })}
            {input('colors', 'Colours (comma separated)')}
            {input('sizes', 'Sizes (comma separated)')}
            <div className="sm:col-span-2">
              <label htmlFor="pf-description" className="mb-1 block text-sm font-bold">Description</label>
              <textarea id="pf-description" value={form.description} onChange={set('description')} required maxLength={2000} className="field min-h-24" />
            </div>
            <label className="flex items-center gap-2 text-sm sm:col-span-2">
              <input type="checkbox" checked={form.isFeatured} onChange={set('isFeatured')} className="h-4 w-4 rounded text-brand focus:ring-brand" />
              Feature on the home page
            </label>

            <div className="mt-2 flex justify-end gap-2 sm:col-span-2">
              <button type="button" onClick={onClose} className="btn-light">Cancel</button>
              <button type="submit" disabled={saving} className="btn-cta">{saving ? 'Saving...' : 'Save product'}</button>
            </div>
          </form>
        </DialogPanel>
      </div>
    </Dialog>
  );
}
