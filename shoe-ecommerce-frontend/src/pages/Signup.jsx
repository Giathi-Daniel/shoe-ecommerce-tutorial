import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import AuthButton from '../components/AuthButton';
import AuthFormInput from '../components/AuthFormInput';
import AuthLayout from '../components/AuthLayout';
import PasswordToggle from '../components/PasswordToggle';
import RecaptchaNotice from '../components/RecaptchaNotice';
import { useAuth } from '../context/AuthContext';
import usePageTitle from '../hooks/usePageTitle';
import { apiJson } from '../utils/apiFetch.jsx';
import { getRecaptchaToken } from '../utils/recaptcha';
import { safeRedirect } from '../utils/safeRedirect';
import { PASSWORD_RULES } from '../utils/passwordRules.js';

export default function Signup() {
  usePageTitle('Create account');
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { afterLogin } = useAuth();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const validate = () => {
    const next = {};
    if (form.name.trim().length < 2) next.name = 'Enter your name';
    if (!/^\S+@\S+\.\S+$/.test(form.email)) next.email = 'Enter a valid email address';
    if (!PASSWORD_RULES.every(({ test }) => test(form.password))) next.password = 'Password does not meet all the requirements';
    if (form.password !== form.confirm) next.confirm = 'Passwords must match';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    try {
      const recaptchaToken = await getRecaptchaToken('register');
      const data = await apiJson('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({ name: form.name.trim(), email: form.email, password: form.password, recaptchaToken }),
      });
      await afterLogin(data.token);
      toast.success('Welcome to ShoeStore!');
      navigate(safeRedirect(location.state?.from), { replace: true });
    } catch (err) {
      setErrors({ form: err.message });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthLayout
      title="Create account"
      footer={<p>Already have an account? <Link to="/login" state={location.state}>Sign in</Link></p>}
    >
      {errors.form && (
        <div role="alert" className="mb-4 rounded border border-[#c40000] p-3 text-sm">
          <p className="font-bold text-[#c40000]">There was a problem</p>
          <p>{errors.form}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate>
        <AuthFormInput label="Your name" name="name" value={form.name} onChange={handleChange} error={errors.name} autoComplete="name" />
        <AuthFormInput label="Email" type="email" name="email" value={form.email} onChange={handleChange} error={errors.email} autoComplete="email" />
        <AuthFormInput label="Password" type={showPassword ? 'text' : 'password'} name="password" value={form.password} onChange={handleChange} error={errors.password} autoComplete="new-password">
          <PasswordToggle shown={showPassword} onToggle={() => setShowPassword((s) => !s)} />
        </AuthFormInput>

        <ul className="-mt-2 mb-4 grid grid-cols-2 gap-x-2 text-xs" aria-label="Password requirements">
          {PASSWORD_RULES.map(({ label, test }) => (
            <li key={label} className={test(form.password) ? 'text-[#007600]' : 'text-[#565959]'}>
              {test(form.password) ? '✓' : '○'} {label}
            </li>
          ))}
        </ul>

        <AuthFormInput label="Re-enter password" type={showPassword ? 'text' : 'password'} name="confirm" value={form.confirm} onChange={handleChange} error={errors.confirm} autoComplete="new-password" />
        <AuthButton text="Create your ShoeStore account" loading={submitting} />
      </form>

      <p className="mt-4 text-xs text-[#565959]">
        By creating an account, you agree to ShoeStore&apos;s <Link to="/help/terms">Conditions of Use</Link> and <Link to="/help/privacy">Privacy Notice</Link>.
      </p>
      <RecaptchaNotice />
    </AuthLayout>
  );
}
