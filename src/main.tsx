import { createRoot } from 'react-dom/client';
import AppMinimal from './AppMinimal.tsx';
import './index.css';

// REBUILD FORCÉ - Version 3.0
console.log('🚀 AQUA PILOT - Rebuild forcé activé');

const rootElement = document.getElementById("root");
if (!rootElement) {
  throw new Error('Root element not found');
}

createRoot(rootElement).render(<AppMinimal />);
