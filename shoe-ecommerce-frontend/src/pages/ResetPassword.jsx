import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import AuthButton from '../components/AuthButton';
import AuthFormInput from '../components/AuthFormInput';
import AuthLayout from '../components/AuthLayout';
import PasswordToggle from '../components/PasswordToggle';
import usePageTitle from '../hooks/usePageTitle';
import { apiJson } from '../utils/apiFetch.jsx';
import { PASSWORD_RULES } from '../utils/passwordRules.js';

export default function ResetPassword() {
  usePageTitle('Reset password');
  const { token } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState({ password: '', confirm: '' });
  const [shown, setShown] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setErrors({});
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!PASSWORD_RULES.every(({ test }) => test(form.password))) return setErrors({ password: 'Password does not meet all the requirements' });
    if (form.password !== form.confirm) return setErrors({ confirm: 'Passwords must match' });

    setLoading(true);
    try {
      await apiJson(`/api/auth/reset/${token}`, { method: 'PUT', body: JSON.stringify({ password: form.password }) });
      toast.success('Password updated. Please sign in.');
      navigate('/login', { replace: true });
    } catch (err) {
      setErrors({ form: err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout title="Create new password" footer={<Link to="/login">Back to sign in</Link>}>
      {errors.form && (
        <div role="alert" className="mb-4 rounded border border-[#c40000] p-3 text-sm text-[#c40000]">
          {errors.form} <Link to="/forgot-password">Request a new link</Link>
        </div>
      )}
      <form onSubmit={handleSubmit} noValidate>
        <AuthFormInput label="New password" type={shown ? 'text' : 'password'} name="password" value={form.password} onChange={handleChange} error={errors.password} autoComplete="new-password" hint="8+ characters with uppercase, lowercase, number and symbol.">
          <PasswordToggle shown={shown} onToggle={() => setShown((s) => !s)} />
        </AuthFormInput>
        <AuthFormInput label="Re-enter new password" type={shown ? 'text' : 'password'} name="confirm" value={form.confirm} onChange={handleChange} error={errors.confirm} autoComplete="new-password" />
        <AuthButton text="Save and sign in" loading={loading} />
      </form>
    </AuthLayout>
  );
}
