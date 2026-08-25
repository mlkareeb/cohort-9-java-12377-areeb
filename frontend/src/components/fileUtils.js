import { createContactApi } from '../services/api';

// --- Export Contacts to TXT File ---
export const exportContactsToFile = (contacts, triggerToast) => {
    try {
        if (!contacts || contacts.length === 0) {
            triggerToast('No contacts to export.');
            return;
        }

        const fileContent = contacts.map(c => {
            // Safely extract email from Map or fallback if array
            let emailStr = 'N/A';
            if (c.emails) {
                if (!Array.isArray(c.emails) && typeof c.emails === 'object') {
                    emailStr = c.emails['Work'] || Object.values(c.emails)[0] || 'N/A';
                } else if (Array.isArray(c.emails) && c.emails.length > 0) {
                    emailStr = c.emails[0]?.address || c.emails[0] || 'N/A';
                }
            }

            // Safely extract phone number from Map or fallback if array
            let phoneStr = 'N/A';
            if (c.phoneNumbers) {
                if (!Array.isArray(c.phoneNumbers) && typeof c.phoneNumbers === 'object') {
                    phoneStr = c.phoneNumbers['Mobile'] || Object.values(c.phoneNumbers)[0] || 'N/A';
                } else if (Array.isArray(c.phoneNumbers) && c.phoneNumbers.length > 0) {
                    phoneStr = c.phoneNumbers[0]?.number || c.phoneNumbers[0] || 'N/A';
                }
            } else if (c.phones) {
                if (!Array.isArray(c.phones) && typeof c.phones === 'object') {
                    phoneStr = c.phones['Mobile'] || Object.values(c.phones)[0] || 'N/A';
                } else if (Array.isArray(c.phones) && c.phones.length > 0) {
                    phoneStr = c.phones[0]?.number || c.phones[0] || 'N/A';
                }
            }

            return `Name: ${c.firstName || ''} ${c.lastName || ''} | Title: ${c.title || ''} | Email: ${emailStr} | Phone: ${phoneStr}`;
        }).join('\n');

        const blob = new Blob([fileContent], { type: 'text/plain;charset=utf-8;' });
        const downloadAnchor = document.createElement('a');
        downloadAnchor.href = URL.createObjectURL(blob);
        downloadAnchor.setAttribute("download", "contacts_export.txt");
        document.body.appendChild(downloadAnchor);
        downloadAnchor.click();
        downloadAnchor.remove();
        triggerToast('Contacts downloaded successfully.');
    } catch (error) {
        triggerToast('Failed to export contacts.');
    }
};

// --- Import Contacts from TXT File (Fixed Duplicate Prevention & Database Sync) ---
export const importContactsFromFile = (e, currentContacts, setContacts, reloadContacts, triggerToast) => {
    const fileReader = new FileReader();
    if (e.target.files && e.target.files[0]) {
        fileReader.onerror = () => {
            triggerToast('Error reading uploaded text file.');
        };

        fileReader.readAsText(e.target.files[0], "UTF-8");
        fileReader.onload = async (event) => {
            try {
                const textData = event.target.result;
                const lines = textData.split('\n');
                const parsedContacts = [];

                lines.forEach((line) => {
                    if (line.trim() !== '') {
                        const parts = line.split('|');
                        if (parts.length >= 4) {
                            const namePart = parts[0].replace('Name:', '').trim().split(' ');
                            const titlePart = parts[1].replace('Title:', '').trim();
                            const emailPart = parts[2].replace('Email:', '').trim();
                            const phonePart = parts[3].replace('Phone:', '').trim();

                            parsedContacts.push({
                                firstName: namePart[0] || 'Unknown',
                                lastName: namePart.slice(1).join(' ') || '',
                                title: titlePart,
                                emails: { Work: emailPart },
                                phoneNumbers: { Mobile: phonePart }
                            });
                        }
                    }
                });

                if (parsedContacts.length > 0) {
                    // Extract existing emails from current database contacts cleanly
                    const existingEmails = new Set(
                        currentContacts.map(c => {
                            if (!c.emails) return '';
                            if (!Array.isArray(c.emails) && typeof c.emails === 'object') {
                                return (c.emails['Work'] || Object.values(c.emails)[0] || '').toLowerCase().trim();
                            }
                            return (c.emails[0]?.address || c.emails[0] || '').toLowerCase().trim();
                        })
                    );

                    const uniqueNewContacts = parsedContacts.filter(c => {
                        const email = (c.emails['Work'] || '').toLowerCase().trim();
                        if (!email) return false;

                        if (existingEmails.has(email)) {
                            return false;
                        }

                        existingEmails.add(email);
                        return true;
                    });

                    if (uniqueNewContacts.length === 0) {
                        triggerToast('No new contacts found (all were duplicates).');
                        return;
                    }

                    // Save each unique imported contact to the backend database
                    let successCount = 0;
                    for (const contactData of uniqueNewContacts) {
                        try {
                            await createContactApi(contactData);
                            successCount++;
                        } catch (err) {
                            console.error("Failed to save imported contact to backend:", err);
                        }
                    }

                    if (successCount > 0) {
                        await reloadContacts(); // Refresh list directly from DB
                        triggerToast(`Successfully uploaded & saved ${successCount} new contact(s).`);
                    } else {
                        triggerToast('Failed to save imported contacts to database.');
                    }
                } else {
                    triggerToast('No valid contact lines found in file.');
                }
            } catch (error) {
                triggerToast('Error reading uploaded text file.');
            }
        };
    }
    e.target.value = '';
};