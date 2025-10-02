import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Force rebuild - v2.0
console.log('AQUA PILOT - Application starting...');

const rootElement = document.getElementById("root");
if (!rootElement) {
  throw new Error('Root element not found');
}

createRoot(rootElement).render(<App />);
