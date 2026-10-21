export default function AuthFormInput({ label, type = 'text', name, value, onChange, error, hint, autoComplete, required = true, children }) {
  return (
    <div className="mb-4">
      <label htmlFor={name} className="mb-1 block text-sm font-bold">{label}</label>
      <div className="relative">
        <input
          type={type}
          name={name}
          id={name}
          value={value}
          onChange={onChange}
          required={required}
          autoComplete={autoComplete}
          aria-invalid={!!error}
          aria-describedby={error ? `${name}-error` : undefined}
          className={`field ${error ? '!border-[#d00] !ring-[#d00]/20' : ''} ${children ? 'pr-10' : ''}`}
        />
        {children}
      </div>
      {hint && !error && <p className="mt-1 text-xs text-[#565959]">{hint}</p>}
      {error && (
        <p id={`${name}-error`} role="alert" className="mt-1 text-xs text-[#c40000]">
          <span aria-hidden="true">⚠ </span>{error}
        </p>
      )}
    </div>
  );
}
