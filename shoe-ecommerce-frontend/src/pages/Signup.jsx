import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import AuthFormInput from '../components/AuthFormInput';
import AuthButton from '../components/AuthButton';

const getPasswordStrength = (password) => {
  if (!password) return '';
  if (password.length < 6) return 'Weak';
  if (/[a-z]/.test(password) && /[A-Z]/.test(password) && /\d/.test(password)) return 'Strong';
  return 'Medium';
};

export default function Signup() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirm: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value}));

    // clear error as user corrects input
    setErrors((prev) => ({ ...prev, [name]: ''}))
  }
    
  const validate = () => {
    const errs = {};
    if (!form.name) errs.name = 'Name is required';
    if (!form.email || !/^\S+@\S+\.\S+$/.test(form.email))
      errs.email = 'Valid email is required';
    if (!form.password || form.password.length < 6)
      errs.password = 'Minimum 6 characters';
    if (form.password !== form.confirm)
      errs.confirm = 'Passwords do not match';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          password: form.password,
        }),
      });

      if (!res.ok) throw new Error('Failed to create account');
      navigate('/login');
    } catch (err) {
      setServerError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen px-4 py-10 bg-gray-50">
      <div className="w-full max-w-md p-8 space-y-6 bg-white shadow-xl rounded-xl">
        <h2 className="text-2xl font-bold text-center text-gray-800">
          Create Your Account 🚀
        </h2>

        <form className="space-y-5" onSubmit={handleSubmit} noValidate>
          {/* Name */}
          <AuthFormInput
            label="Name"
            type="text"
            name="name"
            value={form.name}
            onChange={handleChange}
            error={errors.name}
          />

          {/* Email */}
          <AuthFormInput
            label="Email"
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            error={errors.email}
          />

            {/* Password with toggle and strength */}
            <div className="relative">
                <label className="block mb-1 text-sm font-medium text-gray-700">Password</label>
                <div className="relative">
                    <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={form.password}
                    onChange={handleChange}
                    className={`w-full px-4 py-2 pr-10 border rounded-md focus:outline-none focus:ring-2 ${
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
                {form.password && (
                    <p className="mt-1 text-sm text-gray-500">
                    Strength:{' '}
                    <span className="font-medium">
                        {getPasswordStrength(form.password)}
                    </span>
                    </p>
                )}
                {errors.password && <p className="mt-1 text-sm text-red-500">{errors.password}</p>}
            </div>

            {/* Confirm Password */}
            <AuthFormInput
                label="Confirm Password"
                type={showPassword ? 'text' : 'password'}
                name="confirm"
                value={form.confirm}
                onChange={handleChange}
                error={errors.confirm}
            />

          {serverError && (
            <p className="text-sm text-red-500">{serverError}</p>
          )}

          {/* Submit */}
          <AuthButton
            text={isSubmitting ? 'Creating...' : 'Create Account'}
            disabled={isSubmitting}
          />
        </form>

        <div className="text-sm text-center text-gray-600">
          Already have an account?{' '}
          <Link to="/login" className="font-medium text-primary hover:underline">
            Login
          </Link>
        </div>
      </div>
    </div>
  );
}
