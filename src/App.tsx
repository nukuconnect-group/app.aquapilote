
import React from 'react';

const TestComponent = () => {
  return (
    <div style={{
      padding: '40px',
      fontFamily: 'Arial, sans-serif',
      backgroundColor: '#f0f0f0',
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <h1 style={{ color: '#333', marginBottom: '20px' }}>
        🐟 AQUA PILOT - Test Minimal
      </h1>
      <p style={{ color: '#666', fontSize: '18px', marginBottom: '30px' }}>
        Application de gestion piscicole intelligente
      </p>
      <div style={{
        padding: '20px',
        backgroundColor: 'white',
        borderRadius: '8px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
        textAlign: 'center'
      }}>
        <p>✅ React fonctionne correctement</p>
        <p>🔄 Chargement des fonctionnalités en cours...</p>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  console.log('App minimal rendering');
  return <TestComponent />;
};

export default App;
