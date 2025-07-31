export default function AuthFormInput({
  label,
  type,
  name,
  value,
  onChange,
  required = true,
  error,
}) {
  return (
    <div className="mb-4">
      <label htmlFor={name} className="block mb-1 text-sm font-medium text-gray-700">
        {label}
      </label>
      <input
        type={type}
        name={name}
        id={name}
        value={value}
        onChange={onChange}
        required={required}
        className={`w-full px-4 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 ${
          error
            ? 'border-red-500 focus:ring-red-300'
            : 'border-gray-300 focus:ring-primary focus:border-primary'
        }`}
      />
      {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
    </div>
  );
}
