import { renderToString } from 'react-dom/server';
import { StaticRouter } from 'react-router-dom';
import Root from './Root.jsx';
import './index.css';

export function render(url) {
  return renderToString(
    <Root router={(children) => <StaticRouter location={url}>{children}</StaticRouter>} />
  );
}
