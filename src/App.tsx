
import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import AppWithPrivacy from '@/components/AppWithPrivacy';
import './App.css';

function App() {
  return (
    <Router>
      <AppWithPrivacy />
    </Router>
  );
}

export default App;
