import React from 'react';
import { motion } from 'framer-motion';

export default function Hero({ onStart }) {
    return (
        <div className="container" style={{ textAlign: 'center', padding: '100px 20px', position: 'relative', zIndex: 10 }}>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                style={{ marginBottom: '20px', display: 'inline-block', padding: '6px 16px', background: 'rgba(255, 255, 255, 0.1)', backdropFilter: 'blur(10px)', borderRadius: '20px', fontSize: '14px', fontWeight: '500', color: '#E0E7FF', border: '1px solid rgba(255, 255, 255, 0.2)' }}
            >
                ✨ Identify hidden risks in seconds
            </motion.div>

            <motion.h1
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2, duration: 0.8 }}
                style={{ maxWidth: '900px', margin: '0 auto 24px auto', background: 'linear-gradient(to right, #ffffff, #a5b4fc)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', fontSize: '3.5rem', textShadow: '0 0 40px rgba(79, 70, 229, 0.4)' }}
            >
                Don't Agree to What You Don't Understand.
            </motion.h1>

            <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4, duration: 0.8 }}
                style={{ fontSize: '1.25rem', maxWidth: '600px', margin: '0 auto 40px auto', color: '#9CA3AF' }}
            >
                Scan Terms & Conditions instantly. Detect "No Refund" clauses, hidden fees, and data selling schemes before you click accept.
            </motion.p>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6, duration: 0.8 }}
                style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}
            >
                <button onClick={onStart} className="btn-primary" style={{ fontSize: '1.1rem', padding: '16px 32px' }}>
                    Analyze Text Now
                </button>
                <button className="btn-secondary" style={{ fontSize: '1.1rem', padding: '16px 32px' }} onClick={() => window.location.href = './extension.zip'}>
                    Get Chrome Extension
                </button>
            </motion.div>

            <div style={{ marginTop: '80px', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px', textAlign: 'left' }}>
                {[
                    { icon: '🛡️', title: 'Privacy First', desc: 'Everything runs 100% locally in your browser. We never see your data.' },
                    { icon: '⚡', title: 'Instant Grades', desc: "Get a simple Class A to E grade. Know if it's safe in milliseconds." },
                    { icon: '🔍', title: 'Smart Detection', desc: 'We flag the tricky stuff: Arbitration, Auto-renewal, and Liability waivers.' }
                ].map((item, index) => (
                    <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.2 * index + 0.8 }}
                        className="glass-panel"
                        style={{ padding: '24px', background: 'rgba(30, 41, 59, 0.4)' }}
                    >
                        <div style={{ fontSize: '24px', marginBottom: '16px' }}>{item.icon}</div>
                        <h3 style={{ color: 'white', marginBottom: '8px' }}>{item.title}</h3>
                        <p style={{ color: '#94A3B8' }}>{item.desc}</p>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}
