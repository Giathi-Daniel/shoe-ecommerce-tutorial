export default function AuthButton({ text, loading = false }) {
  return (
    <button type="submit" disabled={loading} className="btn-cta w-full py-2">
      {loading ? 'Please wait...' : text}
    </button>
  );
}
