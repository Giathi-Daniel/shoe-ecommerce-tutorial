import { Suspense } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import Header from './components/Header';
import Footer from './components/Footer';
import ScrollToTop from './components/ScrollToTop';
import { PageSpinner } from './components/Skeletons';
import routes, { MINIMAL_LAYOUT_PATHS } from './routes';

import 'react-toastify/dist/ReactToastify.css';

function App() {
  const { pathname } = useLocation();
  const minimalLayout = MINIMAL_LAYOUT_PATHS.some((path) => pathname.startsWith(path));

  return (
    <div className="flex min-h-screen flex-col">
      <ScrollToTop />
      {!minimalLayout && <Header />}
      <main className={`flex-grow ${minimalLayout ? 'bg-white' : 'bg-[#eaeded]'}`}>
        <Suspense fallback={<PageSpinner />}>
          <Routes>
            {routes.map(({ path, element }) => (
              <Route key={path} path={path} element={element} />
            ))}
          </Routes>
        </Suspense>
      </main>
      {!minimalLayout && <Footer />}
      <ToastContainer position="top-center" autoClose={3000} newestOnTop pauseOnFocusLoss={false} />
    </div>
  );
}

export default App;
