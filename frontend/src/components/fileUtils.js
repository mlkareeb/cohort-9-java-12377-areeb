import { createContactApi } from '../services/api';

// --- Export Contacts to a JSON File ---
// JSON is used instead of a pipe-delimited text format so that any character
// in a contact's fields (including "|", ";", "=") is preserved exactly,
// rather than being misinterpreted as a field/label separator on import.
export const exportContactsToFile = (contacts, triggerToast) => {
    try {
        if (!contacts || contacts.length === 0) {
            triggerToast('No contacts to export.');
            return;
        }

        const exportable = contacts.map(c => ({
            firstName: c.firstName || '',
            lastName: c.lastName || '',
            title: c.title || '',
            emails: c.emails && typeof c.emails === 'object' ? c.emails : {},
            phoneNumbers: c.phoneNumbers && typeof c.phoneNumbers === 'object' ? c.phoneNumbers : {}
        }));

        const fileContent = JSON.stringify(exportable, null, 2);

        const blob = new Blob([fileContent], { type: 'application/json;charset=utf-8;' });
        const downloadAnchor = document.createElement('a');
        downloadAnchor.href = URL.createObjectURL(blob);
        downloadAnchor.setAttribute("download", "contacts_export.json");
        document.body.appendChild(downloadAnchor);
        downloadAnchor.click();
        downloadAnchor.remove();
        triggerToast('Contacts downloaded successfully.');
    } catch (error) {
        triggerToast('Failed to export contacts.');
    }
};

// --- Import Contacts from a JSON File (multi-label aware, with duplicate prevention) ---
export const importContactsFromFile = (e, currentContacts, setContacts, reloadContacts, triggerToast) => {
    const fileReader = new FileReader();
    if (e.target.files && e.target.files[0]) {
        fileReader.onerror = () => {
            triggerToast('Error reading uploaded file.');
        };

        fileReader.readAsText(e.target.files[0], "UTF-8");
        fileReader.onload = async (event) => {
            try {
                const textData = event.target.result;
                let parsedRaw;
                try {
                    parsedRaw = JSON.parse(textData);
                } catch (parseError) {
                    triggerToast('Invalid file format — expected a JSON export from this app.');
                    return;
                }

                if (!Array.isArray(parsedRaw)) {
                    triggerToast('Invalid file format — expected a list of contacts.');
                    return;
                }

                const parsedContacts = parsedRaw
                    .filter(item => item && typeof item === 'object')
                    .map(item => ({
                        firstName: item.firstName || 'Unknown',
                        lastName: item.lastName || '',
                        title: item.title || '',
                        emails: item.emails && typeof item.emails === 'object' ? item.emails : {},
                        phoneNumbers: item.phoneNumbers && typeof item.phoneNumbers === 'object' ? item.phoneNumbers : {}
                    }));

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
                    triggerToast('No valid contacts found in file.');
                }
            } catch (error) {
                triggerToast('Error reading uploaded file.');
            }
        };
    }
    e.target.value = '';
};