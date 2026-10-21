const FIELDS = [
  { name: 'fullName', label: 'Full name', autoComplete: 'name' },
  { name: 'phone', label: 'Phone number (optional)', autoComplete: 'tel', required: false },
  { name: 'address', label: 'Street address', autoComplete: 'street-address', placeholder: '123 Main Street, Apt 4' },
  { name: 'city', label: 'City', autoComplete: 'address-level2' },
  { name: 'postalCode', label: 'ZIP / Postal code', autoComplete: 'postal-code' },
  { name: 'country', label: 'Country', autoComplete: 'country-name' },
];

export default function AddressForm({ value, onChange, idPrefix = 'address' }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {FIELDS.map(({ name, label, autoComplete, placeholder, required = true }) => (
        <div key={name} className={name === 'address' ? 'sm:col-span-2' : ''}>
          <label htmlFor={`${idPrefix}-${name}`} className="mb-1 block text-sm font-bold">{label}</label>
          <input
            id={`${idPrefix}-${name}`}
            name={name}
            value={value[name] || ''}
            onChange={(e) => onChange({ ...value, [name]: e.target.value })}
            autoComplete={autoComplete}
            placeholder={placeholder}
            required={required}
            className="field"
          />
        </div>
      ))}
    </div>
  );
}

export function AddressLines({ address }) {
  return (
    <address className="text-sm not-italic leading-relaxed">
      <b>{address.fullName}</b><br />
      {address.address}<br />
      {address.city}, {address.postalCode}<br />
      {address.country}
      {address.phone && <><br />Phone: {address.phone}</>}
    </address>
  );
}
