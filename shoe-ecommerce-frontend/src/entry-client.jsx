import { hydrateRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import Root from './Root.jsx';
import './index.css';

hydrateRoot(
  document.getElementById('root'),
  <Root router={(children) => <BrowserRouter>{children}</BrowserRouter>} />
);
