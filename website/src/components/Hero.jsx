import React from 'react';

export default function Hero({ onStart }) {
    return (
        <div className="container" style={{ textAlign: 'center', padding: '100px 20px' }}>
            <div style={{ marginBottom: '20px', display: 'inline-block', padding: '4px 12px', background: '#F3F4F6', borderRadius: '20px', fontSize: '14px', fontWeight: '500', color: '#4B5563' }}>
                ✨ Identify hidden risks in seconds
            </div>

            <h1 style={{ maxWidth: '800px', margin: '0 auto 24px auto', background: 'linear-gradient(to right, #111827, #4F46E5)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                Don't Agree to What You Don't Understand.
            </h1>

            <p style={{ fontSize: '1.25rem', maxWidth: '600px', margin: '0 auto 40px auto' }}>
                Scan Terms & Conditions instantly. Detect "No Refund" clauses, hidden fees, and data selling schemes before you click accept.
            </p>

            <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
                <button onClick={onStart} className="btn-primary" style={{ fontSize: '1.1rem', padding: '16px 32px' }}>
                    Analyze Text Now
                </button>
                <button className="btn-secondary" style={{ fontSize: '1.1rem', padding: '16px 32px' }} onClick={() => window.open('https://chrome.google.com', '_blank')}>
                    Get Chrome Extension
                </button>
            </div>

            <div style={{ marginTop: '80px', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px', textAlign: 'left' }}>
                <div className="glass-panel" style={{ padding: '24px' }}>
                    <div style={{ fontSize: '24px', marginBottom: '16px' }}>🛡️</div>
                    <h3>Privacy First</h3>
                    <p>Everything runs 100% locally in your browser. We never see your data.</p>
                </div>
                <div className="glass-panel" style={{ padding: '24px' }}>
                    <div style={{ fontSize: '24px', marginBottom: '16px' }}>⚡</div>
                    <h3>Instant Grades</h3>
                    <p>Get a simple Class A to E grade. Know if it's safe in milliseconds.</p>
                </div>
                <div className="glass-panel" style={{ padding: '24px' }}>
                    <div style={{ fontSize: '24px', marginBottom: '16px' }}>🔍</div>
                    <h3>Smart Detection</h3>
                    <p>We flag the tricky stuff: Arbitration, Auto-renewal, and Liability waivers.</p>
                </div>
            </div>
        </div>
    );
}
