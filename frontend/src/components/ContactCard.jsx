import React from 'react';

function ContactCard({ contact, onEdit, onDelete }) {
    if (!contact) return null;

    // Safely extract email regardless of format (Map or Array or undefined)
    let emailStr = 'No email';
    if (contact.emails) {
        if (!Array.isArray(contact.emails) && typeof contact.emails === 'object') {
            emailStr = contact.emails['Work'] || Object.values(contact.emails)[0] || 'No email';
        } else if (Array.isArray(contact.emails) && contact.emails.length > 0) {
            emailStr = contact.emails[0]?.address || contact.emails[0] || 'No email';
        }
    }

    // Safely extract phone number regardless of format (Map or Array or undefined)
    let phoneStr = 'No phone';
    if (contact.phoneNumbers) {
        if (!Array.isArray(contact.phoneNumbers) && typeof contact.phoneNumbers === 'object') {
            phoneStr = contact.phoneNumbers['Mobile'] || Object.values(contact.phoneNumbers)[0] || 'No phone';
        } else if (Array.isArray(contact.phoneNumbers) && contact.phoneNumbers.length > 0) {
            phoneStr = contact.phoneNumbers[0]?.number || contact.phoneNumbers[0] || 'No phone';
        }
    }

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
                    <div>📧 {emailStr}</div>
                    <div>📞 {phoneStr}</div>
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