import React from 'react';

// Test ultra-simple pour vérifier que React fonctionne
const TestApp: React.FC = () => {
  console.log('TestApp rendu avec succès');
  
  return (
    <div style={{ 
      padding: '20px', 
      backgroundColor: '#f0f0f0', 
      minHeight: '100vh',
      fontFamily: 'Arial, sans-serif'
    }}>
      <h1 style={{ color: '#333', marginBottom: '20px' }}>
        ✅ AQUA PILOT - Test Réussi !
      </h1>
      <p style={{ fontSize: '18px', marginBottom: '20px' }}>
        L'application React fonctionne correctement.
      </p>
      <div style={{ 
        backgroundColor: 'white', 
        padding: '15px', 
        borderRadius: '8px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}>
        <p><strong>Timestamp:</strong> {new Date().toLocaleString()}</p>
        <p><strong>Status:</strong> <span style={{ color: 'green' }}>✅ Opérationnel</span></p>
      </div>
    </div>
  );
};

export default TestApp;