import { lazy } from 'react';
import PrivateRoute from './private/PrivateRoute';
import Home from './pages/Home';
import Products from './pages/Products';
import ProductDetails from './pages/ProductDetails';
import Info from './pages/Info';
import Login from './pages/Login';
import Signup from './pages/Signup';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import NotFound from './pages/NotFound';

// Public pages are bundled eagerly so SSR can render them; signed-in pages never render on the server

const Cart = lazy(() => import('./pages/Cart'));
const Checkout = lazy(() => import('./pages/Checkout'));
const Orders = lazy(() => import('./pages/Orders'));
const OrderDetails = lazy(() => import('./pages/OrderDetails'));
const Wishlist = lazy(() => import('./pages/Wishlist'));
const Account = lazy(() => import('./pages/Account'));
const Profile = lazy(() => import('./pages/Profile'));
const Admin = lazy(() => import('./pages/Admin'));

const priv = (element, options) => <PrivateRoute {...options}>{element}</PrivateRoute>;

export const MINIMAL_LAYOUT_PATHS = ['/login', '/signup', '/forgot-password', '/reset-password', '/checkout'];

const routes = [
  { path: '/', element: <Home /> },
  { path: '/products', element: <Products /> },
  { path: '/products/:id', element: <ProductDetails /> },
  { path: '/help/:topic', element: <Info /> },
  { path: '/login', element: <Login /> },
  { path: '/signup', element: <Signup /> },
  { path: '/forgot-password', element: <ForgotPassword /> },
  { path: '/reset-password/:token', element: <ResetPassword /> },
  { path: '/cart', element: priv(<Cart />) },
  { path: '/checkout', element: priv(<Checkout />) },
  { path: '/orders', element: priv(<Orders />) },
  { path: '/orders/:id', element: priv(<OrderDetails />) },
  { path: '/wishlist', element: priv(<Wishlist />) },
  { path: '/account', element: priv(<Account />) },
  { path: '/account/settings', element: priv(<Profile />) },
  { path: '/admin', element: priv(<Admin />, { adminOnly: true }) },
  { path: '*', element: <NotFound /> },
];

export default routes;
