// Keeps logs useful without storing full email addresses.
const maskEmail = (email = '') => {
  const [local = '', domain = ''] = String(email).split('@');
  if (!domain) return '***';
  return `${local.slice(0, 1)}***@${domain}`;
};

module.exports = { maskEmail };
