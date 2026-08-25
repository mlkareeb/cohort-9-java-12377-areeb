import React, { useState, useEffect } from 'react';
import UserProfile from './UserProfile';
import ContactCard from './ContactCard';
import { exportContactsToFile, importContactsFromFile } from './fileUtils';
import {
    fetchContactsApi,
    createContactApi,
    updateContactApi,
    deleteContactApi,
    changePasswordApi
} from '../services/api';

function Dashboard({ username, onLogout }) {
    const [activeTab, setActiveTab] = useState('contacts');
    const [viewMode, setViewMode] = useState('card');

    const [contacts, setContacts] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const contactsPerPage = 6;

    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showUpdateModal, setShowUpdateModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);
    const [selectedContact, setSelectedContact] = useState(null);

    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [title, setTitle] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');

    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');

    const [toastMessage, setToastMessage] = useState(null);

    const triggerToast = (msg) => {
        setToastMessage(msg);
        setTimeout(() => setToastMessage(null), 4000);
    };

    const loadContacts = async () => {
        try {
            const data = await fetchContactsApi();
            console.log("Fetched contacts response:", data);

            let listToSet = [];
            if (Array.isArray(data)) {
                listToSet = data;
            } else if (data && typeof data === 'object') {
                listToSet = data.content || data.contacts || data.data || Object.values(data).find(Array.isArray) || [];
            }

            setContacts(Array.isArray(listToSet) ? listToSet : []);
        } catch (error) {
            triggerToast('Failed to load contacts from database.');
            setContacts([]);
        }
    };

    useEffect(() => {
        loadContacts();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const safeContacts = Array.isArray(contacts) ? contacts : [];
    const filteredContacts = safeContacts.filter(c =>
        (c.firstName?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
        (c.lastName?.toLowerCase() || '').includes(searchQuery.toLowerCase())
    );

    const totalPages = Math.ceil(filteredContacts.length / contactsPerPage) || 1;

    useEffect(() => {
        if (currentPage > totalPages) {
            setCurrentPage(totalPages);
        }
    }, [totalPages, currentPage]);

    const indexOfLastContact = currentPage * contactsPerPage;
    const indexOfFirstContact = indexOfLastContact - contactsPerPage;
    const currentContacts = filteredContacts.slice(indexOfFirstContact, indexOfLastContact);

    const handleCreateContact = async (e) => {
        e.preventDefault();
        try {
            const newEntry = {
                firstName,
                lastName,
                title,
                emails: { Work: email },
                phoneNumbers: { Mobile: phone }
            };
            await createContactApi(newEntry);
            await loadContacts();
            setShowCreateModal(false);
            setFirstName(''); setLastName(''); setTitle(''); setEmail(''); setPhone('');
            triggerToast('Contact added successfully.');
        } catch (error) {
            triggerToast(`Error: ${error.message}`);
        }
    };

    const openUpdateModal = (contact) => {
        setSelectedContact(contact);
        setFirstName(contact.firstName);
        setLastName(contact.lastName);
        setTitle(contact.title);

        const emailVal = typeof contact.emails === 'object' && contact.emails !== null && !Array.isArray(contact.emails)
            ? (contact.emails['Work'] || Object.values(contact.emails)[0] || '')
            : (contact.emails?.[0]?.address || '');

        const phoneVal = typeof contact.phoneNumbers === 'object' && contact.phoneNumbers !== null && !Array.isArray(contact.phoneNumbers)
            ? (contact.phoneNumbers['Mobile'] || Object.values(contact.phoneNumbers)[0] || '')
            : (contact.phoneNumbers?.[0]?.number || '');

        setEmail(emailVal);
        setPhone(phoneVal);
        setShowUpdateModal(true);
    };

    const handleUpdateContact = async (e) => {
        e.preventDefault();
        try {
            const updatedData = {
                firstName,
                lastName,
                title,
                emails: { Work: email },
                phoneNumbers: { Mobile: phone }
            };
            await updateContactApi(selectedContact.id, updatedData);
            await loadContacts();
            setShowUpdateModal(false);
            triggerToast('Contact updated successfully.');
        } catch (error) {
            triggerToast(`Error: ${error.message}`);
        }
    };

    const handleDeleteConfirm = async () => {
        try {
            await deleteContactApi(selectedContact.id);
            setContacts(safeContacts.filter(c => c.id !== selectedContact.id));
            setShowDeleteModal(false);
            setSelectedContact(null);
            triggerToast('Contact removed.');
        } catch (error) {
            triggerToast('Error deleting contact.');
        }
    };

    const handlePasswordReset = async (e) => {
        e.preventDefault();
        try {
            await changePasswordApi({ currentPassword, newPassword });
            setShowChangePasswordModal(false);
            setCurrentPassword('');
            setNewPassword('');
            triggerToast('Password updated successfully.');
        } catch (error) {
            triggerToast(`Error: ${error.message}`);
        }
    };

    const handleExportContacts = () => {
        exportContactsToFile(safeContacts, triggerToast);
    };

    const handleImportContacts = async (e) => {
        importContactsFromFile(e, safeContacts, setContacts, loadContacts, triggerToast);
    };

    const displayName = username || 'User';

    return (
        <div style={{ minHeight: '100vh', background: '#F8FAFC', color: '#1E293B', fontFamily: 'Inter, system-ui, sans-serif', display: 'flex', boxSizing: 'border-box' }}>

            {/* Toast Notification */}
            {toastMessage && (
                <div style={{ position: 'fixed', top: '24px', right: '24px', zIndex: 2000, background: '#FFFFFF', border: '1px solid #E2E8F0', padding: '12px 20px', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.15)', fontSize: '14px', fontWeight: '500', color: '#0F172A', maxWidth: '400px', wordBreak: 'break-word' }}>
                    {toastMessage}
                </div>
            )}

            {/* Sidebar */}
            <div style={{ width: '260px', background: '#FFFFFF', borderRight: '1px solid #E2E8F0', padding: '28px 20px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', boxSizing: 'border-box' }}>
                <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '32px', paddingLeft: '8px' }}>
                        <h2 style={{ margin: '0', fontSize: '20px', fontWeight: '700', color: '#2563EB', letterSpacing: '-0.5px' }}>ContactHub</h2>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <button
                            onClick={() => setActiveTab('contacts')}
                            style={{ textAlign: 'left', padding: '10px 14px', borderRadius: '8px', border: 'none', background: activeTab === 'contacts' ? '#EFF6FF' : 'transparent', color: activeTab === 'contacts' ? '#2563EB' : '#64748B', fontWeight: '600', cursor: 'pointer', fontSize: '14px' }}
                        >
                            Contacts Directory
                        </button>
                        <button
                            onClick={() => setActiveTab('profile')}
                            style={{ textAlign: 'left', padding: '10px 14px', borderRadius: '8px', border: 'none', background: activeTab === 'profile' ? '#EFF6FF' : 'transparent', color: activeTab === 'profile' ? '#2563EB' : '#64748B', fontWeight: '600', cursor: 'pointer', fontSize: '14px' }}
                        >
                            User Profile
                        </button>
                    </div>
                </div>

                {/* User Profile Quick-Badge at Bottom */}
                <div style={{ background: '#F8FAFC', padding: '12px 16px', borderRadius: '10px', border: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ width: '32px', height: '32px', background: '#2563EB', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700', fontSize: '13px', color: '#FFFFFF' }}>
                            {displayName.substring(0, 2).toUpperCase()}
                        </div>
                        <div>
                            <p style={{ margin: '0', fontSize: '13px', fontWeight: '600', color: '#0F172A' }}>{displayName}</p>
                            <p style={{ margin: '0', fontSize: '11px', color: '#64748B' }}>Online</p>
                        </div>
                    </div>
                    <button onClick={onLogout} title="Sign Out" style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#EF4444', fontSize: '13px', fontWeight: '600' }}>Logout</button>
                </div>
            </div>

            {/* Main Content Area */}
            <div style={{ flex: '1', display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>

                {/* Top Header Command Bar */}
                <div style={{ height: '72px', background: '#FFFFFF', borderBottom: '1px solid #E2E8F0', padding: '0 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', boxSizing: 'border-box' }}>
                    <div style={{ position: 'relative', width: '340px' }}>
                        <input
                            type="text"
                            placeholder="Search contacts..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            style={{ width: '100%', padding: '9px 14px', borderRadius: '8px', background: '#F8FAFC', border: '1px solid #CBD5E1', color: '#0F172A', outline: 'none', fontSize: '13px', boxSizing: 'border-box' }}
                        />
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <button
                            onClick={() => setShowCreateModal(true)}
                            style={{ padding: '9px 18px', background: '#2563EB', color: '#FFFFFF', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: '600', cursor: 'pointer', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}
                        >
                            + Add Contact
                        </button>
                    </div>
                </div>

                {/* Dynamic Workspace Area */}
                <div style={{ flex: '1', padding: '32px', overflowY: 'auto', boxSizing: 'border-box' }}>

                    {activeTab === 'contacts' ? (
                        <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                                <div>
                                    <h1 style={{ margin: '0 0 4px 0', fontSize: '22px', fontWeight: '700', color: '#0F172A' }}>Contacts Directory</h1>
                                    <p style={{ margin: '0', color: '#64748B', fontSize: '13px' }}>Manage your professional and personal network.</p>
                                </div>

                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <button
                                        onClick={handleExportContacts}
                                        style={{ padding: '6px 12px', background: '#FFFFFF', border: '1px solid #CBD5E1', borderRadius: '6px', color: '#0F172A', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}
                                    >
                                        Download
                                    </button>

                                    <input
                                        type="file"
                                        id="import-file-input"
                                        accept=".txt"
                                        style={{ display: 'none' }}
                                        onChange={handleImportContacts}
                                    />

                                    <button
                                        onClick={() => document.getElementById('import-file-input').click()}
                                        style={{ padding: '6px 12px', background: '#FFFFFF', border: '1px solid #CBD5E1', borderRadius: '6px', color: '#0F172A', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}
                                    >
                                        Upload
                                    </button>

                                    <div style={{ display: 'flex', background: '#E2E8F0', padding: '3px', borderRadius: '8px', marginLeft: '8px' }}>
                                        <button
                                            onClick={() => setViewMode('card')}
                                            style={{ padding: '6px 14px', borderRadius: '6px', border: 'none', background: viewMode === 'card' ? '#FFFFFF' : 'transparent', color: viewMode === 'card' ? '#0F172A' : '#64748B', fontSize: '12px', fontWeight: '600', cursor: 'pointer', boxShadow: viewMode === 'card' ? '0 1px 2px rgba(0,0,0,0.05)' : 'none' }}
                                        >
                                            Cards
                                        </button>
                                        <button
                                            onClick={() => setViewMode('table')}
                                            style={{ padding: '6px 14px', borderRadius: '6px', border: 'none', background: viewMode === 'table' ? '#FFFFFF' : 'transparent', color: viewMode === 'table' ? '#0F172A' : '#64748B', fontSize: '12px', fontWeight: '600', cursor: 'pointer', boxShadow: viewMode === 'table' ? '0 1px 2px rgba(0,0,0,0.05)' : 'none' }}
                                        >
                                            Table
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {viewMode === 'card' ? (
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px', marginBottom: '28px' }}>
                                    {currentContacts.map(contact => (
                                        <ContactCard
                                            key={contact.id}
                                            contact={contact}
                                            onEdit={openUpdateModal}
                                            onDelete={(c) => { setSelectedContact(c); setShowDeleteModal(true); }}
                                        />
                                    ))}
                                </div>
                            ) : (
                                <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '12px', overflow: 'hidden', marginBottom: '28px', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
                                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
                                        <thead>
                                        <tr style={{ background: '#F8FAFC', borderBottom: '1px solid #E2E8F0', color: '#64748B' }}>
                                            <th style={{ padding: '14px 20px' }}>Full Name</th>
                                            <th style={{ padding: '14px 20px' }}>Title</th>
                                            <th style={{ padding: '14px 20px' }}>Email Address</th>
                                            <th style={{ padding: '14px 20px' }}>Phone</th>
                                            <th style={{ padding: '14px 20px', textAlign: 'right' }}>Actions</th>
                                        </tr>
                                        </thead>
                                        <tbody>
                                        {currentContacts.map(c => {
                                            const emailText = typeof c.emails === 'object' && c.emails !== null && !Array.isArray(c.emails) ? (c.emails['Work'] || Object.values(c.emails)[0]) : c.emails?.[0]?.address;
                                            const phoneText = typeof c.phoneNumbers === 'object' && c.phoneNumbers !== null && !Array.isArray(c.phoneNumbers) ? (c.phoneNumbers['Mobile'] || Object.values(c.phoneNumbers)[0]) : c.phoneNumbers?.[0]?.number;
                                            return (
                                                <tr key={c.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                                                    <td style={{ padding: '14px 20px', fontWeight: '600', color: '#0F172A' }}>{c.firstName} {c.lastName}</td>
                                                    <td style={{ padding: '14px 20px', color: '#64748B' }}>{c.title}</td>
                                                    <td style={{ padding: '14px 20px', color: '#64748B' }}>{emailText}</td>
                                                    <td style={{ padding: '14px 20px', color: '#64748B' }}>{phoneText}</td>
                                                    <td style={{ padding: '14px 20px', textAlign: 'right' }}>
                                                        <button onClick={() => openUpdateModal(c)} style={{ background: 'transparent', border: 'none', color: '#2563EB', cursor: 'pointer', marginRight: '12px', fontWeight: '600' }}>Edit</button>
                                                        <button onClick={() => { setSelectedContact(c); setShowDeleteModal(true); }} style={{ background: 'transparent', border: 'none', color: '#DC2626', cursor: 'pointer', fontWeight: '600' }}>Delete</button>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                        </tbody>
                                    </table>
                                </div>
                            )}

                            {/* Pagination Bar */}
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#FFFFFF', border: '1px solid #E2E8F0', padding: '12px 20px', borderRadius: '10px', boxShadow: '0 1px 2px rgba(0,0,0,0.02)' }}>
                                <span style={{ fontSize: '13px', color: '#64748B' }}>
                                    Page {currentPage} of {totalPages}
                                </span>
                                <div style={{ display: 'flex', gap: '8px' }}>
                                    <button
                                        disabled={currentPage === 1}
                                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                        style={{ padding: '6px 14px', background: '#F8FAFC', color: currentPage === 1 ? '#94A3B8' : '#0F172A', border: '1px solid #CBD5E1', borderRadius: '6px', cursor: currentPage === 1 ? 'not-allowed' : 'pointer', fontSize: '12px', fontWeight: '500' }}
                                    >
                                        Previous
                                    </button>
                                    <button
                                        disabled={currentPage === totalPages}
                                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                        style={{ padding: '6px 14px', background: '#F8FAFC', color: currentPage === totalPages ? '#94A3B8' : '#0F172A', border: '1px solid #CBD5E1', borderRadius: '6px', cursor: currentPage === totalPages ? 'not-allowed' : 'pointer', fontSize: '12px', fontWeight: '500' }}
                                    >
                                        Next
                                    </button>
                                </div>
                            </div>

                        </div>
                    ) : (
                        <UserProfile
                            username={displayName}
                            contactsCount={safeContacts.length}
                            onOpenChangePassword={() => setShowChangePasswordModal(true)}
                        />
                    )}
                </div>
            </div>

            {/* Create / Update Modal */}
            {(showCreateModal || showUpdateModal) && (
                <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(15, 23, 42, 0.4)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
                    <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', padding: '32px', borderRadius: '12px', width: '100%', maxWidth: '400px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)', boxSizing: 'border-box' }}>
                        <h3 style={{ margin: '0 0 20px 0', fontSize: '18px', color: '#0F172A', fontWeight: '700' }}>{showCreateModal ? 'Create Contact' : 'Edit Contact'}</h3>
                        <form onSubmit={showCreateModal ? handleCreateContact : handleUpdateContact}>
                            <div style={{ marginBottom: '12px' }}><label style={{ fontSize: '12px', fontWeight: '500', color: '#64748B' }}>First Name</label><input type="text" value={firstName} onChange={e => setFirstName(e.target.value)} required style={{ width: '100%', padding: '9px 12px', borderRadius: '6px', background: '#F8FAFC', border: '1px solid #CBD5E1', color: '#0F172A', boxSizing: 'border-box', marginTop: '4px' }} /></div>
                            <div style={{ marginBottom: '12px' }}><label style={{ fontSize: '12px', fontWeight: '500', color: '#64748B' }}>Last Name</label><input type="text" value={lastName} onChange={e => setLastName(e.target.value)} required style={{ width: '100%', padding: '9px 12px', borderRadius: '6px', background: '#F8FAFC', border: '1px solid #CBD5E1', color: '#0F172A', boxSizing: 'border-box', marginTop: '4px' }} /></div>
                            <div style={{ marginBottom: '12px' }}><label style={{ fontSize: '12px', fontWeight: '500', color: '#64748B' }}>Title / Role</label><input type="text" value={title} onChange={e => setTitle(e.target.value)} required style={{ width: '100%', padding: '9px 12px', borderRadius: '6px', background: '#F8FAFC', border: '1px solid #CBD5E1', color: '#0F172A', boxSizing: 'border-box', marginTop: '4px' }} /></div>
                            <div style={{ marginBottom: '12px' }}><label style={{ fontSize: '12px', fontWeight: '500', color: '#64748B' }}>Email</label><input type="email" value={email} onChange={e => setEmail(e.target.value)} required style={{ width: '100%', padding: '9px 12px', borderRadius: '6px', background: '#F8FAFC', border: '1px solid #CBD5E1', color: '#0F172A', boxSizing: 'border-box', marginTop: '4px' }} /></div>
                            <div style={{ marginBottom: '24px' }}><label style={{ fontSize: '12px', fontWeight: '500', color: '#64748B' }}>Phone Number</label><input type="text" value={phone} onChange={e => setPhone(e.target.value)} required style={{ width: '100%', padding: '9px 12px', borderRadius: '6px', background: '#F8FAFC', border: '1px solid #CBD5E1', color: '#0F172A', boxSizing: 'border-box', marginTop: '4px' }} /></div>

                            <div style={{ display: 'flex', gap: '10px' }}>
                                <button type="submit" style={{ flex: '1', padding: '10px', background: '#2563EB', color: '#FFFFFF', border: 'none', borderRadius: '8px', fontWeight: '600', cursor: 'pointer' }}>Save Contact</button>
                                <button type="button" onClick={() => { setShowCreateModal(false); setShowUpdateModal(false); }} style={{ flex: '1', padding: '10px', background: '#F1F5F9', color: '#0F172A', border: '1px solid #CBD5E1', borderRadius: '8px', fontWeight: '600', cursor: 'pointer' }}>Cancel</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Change Password Modal */}
            {showChangePasswordModal && (
                <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(15, 23, 42, 0.4)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
                    <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', padding: '32px', borderRadius: '12px', width: '100%', maxWidth: '400px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)', boxSizing: 'border-box' }}>
                        <h3 style={{ margin: '0 0 20px 0', fontSize: '18px', color: '#0F172A', fontWeight: '700' }}>Change Password</h3>
                        <form onSubmit={handlePasswordReset}>
                            <div style={{ marginBottom: '12px' }}>
                                <label style={{ fontSize: '12px', fontWeight: '500', color: '#64748B' }}>Current Password</label>
                                <input type="password" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} required style={{ width: '100%', padding: '9px 12px', borderRadius: '6px', background: '#F8FAFC', border: '1px solid #CBD5E1', color: '#0F172A', boxSizing: 'border-box', marginTop: '4px' }} />
                            </div>
                            <div style={{ marginBottom: '24px' }}>
                                <label style={{ fontSize: '12px', fontWeight: '500', color: '#64748B' }}>New Password</label>
                                <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} required style={{ width: '100%', padding: '9px 12px', borderRadius: '6px', background: '#F8FAFC', border: '1px solid #CBD5E1', color: '#0F172A', boxSizing: 'border-box', marginTop: '4px' }} />
                            </div>

                            <div style={{ display: 'flex', gap: '10px' }}>
                                <button type="submit" style={{ flex: '1', padding: '10px', background: '#2563EB', color: '#FFFFFF', border: 'none', borderRadius: '8px', fontWeight: '600', cursor: 'pointer' }}>Reset</button>
                                <button type="button" onClick={() => { setShowChangePasswordModal(false); setCurrentPassword(''); setNewPassword(''); }} style={{ flex: '1', padding: '10px', background: '#F1F5F9', color: '#0F172A', border: '1px solid #CBD5E1', borderRadius: '8px', fontWeight: '600', cursor: 'pointer' }}>Cancel</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {showDeleteModal && (
                <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(15, 23, 42, 0.4)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
                    <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', padding: '32px', borderRadius: '12px', width: '100%', maxWidth: '360px', textAlign: 'center', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)', boxSizing: 'border-box' }}>
                        <h3 style={{ margin: '0 0 8px 0', fontSize: '18px', color: '#0F172A', fontWeight: '700' }}>Confirm Deletion</h3>
                        <p style={{ color: '#64748B', fontSize: '13px', marginBottom: '24px' }}>Are you sure you want to delete {selectedContact?.firstName}? This action cannot be undone.</p>

                        <div style={{ display: 'flex', gap: '10px' }}>
                            <button onClick={handleDeleteConfirm} style={{ flex: '1', padding: '10px', background: '#DC2626', color: '#FFFFFF', border: 'none', borderRadius: '8px', fontWeight: '600', cursor: 'pointer' }}>Delete</button>
                            <button onClick={() => setShowDeleteModal(false)} style={{ flex: '1', padding: '10px', background: '#F1F5F9', color: '#0F172A', border: '1px solid #CBD5E1', borderRadius: '8px', fontWeight: '600', cursor: 'pointer' }}>Cancel</button>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
}

export default Dashboard;