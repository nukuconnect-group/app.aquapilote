import React from 'react';

// Version minimale pour forcer le rebuild
const AppMinimal: React.FC = () => {
  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      color: 'white',
      fontFamily: 'Arial, sans-serif'
    }}>
      <div style={{ textAlign: 'center', padding: '2rem' }}>
        <h1 style={{ fontSize: '3rem', marginBottom: '1rem' }}>🐟 AQUA PILOT</h1>
        <p style={{ fontSize: '1.5rem', marginBottom: '2rem' }}>Application chargée avec succès !</p>
        <p style={{ fontSize: '1rem', opacity: 0.9 }}>
          Le rebuild a fonctionné. L'application complète peut maintenant être restaurée.
        </p>
      </div>
    </div>
  );
};

export default AppMinimal;
