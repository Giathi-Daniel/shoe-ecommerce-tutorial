import { lazy, Suspense } from 'react';


const Home = lazy(() => import('./pages/Home'));
const NotFound = lazy(() => import('./pages/NotFound'));
const Login = lazy(() => import('./pages/Login'));
const Signup = lazy(() => import('./pages/Signup'));
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'));
const Products = lazy(() => import('./pages/Products'));

import ProductDetails from './pages/ProductDetails';
import Cart from './pages/Cart';
// import Checkout from './pages/Checkout';

import PrivateRoute from './private/PrivateRoute'; 

const Profile = lazy(() => import('./pages/Profile'));

const routes = [
  { path: '/', element: <Suspense fallback={<div>Loading...</div>}><Home /></Suspense> },
  { path: '/products', element: <Suspense fallback={<div>Loading...</div>}><Products /></Suspense> },
  { path: '/products/:id', element: <Suspense fallback={<div>Loading...</div>}><ProductDetails /></Suspense> },
  { path: '/cart', 
    element: (
      <PrivateRoute>
        <Suspense fallback={<div>Loading...</div>}><Cart /></Suspense> 
      </PrivateRoute>
    ),
  },
  { path: '/login', element: <Suspense fallback={<div>Loading...</div>}><Login /></Suspense> },
  { path: '/signup', element: <Suspense fallback={<div>Loading...</div>}><Signup /></Suspense> },
  { path: '/forgot-password', element: <Suspense fallback={<div>Loading...</div>}><ForgotPassword /></Suspense> },
  {
    path: '/profile',
    element: (
      <PrivateRoute>
        <Suspense fallback={<div>Loading...</div>}><Profile /></Suspense>
      </PrivateRoute>
    ),
  },
  { path: '*', element: <Suspense fallback={<div>Loading...</div>}><NotFound /></Suspense> },
];

export default routes;