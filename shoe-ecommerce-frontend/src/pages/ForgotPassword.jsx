import { useState } from 'react';
import { Link } from 'react-router-dom';
import AuthFormInput from '../components/AuthFormInput';
import AuthButton from '../components/AuthButton';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const validateEmail = (email) => /^\S+@\S+\.\S+$/.test(email);

  const handleChange = (e) => {
    const value = e.target.value;
    setEmail(value);
    if (error && validateEmail(value)) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

   if (!email || !validateEmail(email)) {
      setError('Please enter a valid email address');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Something went wrong');

      setSubmitted(true);
    } catch (err) {
      setError(err.message || 'Something went wrong. Try again later.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen px-4 py-10 bg-gray-50 animate-fade-in">
      <div className="w-full max-w-md p-8 space-y-6 bg-white shadow-xl rounded-xl">
        <h2 className="text-2xl font-bold text-center text-gray-800">Forgot Password 🔐</h2>

        {submitted ? (
          <div className="text-center text-green-600">
            ✅ Check your inbox for the password reset link.
          </div>
        ) : (
          <form className="space-y-5" onSubmit={handleSubmit} noValidate>
            <AuthFormInput
              label="Email"
              type="email"
              name="email"
              value={email}
              onChange={handleChange}
              error={error}
              placeholder="you@example.com"
            />

            <AuthButton
              text={loading ? 'Sending...' : 'Send Reset Link'}
              disabled={loading}
            />
          </form>
        )}

        <div className="text-sm text-center text-gray-600">
          Go back to{' '}
          <Link to="/login" className="font-medium text-primary hover:underline">
            Login
          </Link>
        </div>
      </div>
    </div>
  );
}
