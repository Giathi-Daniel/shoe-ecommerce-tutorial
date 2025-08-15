import { useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import routes from './routes';

import 'react-toastify/dist/ReactToastify.css';
import { ToastContainer } from 'react-toastify';

function App() {
  // This ensures CSRF token is fetched and cached once on app load
  useEffect(() => {
    const initCsrfToken = async () => {
      try {
        const res = await fetch('/api/csrf-token', {
          credentials: 'include', // make sure cookies are sent
        });
        const data = await res.json();

        if (data.csrfToken) {
          localStorage.setItem('csrfToken', data.csrfToken);
        } else {
          console.warn('No CSRF token returned from server');
        }
      } catch (err) {
        console.error('Failed to initialize CSRF token:', err);
      }
    };

    initCsrfToken();
  }, []);

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow bg-gray-50">
        <Routes>
          {routes.map((route) => (
            <Route key={route.path} path={route.path} element={route.element} />
          ))}
        </Routes>
      </main>
      <Footer />
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        closeOnClick
        pauseOnHover
        draggable
      />
    </div>
  );
}

export default App;