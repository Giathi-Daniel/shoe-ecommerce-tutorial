// Only same-site paths are allowed as post-login destinations, so a crafted link cannot send
// a user to another site ("//evil.example" and "/\evil.example" are rejected too).
export function safeRedirect(path, fallback = '/') {
  return typeof path === 'string' && /^\/(?![/\\])/.test(path) ? path : fallback;
}
