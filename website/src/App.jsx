import React, { useState } from 'react';
import Hero from './components/Hero';
import Analyzer from './components/Analyzer';

function App() {
  const [showAnalyzer, setShowAnalyzer] = useState(false);

  return (
    <div className="App">
      <nav className="container" style={{ padding: '20px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ fontWeight: '800', fontSize: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span>🚩</span> RedFlag Detector
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
