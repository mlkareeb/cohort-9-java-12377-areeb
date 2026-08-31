import React from 'react';

function ContactCard({ contact, onEdit, onDelete }) {
    if (!contact) return null;

    // Converts a labeled map (or legacy array format) into a list of { label, value } entries
    const toEntryList = (data, fallbackLabel) => {
        if (!data) return [];
        if (!Array.isArray(data) && typeof data === 'object') {
            return Object.entries(data)
                .filter(([, value]) => value)
                .map(([label, value]) => ({ label, value }));
        }
        if (Array.isArray(data) && data.length > 0) {
            return data
                .map(item => ({
                    label: fallbackLabel,
                    value: item?.address || item?.number || item
                }))
                .filter(entry => entry.value);
        }
        return [];
    };

    const emailEntries = toEntryList(contact.emails, 'Email');
    const phoneEntries = toEntryList(contact.phoneNumbers, 'Phone');

    return (
        <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', boxShadow: '0 1px 3px rgba(0,0,0,0.02)', boxSizing: 'border-box' }}>
            <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                    <div>
                        <h3 style={{ margin: '0 0 4px 0', fontSize: '16px', fontWeight: '700', color: '#0F172A' }}>
                            {contact.firstName || ''} {contact.lastName || ''}
                        </h3>
                        <p style={{ margin: '0', fontSize: '12px', fontWeight: '600', color: '#2563EB' }}>
                            {contact.title || 'No Title'}
                        </p>
                    </div>
                </div>

                <div style={{ fontSize: '13px', color: '#64748B', display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '16px' }}>
                    {emailEntries.length > 0 ? (
                        emailEntries.map((entry, idx) => (
                            <div key={`email-${idx}`}>📧 <span style={{ fontWeight: '600', color: '#475569' }}>{entry.label}:</span> {entry.value}</div>
                        ))
                    ) : (
                        <div>📧 No email</div>
                    )}
                    {phoneEntries.length > 0 ? (
                        phoneEntries.map((entry, idx) => (
                            <div key={`phone-${idx}`}>📞 <span style={{ fontWeight: '600', color: '#475569' }}>{entry.label}:</span> {entry.value}</div>
                        ))
                    ) : (
                        <div>📞 No phone</div>
                    )}
                </div>
            </div>

            <div style={{ display: 'flex', gap: '8px', borderTop: '1px solid #F1F5F9', paddingTop: '12px' }}>
                <button
                    onClick={() => onEdit(contact)}
                    style={{ flex: '1', padding: '6px', background: '#F8FAFC', border: '1px solid #CBD5E1', borderRadius: '6px', color: '#0F172A', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}
                >
                    Edit
                </button>
                <button
                    onClick={() => onDelete(contact)}
                    style={{ flex: '1', padding: '6px', background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: '6px', color: '#DC2626', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}
                >
                    Delete
                </button>
            </div>
        </div>
    );
}

export default ContactCard;