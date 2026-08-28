import React, { useState } from 'react';
import { registerApi } from '../services/api';

function Register({ onRegisterSuccess }) {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!email.trim() && !phoneNumber.trim()) {
            setError('Please provide either an email address or a phone number.');
            return;
        }

        setLoading(true);

        try {
            const data = await registerApi({
                username,
                email: email.trim() || undefined,
                phoneNumber: phoneNumber.trim() || undefined,
                password
            });

            if (!data || !data.token) {
                throw new Error('Registration response missing authentication token.');
            }

            localStorage.setItem('token', data.token);
            setLoading(false);
            onRegisterSuccess(data.username || username);
        } catch (err) {
            setLoading(false);
            setError(err.message || 'Registration failed. Please try again.');
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
                    <p style={{ color: '#666', fontSize: '14px', margin: '0' }}>Create your account to get started</p>
                </div>

                {error && (
                    <div style={{ marginBottom: '16px', padding: '10px', background: '#FEE2E2', border: '1px solid #F87171', color: '#B91C1C', borderRadius: '6px', fontSize: '13px', textAlign: 'center' }}>
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div style={{ marginBottom: '16px' }}>
                        <label style={{ display: 'block', marginBottom: '6px', color: '#555', fontSize: '14px', fontWeight: '500' }}>Username</label>
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                            placeholder="Enter your username"
                            style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', border: '1px solid #ccc', outline: 'none', fontSize: '14px', boxSizing: 'border-box' }}
                        />
                    </div>
                    <div style={{ marginBottom: '16px' }}>
                        <label style={{ display: 'block', marginBottom: '6px', color: '#555', fontSize: '14px', fontWeight: '500' }}>Email Address (or provide phone below)</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="name@example.com"
                            style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', border: '1px solid #ccc', outline: 'none', fontSize: '14px', boxSizing: 'border-box' }}
                        />
                    </div>
                    <div style={{ marginBottom: '16px' }}>
                        <label style={{ display: 'block', marginBottom: '6px', color: '#555', fontSize: '14px', fontWeight: '500' }}>Phone Number (10-15 digits, or provide email above)</label>
                        <input
                            type="text"
                            value={phoneNumber}
                            onChange={(e) => setPhoneNumber(e.target.value)}
                            placeholder="e.g. 03001234567"
                            style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', border: '1px solid #ccc', outline: 'none', fontSize: '14px', boxSizing: 'border-box' }}
                        />
                    </div>
                    <div style={{ marginBottom: '20px' }}>
                        <label style={{ display: 'block', marginBottom: '6px', color: '#555', fontSize: '14px', fontWeight: '500' }}>Password (min 6 chars)</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            minLength={6}
                            placeholder="Create a password"
                            style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', border: '1px solid #ccc', outline: 'none', fontSize: '14px', boxSizing: 'border-box' }}
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={loading}
                        style={{ width: '100%', padding: '12px', background: loading ? '#93C5FD' : '#2563eb', color: 'white', border: 'none', borderRadius: '6px', fontSize: '16px', fontWeight: '600', cursor: loading ? 'not-allowed' : 'pointer' }}
                    >
                        {loading ? 'Signing Up...' : 'Sign Up'}
                    </button>
                </form>
            </div>
        </div>
    );
}

export default Register;