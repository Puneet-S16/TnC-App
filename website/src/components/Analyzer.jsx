import React, { useState, useEffect } from 'react';
import { analyzeText } from '../logic/rules';

export default function Analyzer({ onBack }) {
    const [text, setText] = useState('');
    const [result, setResult] = useState(null);
    const [history, setHistory] = useState([]);

    useEffect(() => {
        const saved = localStorage.getItem('scan_history');
        if (saved) {
            setHistory(JSON.parse(saved));
        }
    }, []);

    const handleAnalyze = () => {
        if (!text.trim()) return;
        const res = analyzeText(text);
        setResult(res);

        // Save to history
        const newItem = {
            id: Date.now(),
            preview: text.substring(0, 40) + '...',
            grade: res.grade,
            date: new Date().toLocaleDateString()
        };
        const newHistory = [newItem, ...history].slice(0, 10); // Keep last 10
        setHistory(newHistory);
        localStorage.setItem('scan_history', JSON.stringify(newHistory));
    };

    const getBadges = (grade) => {
        const colors = {
            'A': 'bg-green-100 text-green-800', // simplified classes, using inline styles for directness
            'E': '#DC2626'
        };
        // ... using css classes mapped in index.css
        return `grade-${grade}`;
    };

    return (
        <div className="container" style={{ padding: '40px 20px', display: 'grid', gridTemplateColumns: '1fr 300px', gap: '40px' }}>

            {/* Main Analysis Area */}
            <div>
                <button onClick={onBack} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6B7280', marginBottom: '16px' }}>
                    ← Back to Home
                </button>

                <div className="glass-panel" style={{ padding: '32px' }}>
                    <h2 style={{ marginTop: 0 }}>Analyze Agreement</h2>
                    <textarea
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        placeholder="Paste Terms & Conditions, Privacy Policy, or Contract text here..."
                        style={{
                            width: '100%',
                            height: '200px',
                            padding: '16px',
                            borderRadius: '8px',
                            border: '1px solid #E5E7EB',
                            fontFamily: 'Inter, sans-serif',
                            fontSize: '14px',
                            resize: 'vertical',
                            marginBottom: '20px',
                            boxSizing: 'border-box'
                        }}
                    />

                    <button onClick={handleAnalyze} className="btn-primary" style={{ width: '100%' }}>
                        Scan Document
                    </button>
                </div>

                {/* RESULTS */}
                {result && (
                    <div className="glass-panel" style={{ marginTop: '32px', padding: '32px', animation: 'fadeIn 0.5s' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
                            <div>
                                <span style={{ fontSize: '14px', textTransform: 'uppercase', fontWeight: '600', color: '#6B7280' }}>Privacy Grade</span>
                                <div style={{ fontSize: '4rem', fontWeight: '800', lineHeight: 1, color: `var(--grade-${result.grade.toLowerCase()})` }}>
                                    Class {result.grade}
                                </div>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                                <div style={{ fontSize: '1.2rem', fontWeight: '600' }}>
                                    {result.grade === 'A' ? 'Good / Safe' :
                                        result.grade === 'B' ? 'Fair / Use Caution' :
                                            result.grade === 'C' ? 'Use Caution' :
                                                result.grade === 'D' ? 'Warning' :
                                                    'High Risk'}
                                </div>
                                <span style={{ color: '#6B7280' }}>
                                    Found {result.flags.length} potential issues
                                </span>
                            </div>
                        </div>

                        <hr style={{ border: 'none', borderTop: '1px solid #E5E7EB', margin: '24px 0' }} />

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            {result.flags.length === 0 && (
                                <div style={{ padding: '20px', background: '#ECFDF5', borderRadius: '8px', color: '#047857', fontWeight: '600', textAlign: 'center' }}>
                                    ✅ No common red flags detected.
                                </div>
                            )}
                            {result.flags.map((flag, idx) => (
                                <div key={idx} style={{
                                    padding: '16px',
                                    borderRadius: '8px',
                                    background: flag.severity === 'HIGH' ? '#FEF2F2' : '#FFFBEB',
                                    borderLeft: `4px solid ${flag.severity === 'HIGH' ? '#DC2626' : '#F59E0B'}`,
                                    display: 'flex',
                                    gap: '12px'
                                }}>
                                    <div style={{ fontSize: '20px' }}>{flag.severity === 'HIGH' ? '👎' : '⚠️'}</div>
                                    <div>
                                        <div style={{ fontWeight: '600', color: '#111827' }}>{flag.name}</div>
                                        <div style={{ fontSize: '14px', color: '#4B5563', marginTop: '4px' }}>{flag.description}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Sidebar History */}
            <div>
                <div className="glass-panel" style={{ padding: '24px', height: 'fit-content' }}>
                    <h3 style={{ fontSize: '1.2rem', marginTop: 0 }}>Recent Scans</h3>
                    {history.length === 0 && <p style={{ fontSize: '14px' }}>No history yet.</p>}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '16px' }}>
                        {history.map((item) => (
                            <div key={item.id} style={{ padding: '12px', background: 'white', borderRadius: '8px', border: '1px solid #F3F4F6' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                                    <span style={{ fontWeight: '600', color: `var(--grade-${item.grade.toLowerCase()})` }}>Class {item.grade}</span>
                                    <span style={{ fontSize: '12px', color: '#9CA3AF' }}>{item.date}</span>
                                </div>
                                <div style={{ fontSize: '12px', color: '#6B7280', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                    {item.preview}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

        </div>
    );
}
