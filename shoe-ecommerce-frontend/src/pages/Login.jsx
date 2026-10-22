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

export default function Login() {
  usePageTitle('Sign in');
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { afterLogin } = useAuth();
  const redirectTo = safeRedirect(location.state?.from);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const validate = () => {
    const next = {};
    if (!/^\S+@\S+\.\S+$/.test(form.email)) next.email = 'Enter a valid email address';
    if (!form.password) next.password = 'Enter your password';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    try {
      const recaptchaToken = await getRecaptchaToken('login');
      const data = await apiJson('/api/auth/login', { method: 'POST', body: JSON.stringify({ ...form, recaptchaToken }) });
      await afterLogin(data.token);
      toast.success(`Welcome back, ${data.user.name.split(' ')[0]}!`);
      navigate(redirectTo, { replace: true });
    } catch (err) {
      setErrors({ form: err.message });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthLayout
      title="Sign in"
      footer={
        <>
          <p className="mb-2 text-[#565959]">New to ShoeStore?</p>
          <Link to="/signup" state={location.state} className="btn-light w-full hover:text-[#0f1111]">Create your ShoeStore account</Link>
        </>
      }
    >
      {errors.form && (
        <div role="alert" className="mb-4 rounded border border-[#c40000] p-3 text-sm">
          <p className="font-bold text-[#c40000]">There was a problem</p>
          <p>{errors.form}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate>
        <AuthFormInput label="Email" type="email" name="email" value={form.email} onChange={handleChange} error={errors.email} autoComplete="email" />
        <AuthFormInput label="Password" type={showPassword ? 'text' : 'password'} name="password" value={form.password} onChange={handleChange} error={errors.password} autoComplete="current-password">
          <PasswordToggle shown={showPassword} onToggle={() => setShowPassword((s) => !s)} />
        </AuthFormInput>
        <div className="-mt-2 mb-4 text-xs"><Link to="/forgot-password">Forgot your password?</Link></div>
        <AuthButton text="Sign in" loading={submitting} />
      </form>

      <p className="mt-4 text-xs text-[#565959]">
        By continuing, you agree to ShoeStore&apos;s <Link to="/help/terms">Conditions of Use</Link> and <Link to="/help/privacy">Privacy Notice</Link>.
      </p>
      {import.meta.env.DEV && (
        <p className="mt-3 rounded bg-[#f0f2f2] p-2 text-xs text-[#565959]">
          Local demo account: <b>demo@shoestore.com</b> / <b>Demo@12345</b>
        </p>
      )}
      <RecaptchaNotice />
    </AuthLayout>
  );
}
