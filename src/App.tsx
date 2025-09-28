
import React from 'react';

console.log('App.tsx - Starting minimal test');

const App: React.FC = () => {
  console.log('App minimal render');
  
  return (
    <div style={{ padding: '20px', fontFamily: 'Arial' }}>
      <h1>Minimal App Test</h1>
      <p>If you see this, React is working</p>
    </div>
  );
};

export default App;
