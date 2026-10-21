import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';

export default function PasswordToggle({ shown, onToggle }) {
  const Icon = shown ? EyeSlashIcon : EyeIcon;

  return (
    <button
      type="button"
      onClick={onToggle}
      aria-label={shown ? 'Hide password' : 'Show password'}
      className="absolute inset-y-0 right-0 flex items-center px-2.5 text-[#565959] hover:text-[#0f1111]"
    >
      <Icon className="h-5 w-5" />
    </button>
  );
}
