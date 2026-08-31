import React from 'react';

function UserProfile({ profile, username = 'User', contactsCount = 0, onOpenChangePassword }) {
    const displayUser = profile?.username || username || 'User';
    const initial = displayUser.charAt(0).toUpperCase();
    const email = profile?.email || 'Not provided';
    const phoneNumber = profile?.phoneNumber || 'Not provided';

    return (
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
            <div style={{ marginBottom: '24px' }}>
                <h1 style={{ margin: '0 0 4px 0', fontSize: '22px', fontWeight: '700', color: '#0F172A' }}>User Profile</h1>
                <p style={{ margin: '0', color: '#64748B', fontSize: '13px' }}>View your account details and security settings.</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '24px' }}>

                <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '32px 24px', textAlign: 'center', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
                    <div style={{ width: '72px', height: '72px', background: '#EFF6FF', color: '#2563EB', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px', fontWeight: '700', margin: '0 auto 16px auto' }}>
                        {initial}
                    </div>
                    <h2 style={{ margin: '0 0 4px 0', fontSize: '18px', color: '#0F172A', fontWeight: '700' }}>{displayUser}</h2>
                    <p style={{ margin: '0 0 24px 0', fontSize: '13px', color: '#64748B' }}>Standard User</p>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', borderTop: '1px solid #F1F5F9', paddingTop: '20px' }}>
                        <div>
                            <p style={{ margin: '0 0 2px 0', fontSize: '18px', fontWeight: '700', color: '#2563EB' }}>{contactsCount}</p>
                            <p style={{ margin: '0', fontSize: '11px', color: '#64748B', fontWeight: '500' }}>Contacts</p>
                        </div>
                        <div>
                            <p style={{ margin: '0 0 2px 0', fontSize: '18px', fontWeight: '700', color: '#0F172A' }}>{profile?.id ?? '-'}</p>
                            <p style={{ margin: '0', fontSize: '11px', color: '#64748B', fontWeight: '500' }}>Account ID</p>
                        </div>
                    </div>
                </div>

                <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '32px', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
                    <h3 style={{ margin: '0 0 20px 0', fontSize: '16px', fontWeight: '700', color: '#0F172A' }}>Account Information</h3>

                    <div style={{ marginBottom: '20px' }}>
                        <label style={{ display: 'block', fontSize: '12px', fontWeight: '500', color: '#64748B', marginBottom: '6px' }}>Username</label>
                        <input
                            type="text"
                            readOnly
                            value={displayUser}
                            style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', background: '#F8FAFC', border: '1px solid #CBD5E1', color: '#0F172A', fontSize: '13px', boxSizing: 'border-box', outline: 'none' }}
                        />
                    </div>

                    <div style={{ marginBottom: '20px' }}>
                        <label style={{ display: 'block', fontSize: '12px', fontWeight: '500', color: '#64748B', marginBottom: '6px' }}>Email Address</label>
                        <input
                            type="text"
                            readOnly
                            value={email}
                            style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', background: '#F8FAFC', border: '1px solid #CBD5E1', color: '#0F172A', fontSize: '13px', boxSizing: 'border-box', outline: 'none' }}
                        />
                    </div>

                    <div style={{ marginBottom: '24px' }}>
                        <label style={{ display: 'block', fontSize: '12px', fontWeight: '500', color: '#64748B', marginBottom: '6px' }}>Phone Number</label>
                        <input
                            type="text"
                            readOnly
                            value={phoneNumber}
                            style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', background: '#F8FAFC', border: '1px solid #CBD5E1', color: '#0F172A', fontSize: '13px', boxSizing: 'border-box', outline: 'none' }}
                        />
                    </div>

                    <button
                        onClick={onOpenChangePassword}
                        style={{ padding: '10px 18px', background: '#FFFFFF', color: '#0F172A', border: '1px solid #CBD5E1', borderRadius: '8px', fontSize: '13px', fontWeight: '600', cursor: 'pointer', boxShadow: '0 1px 2px rgba(0,0,0,0.02)' }}
                    >
                        Change Password
                    </button>
                </div>

            </div>
        </div>
    );
}

export default UserProfile;