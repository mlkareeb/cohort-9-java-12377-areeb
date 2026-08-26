import { createContactApi } from '../services/api';

// Converts a labeled map (e.g. { Work: "a@b.com", Personal: "c@d.com" })
// into "Work=a@b.com;Personal=c@d.com" for storage in the .txt file
const mapToInline = (map) => {
    if (!map || typeof map !== 'object') return '';
    return Object.entries(map)
        .filter(([, value]) => value)
        .map(([label, value]) => `${label}=${value}`)
        .join(';');
};

// Reverses mapToInline: "Work=a@b.com;Personal=c@d.com" -> { Work: "a@b.com", Personal: "c@d.com" }
const inlineToMap = (inline) => {
    const map = {};
    if (!inline) return map;
    inline.split(';').forEach(pair => {
        const [label, ...rest] = pair.split('=');
        const value = rest.join('=').trim();
        if (label && value) {
            map[label.trim()] = value;
        }
    });
    return map;
};

// --- Export Contacts to TXT File ---
export const exportContactsToFile = (contacts, triggerToast) => {
    try {
        if (!contacts || contacts.length === 0) {
            triggerToast('No contacts to export.');
            return;
        }

        const fileContent = contacts.map(c => {
            const emailsInline = mapToInline(c.emails) || 'N/A';
            const phonesInline = mapToInline(c.phoneNumbers) || 'N/A';

            return `Name: ${c.firstName || ''} ${c.lastName || ''} | Title: ${c.title || ''} | Emails: ${emailsInline} | Phones: ${phonesInline}`;
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

// --- Import Contacts from TXT File (multi-label aware, with duplicate prevention) ---
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
                            const emailsPart = parts[2].replace('Emails:', '').trim();
                            const phonesPart = parts[3].replace('Phones:', '').trim();

                            parsedContacts.push({
                                firstName: namePart[0] || 'Unknown',
                                lastName: namePart.slice(1).join(' ') || '',
                                title: titlePart,
                                emails: inlineToMap(emailsPart === 'N/A' ? '' : emailsPart),
                                phoneNumbers: inlineToMap(phonesPart === 'N/A' ? '' : phonesPart)
                            });
                        }
                    }
                });

                if (parsedContacts.length > 0) {
                    // A contact is a "duplicate" if ANY of its emails matches ANY
                    // existing contact's email (not just a single hardcoded label)
                    const existingEmails = new Set();
                    currentContacts.forEach(c => {
                        Object.values(c.emails || {}).forEach(val => {
                            if (val) existingEmails.add(String(val).toLowerCase().trim());
                        });
                    });

                    const uniqueNewContacts = parsedContacts.filter(c => {
                        const emailValues = Object.values(c.emails || {}).map(v => String(v).toLowerCase().trim());
                        const isDuplicate = emailValues.some(email => email && existingEmails.has(email));

                        if (isDuplicate || emailValues.every(email => !email)) {
                            return false;
                        }

                        emailValues.forEach(email => { if (email) existingEmails.add(email); });
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