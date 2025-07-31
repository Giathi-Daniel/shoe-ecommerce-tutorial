import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

export default function NotFound() {
  const [quote, setQuote] = useState(null);

  useEffect(() => {
    const fetchQuote = async () => {
      try {
      const res = await fetch(
        'https://api.allorigins.win/get?url=' + encodeURIComponent('https://zenquotes.io/api/random')
      );
      const data = await res.json();
      const parsedQuote = JSON.parse(data.contents);
      setQuote(parsedQuote[0]);
      } catch (err) {
        setQuote({ q: 'Oops! Failed to load quote.', a: '' });
      }
    };

    fetchQuote();

    const interval = setInterval(fetchQuote, 20000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex flex-col items-center justify-center flex-grow px-6 text-center">
        <h1 className="mb-4 font-bold text-7xl text-primary">404</h1>
        <p className="mb-6 text-xl font-semibold text-gray-600">
          Page not found.
        </p>
        <p className="max-w-lg mb-6 text-gray-500">
          {quote ? `"${quote.q}" — ${quote.a || 'Anonymous'}` : 'Loading...'}
        </p>
        <Link
          to="/"
          className="inline-block px-5 py-2 text-white transition rounded-full bg-primary hover:bg-accent"
        >
          Go Home
        </Link>
      </main>
    </div>
  );
}
