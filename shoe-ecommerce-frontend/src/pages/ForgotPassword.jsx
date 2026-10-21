import { useState } from 'react';
import { Link } from 'react-router-dom';
import AuthButton from '../components/AuthButton';
import AuthFormInput from '../components/AuthFormInput';
import AuthLayout from '../components/AuthLayout';
import usePageTitle from '../hooks/usePageTitle';
import { apiJson } from '../utils/apiFetch.jsx';

export default function ForgotPassword() {
  usePageTitle('Password assistance');
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!/^\S+@\S+\.\S+$/.test(email)) return setError('Enter a valid email address');

    setLoading(true);
    try {
      await apiJson('/api/auth/forgot-password', { method: 'POST', body: JSON.stringify({ email }) });
      setSent(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout title="Password assistance" footer={<Link to="/login">Back to sign in</Link>}>
      {sent ? (
        <div role="status" className="space-y-2 text-sm">
          <p className="font-bold text-[#007600]">Check your email</p>
          <p>If an account exists for <b>{email}</b>, we&apos;ve sent a link to reset your password. It expires in 10 minutes.</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} noValidate>
          <p className="mb-4 text-sm">Enter the email address associated with your account and we&apos;ll send you a reset link.</p>
          <AuthFormInput label="Email" type="email" name="email" value={email} onChange={(e) => { setEmail(e.target.value); setError(''); }} error={error} autoComplete="email" />
          <AuthButton text="Send reset link" loading={loading} />
        </form>
      )}
    </AuthLayout>
  );
}
