import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import AuthFormInput from '../components/AuthFormInput';
import AuthButton from '../components/AuthButton';

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState('');
  const navigate = useNavigate();

  // Handle input changes with inline validation
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));

    // Clear error when input becomes valid
    setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const validate = () => {
    const newErrors = {};
    if (!form.email) {
      newErrors.email = 'Email is required';
    } else if (!/^\S+@\S+\.\S+$/.test(form.email)) {
      newErrors.email = 'Invalid email format';
    }

    if (!form.password) {
      newErrors.password = 'Password is required';
    } else if (form.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(form),
      });

      if (!res.ok) throw new Error('Invalid email or password');
      const data = await res.json();
      navigate('/');
    } catch (err) {
      setServerError(err.message || 'Login failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen px-4 py-10 bg-gray-50">
      <div className="w-full max-w-md p-8 space-y-6 bg-white shadow-xl rounded-xl">
        <h2 className="text-2xl font-bold text-center text-gray-800">Login</h2>

        <form className="space-y-5" onSubmit={handleSubmit} noValidate>
          {/* Email Field */}
          <AuthFormInput
            label="Email"
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            error={errors.email}
          />

          {/* Password Field with Toggle */}
          <div>
            <label htmlFor="password" className="block mb-1 text-sm font-medium text-gray-700">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                id="password"
                value={form.password}
                onChange={handleChange}
                className={`w-full px-4 py-2 pr-10 border rounded-md shadow-sm focus:outline-none focus:ring-2 ${
                  errors.password
                    ? 'border-red-500 focus:ring-red-300'
                    : 'border-gray-300 focus:ring-primary'
                }`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute text-gray-500 -translate-y-1/2 top-1/2 right-3"
                aria-label="Toggle password visibility"
              >
                {showPassword ? (
                  <EyeSlashIcon className="w-5 h-5" />
                ) : (
                  <EyeIcon className="w-5 h-5" />
                )}
              </button>
            </div>
            {errors.password && <p className="mt-1 text-sm text-red-500">{errors.password}</p>}
          </div>

          {serverError && <p className="text-sm text-red-500">{serverError}</p>}

          {/* Submit Button */}
          <AuthButton
            text={isSubmitting ? 'Logging in...' : 'Sign In'}
            disabled={isSubmitting}
          />
        </form>

        <div className="flex justify-between text-sm text-gray-600">
          <Link to="/forgot-password" className="hover:underline">
            Forgot Password?
          </Link>
          <Link to="/signup" className="hover:underline">
            Create Account
          </Link>
        </div>
      </div>
    </div>
  );
}
