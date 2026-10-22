const SITE_KEY = import.meta.env.VITE_RECAPTCHA_SITE_KEY;

let loading = null;

function loadRecaptcha() {
  if (window.grecaptcha) return Promise.resolve(window.grecaptcha);

  loading ??= new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = `https://www.google.com/recaptcha/api.js?render=${encodeURIComponent(SITE_KEY)}`;
    script.async = true;
    script.onload = () => (window.grecaptcha ? window.grecaptcha.ready(() => resolve(window.grecaptcha)) : reject(new Error('reCAPTCHA unavailable')));
    script.onerror = () => {
      loading = null;
      reject(new Error('Verification could not be loaded. Check your connection and try again.'));
    };
    document.head.appendChild(script);
  });

  return loading;
}

// Returns an invisible reCAPTCHA v3 token for the given action. With no site key configured the
// check is skipped in development only; a production build without a key refuses to continue.
export async function getRecaptchaToken(action) {
  if (!SITE_KEY) {
    if (import.meta.env.DEV) return undefined;
    throw new Error('Verification is not set up on this site yet.');
  }

  const timeout = new Promise((_, reject) => setTimeout(() => reject(new Error('Verification timed out. Please try again.')), 8000));
  const grecaptcha = await Promise.race([loadRecaptcha(), timeout]);
  return Promise.race([grecaptcha.execute(SITE_KEY, { action }), timeout]);
}
