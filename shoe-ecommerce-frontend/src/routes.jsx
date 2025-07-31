import Home from './pages/Home';
import NotFound from './pages/NotFound'
// import ProductDetails from './pages/ProductDetails';
// import Cart from './pages/Cart';
// import Checkout from './pages/Checkout';
import Login from './pages/Login';
import Signup from './pages/Signup.jsx';
import ForgotPassword from './pages/ForgotPassword.jsx';

const routes = [
  { path: '/', element: <Home /> },
  { path: '*', element: <NotFound /> },
//   { path: '/product/:id', element: <ProductDetails /> },
//   { path: '/cart', element: <Cart /> },
//   { path: '/checkout', element: <Checkout /> },
  { path: '/login', element: <Login /> },
  { path: '/signup', element: <Signup /> },
  { path: '/forgot-password', element: <ForgotPassword /> }
];

export default routes;