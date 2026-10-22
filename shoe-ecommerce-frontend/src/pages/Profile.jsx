import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import AddressForm from '../components/AddressForm';
import AuthFormInput from '../components/AuthFormInput';
import Breadcrumbs from '../components/Breadcrumbs';
import ConfirmDialog from '../components/ConfirmDialog';
import { useAuth } from '../context/AuthContext';
import usePageTitle from '../hooks/usePageTitle';
import { apiJson, setAuthToken } from '../utils/apiFetch.jsx';

const EMPTY_PASSWORDS = { currentPassword: '', newPassword: '', confirm: '' };

function Section({ id, title, children }) {
  return (
    <section id={id} className="card scroll-mt-40 p-5">
      <h2 className="mb-3 text-xl font-bold">{title}</h2>
      {children}
    </section>
  );
}

export default function Profile() {
  usePageTitle('Login & Security');
  const { user, setUser, logout } = useAuth();
  const { hash } = useLocation();

  const [name, setName] = useState(user.name);
  const [address, setAddress] = useState({ fullName: user.name, phone: '', address: '', city: '', postalCode: '', country: '', ...user.address });
  const [passwords, setPasswords] = useState(EMPTY_PASSWORDS);
  const [passwordError, setPasswordError] = useState('');
  const [saving, setSaving] = useState('');
  const [deleteInput, setDeleteInput] = useState('');
  const [deletePassword, setDeletePassword] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    if (hash) document.getElementById(hash.slice(1))?.scrollIntoView({ behavior: 'smooth' });
  }, [hash]);

  const save = async (key, payload, successMessage) => {
    setSaving(key);
    try {
      setUser(await apiJson('/api/auth/profile', { method: 'PUT', body: JSON.stringify(payload) }));
      toast.success(successMessage);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving('');
    }
  };

  const changePassword = async (e) => {
    e.preventDefault();
    setPasswordError('');
    if (passwords.newPassword !== passwords.confirm) return setPasswordError('New passwords do not match');

    setSaving('password');
    try {
      const data = await apiJson('/api/auth/change-password', {
        method: 'PUT',
        body: JSON.stringify({ currentPassword: passwords.currentPassword, newPassword: passwords.newPassword }),
      });
      if (data.token) setAuthToken(data.token);
      setPasswords(EMPTY_PASSWORDS);
      toast.success('Password updated. Other devices have been signed out.');
    } catch (err) {
      setPasswordError(err.message);
    } finally {
      setSaving('');
    }
  };

  const deleteAccount = async () => {
    setSaving('delete');
    try {
      await apiJson('/api/auth/delete-account', { method: 'DELETE', body: JSON.stringify({ password: deletePassword }) });
      toast.success('Your account has been deleted.');
      await logout();
    } catch (err) {
      toast.error(err.message);
      setSaving('');
      setConfirmDelete(false);
    }
  };

  const onPasswordChange = (e) => setPasswords((p) => ({ ...p, [e.target.name]: e.target.value }));

  return (
    <div className="mx-auto max-w-[700px] space-y-4 px-3 py-4 sm:px-4">
      <Breadcrumbs items={[{ label: 'Your Account', to: '/account' }, { label: 'Login & security' }]} />
      <h1 className="text-[28px] font-medium">Login &amp; security</h1>

      <Section id="profile" title="Name & email">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            save('name', { name }, 'Name updated');
          }}
        >
          <AuthFormInput label="Name" name="name" value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" />
          <AuthFormInput label="Email" name="email" type="email" value={user.email} onChange={() => {}} required={false} hint="Your email address can't be changed." />
          <button type="submit" disabled={saving === 'name' || name.trim() === user.name} className="btn-cta">Save changes</button>
        </form>
      </Section>

      <Section id="address" title="Default delivery address">
        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            save('address', { address }, 'Address saved');
          }}
        >
          <AddressForm value={address} onChange={setAddress} idPrefix="profile" />
          <button type="submit" disabled={saving === 'address'} className="btn-cta">Save address</button>
        </form>
      </Section>

      <Section id="security" title="Change password">
        <form onSubmit={changePassword}>
          <AuthFormInput label="Current password" name="currentPassword" type="password" value={passwords.currentPassword} onChange={onPasswordChange} autoComplete="current-password" />
          <AuthFormInput label="New password" name="newPassword" type="password" value={passwords.newPassword} onChange={onPasswordChange} autoComplete="new-password" hint="8+ characters with uppercase, lowercase, number and symbol." />
          <AuthFormInput label="Confirm new password" name="confirm" type="password" value={passwords.confirm} onChange={onPasswordChange} autoComplete="new-password" error={passwordError} />
          <button type="submit" disabled={saving === 'password'} className="btn-cta">Update password</button>
        </form>
      </Section>

      <Section id="delete" title="Delete account">
        <p className="mb-3 text-sm text-[#565959]">This permanently removes your account, cart, wish list and order history.</p>
        <label htmlFor="delete-confirm" className="mb-1 block text-sm">Type <b>delete me</b> to confirm</label>
        <div className="flex flex-wrap gap-2">
          <input id="delete-confirm" value={deleteInput} onChange={(e) => setDeleteInput(e.target.value)} className="field max-w-xs" />
          <input
            type="password"
            value={deletePassword}
            onChange={(e) => setDeletePassword(e.target.value)}
            placeholder="Your password"
            aria-label="Your password to confirm"
            autoComplete="current-password"
            className="field max-w-xs"
          />
          <button type="button" disabled={deleteInput !== 'delete me' || !deletePassword} onClick={() => setConfirmDelete(true)} className="btn border-[#b12704] bg-[#cc0c39] text-white hover:bg-[#b12704] hover:text-white">
            Delete my account
          </button>
        </div>
      </Section>

      <ConfirmDialog open={confirmDelete} title="Delete your account?" confirmLabel="Delete account" danger busy={saving === 'delete'} onClose={() => setConfirmDelete(false)} onConfirm={deleteAccount}>
        This action cannot be undone.
      </ConfirmDialog>
    </div>
  );
}
