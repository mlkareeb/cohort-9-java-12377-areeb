import React, { useState } from 'react';
import { loginApi } from '../services/api';

function Login({ onLoginSuccess }) {
    const [identifier, setIdentifier] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const data = await loginApi(identifier, password);

            if (!data || !data.token) {
                throw new Error('Authentication token missing from response.');
            }

            localStorage.setItem('token', data.token);
            setLoading(false);
            onLoginSuccess(data.username || identifier);
        } catch (err) {
            setLoading(false);
            const msg = err.message || '';
            setError(msg.toLowerCase().includes('bad credentials') ? 'Invalid credentials' : (msg || 'Failed to connect to the server.'));
        }
    };

    return (
        <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '70vh'
        }}>
            <div style={{
                background: '#ffffff',
                padding: '30px',
                borderRadius: '12px',
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
                width: '100%',
                maxWidth: '380px'
            }}>
                <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                    <h1 style={{ color: '#2563eb', fontSize: '28px', margin: '0 0 8px 0', fontWeight: '700' }}>ContactHub</h1>
                    <p style={{ color: '#666', fontSize: '14px', margin: '0' }}>Sign in to manage your contacts</p>
                </div>

                {error && (
                    <div style={{ marginBottom: '16px', padding: '10px', background: '#FEE2E2', border: '1px solid #F87171', color: '#B91C1C', borderRadius: '6px', fontSize: '13px', textAlign: 'center' }}>
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div style={{ marginBottom: '16px' }}>
                        <label style={{ display: 'block', marginBottom: '6px', color: '#555', fontSize: '14px', fontWeight: '500' }}>Username, Email, or Phone</label>
                        <input
                            type="text"
                            value={identifier}
                            onChange={(e) => setIdentifier(e.target.value)}
                            required
                            placeholder="Enter your username, email, or phone"
                            style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', border: '1px solid #ccc', outline: 'none', fontSize: '14px', boxSizing: 'border-box' }}
                        />
                    </div>
                    <div style={{ marginBottom: '20px' }}>
                        <label style={{ display: 'block', marginBottom: '6px', color: '#555', fontSize: '14px', fontWeight: '500' }}>Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            placeholder="Enter your password"
                            style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', border: '1px solid #ccc', outline: 'none', fontSize: '14px', boxSizing: 'border-box' }}
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={loading}
                        style={{ width: '100%', padding: '12px', background: loading ? '#93C5FD' : '#2563eb', color: 'white', border: 'none', borderRadius: '6px', fontSize: '16px', fontWeight: '600', cursor: loading ? 'not-allowed' : 'pointer' }}
                    >
                        {loading ? 'Signing In...' : 'Sign In'}
                    </button>
                </form>
            </div>
        </div>
    );
}

export default Login;