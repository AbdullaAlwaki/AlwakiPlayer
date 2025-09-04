import ReactDOM from 'react-dom/client';
import { HashRouter } from 'react-router-dom';
import { FetchData } from './Util/createContext';
import './index.css';
import App from './App';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <FetchData>
    <HashRouter>
      <App />
    </HashRouter>
  </FetchData>
);
