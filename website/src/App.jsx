import React, { useState } from 'react';
import Hero from './components/Hero';
import Analyzer from './components/Analyzer';
import Background3D from './components/Background3D';
import logo from './assets/logo.png';

function App() {
  const [showAnalyzer, setShowAnalyzer] = useState(false);

  return (
    <div className="App" style={{ color: '#F9FAFB', minHeight: '100vh', position: 'relative' }}>
      <Background3D />
      <nav className="container" style={{ padding: '20px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'relative', zIndex: 10 }}>
        <div style={{ fontWeight: '800', fontSize: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <img src={logo} alt="RedFlag Logo" style={{ height: '32px' }} /> RedFlag Detector
        </div>
        <div>
          {/* Navigation could go here */}
        </div>
      </nav>

      {showAnalyzer ? (
        <Analyzer onBack={() => setShowAnalyzer(false)} />
      ) : (
        <Hero onStart={() => setShowAnalyzer(true)} />
      )}

      <footer style={{ textAlign: 'center', padding: '40px 0', color: '#9CA3AF', fontSize: '14px' }}>
        <p>&copy; 2024 RedFlag Detector. Not legal advice.</p>
      </footer>
    </div>
  );
}

export default App;
