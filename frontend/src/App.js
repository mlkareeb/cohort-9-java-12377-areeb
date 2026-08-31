import React, { useState } from 'react';
import Login from './components/Login';
import Register from './components/Register';
import Dashboard from './components/Dashboard';

function App() {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [isLogin, setIsLogin] = useState(true);
    const [username, setUsername] = useState('');

    const handleLoginSuccess = (loggedUser) => {
        setUsername(loggedUser || 'User');
        setIsLoggedIn(true);
    };

    // Registration now logs the user straight in and redirects to the
    // dashboard, matching "redirect to contact management screen upon
    // successful login OR registration" from the spec.
    const handleRegisterSuccess = (registeredUser) => {
        setUsername(registeredUser || 'User');
        setIsLoggedIn(true);
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        setUsername('');
        setIsLoggedIn(false);
    };

    if (isLoggedIn) {
        return <Dashboard username={username} onLogout={handleLogout} />;
    }

    return (
        <div style={{ fontFamily: 'Inter, system-ui, sans-serif', background: '#f8fafc', minHeight: '100vh', padding: '40px 20px', boxSizing: 'border-box' }}>
            <div style={{ textAlign: 'center', marginBottom: '10px' }}>
                <div style={{ display: 'inline-flex', background: '#e2e8f0', padding: '4px', borderRadius: '8px' }}>
                    <button
                        onClick={() => setIsLogin(true)}
                        aria-label="Switch to Sign In"
                        style={{
                            padding: '8px 24px',
                            borderRadius: '6px',
                            border: 'none',
                            fontWeight: '600',
                            fontSize: '14px',
                            cursor: 'pointer',
                            background: isLogin ? '#ffffff' : 'transparent',
                            color: isLogin ? '#2563eb' : '#64748b',
                            boxShadow: isLogin ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                            transition: 'all 0.2s'
                        }}
                    >
                        Sign In
                    </button>
                    <button
                        onClick={() => setIsLogin(false)}
                        aria-label="Switch to Sign Up"
                        style={{
                            padding: '8px 24px',
                            borderRadius: '6px',
                            border: 'none',
                            fontWeight: '600',
                            fontSize: '14px',
                            cursor: 'pointer',
                            background: !isLogin ? '#ffffff' : 'transparent',
                            color: !isLogin ? '#2563eb' : '#64748b',
                            boxShadow: !isLogin ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                            transition: 'all 0.2s'
                        }}
                    >
                        Sign Up
                    </button>
                </div>
            </div>

            {isLogin ? (
                <Login onLoginSuccess={handleLoginSuccess} />
            ) : (
                <Register onRegisterSuccess={handleRegisterSuccess} />
            )}
        </div>
    );
}

export default App;