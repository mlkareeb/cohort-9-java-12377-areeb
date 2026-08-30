// src/services/api.js

const BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8080/api';

// Guards against sending sensitive credentials/tokens in plaintext over a non-loopback
// HTTP origin. Localhost/127.0.0.1 over http:// is fine for local dev; any other
// http:// host (e.g. a misconfigured REACT_APP_API_BASE_URL pointing at a real
// server without TLS) would leak credentials to anyone on the network path.
const isSecureOrLoopback = (() => {
    try {
        const { protocol, hostname } = new URL(BASE_URL);
        if (protocol === 'https:') return true;
        const isLoopback = hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '::1';
        return protocol === 'http:' && isLoopback;
    } catch (e) {
        // If BASE_URL isn't a valid absolute URL, fail closed rather than assume it's safe.
        return false;
    }
})();

const ensureSecureOrigin = () => {
    if (!isSecureOrLoopback) {
        throw new Error(
            'Refusing to send credentials: API base URL is not HTTPS or localhost. ' +
            'Check REACT_APP_API_BASE_URL.'
        );
    }
};

const getHeaders = () => {
    const token = localStorage.getItem('token');
    const isAuthed = Boolean(token);

    if (isAuthed) {
        ensureSecureOrigin();
    }

    return {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` })
    };
};

// Helper function to extract detailed backend error messages from fetch responses
const handleApiError = async (response, defaultMessage) => {
    const errorText = await response.text();
    let errorMessage = defaultMessage;
    try {
        const errorJson = JSON.parse(errorText);
        if (errorJson.errors) {
            // field-level validation errors from MethodArgumentNotValidException
            errorMessage = Object.values(errorJson.errors).join(', ');
        } else {
            errorMessage = errorJson.message || errorJson.error || JSON.stringify(errorJson);
        }
    } catch (e) {
        if (errorText) errorMessage = errorText;
    }
    throw new Error(errorMessage);
};

// --- Auth API ---
export const loginApi = async (usernameOrEmailOrPhone, password) => {
    ensureSecureOrigin();

    const response = await fetch(`${BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ usernameOrEmailOrPhone, password }),
    });

    if (!response.ok) {
        await handleApiError(response, 'Invalid username, email, phone number, or password.');
    }

    return await response.json();
};

// --- Contacts API ---
export const fetchContactsApi = async (page = 0, size = 10) => {
    const response = await fetch(`${BASE_URL}/contacts?page=${page}&size=${size}`, {
        method: 'GET',
        headers: getHeaders()
    });
    if (!response.ok) await handleApiError(response, 'Failed to fetch contacts');
    return await response.json(); // returns a Page object: { content, totalPages, totalElements, ... }
};

export const searchContactsApi = async (query, page = 0, size = 10) => {
    const response = await fetch(`${BASE_URL}/contacts/search?query=${encodeURIComponent(query)}&page=${page}&size=${size}`, {
        method: 'GET',
        headers: getHeaders()
    });
    if (!response.ok) await handleApiError(response, 'Failed to search contacts');
    return await response.json();
};

export const createContactApi = async (contactData) => {
    const response = await fetch(`${BASE_URL}/contacts`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(contactData)
    });
    if (!response.ok) await handleApiError(response, 'Failed to create contact');
    return await response.json();
};

export const updateContactApi = async (id, contactData) => {
    const response = await fetch(`${BASE_URL}/contacts/${id}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(contactData)
    });
    if (!response.ok) await handleApiError(response, 'Failed to update contact');
    return await response.json();
};

export const deleteContactApi = async (id) => {
    const response = await fetch(`${BASE_URL}/contacts/${id}`, {
        method: 'DELETE',
        headers: getHeaders()
    });
    if (!response.ok) await handleApiError(response, 'Failed to delete contact');
    return true;
};

export const exportContactsApi = async () => {
    const response = await fetch(`${BASE_URL}/contacts/export`, {
        method: 'GET',
        headers: getHeaders()
    });
    if (!response.ok) await handleApiError(response, 'Failed to export contacts');
    return await response.text(); // JSON string, used to trigger a file download
};

export const importContactsApi = async (jsonContent) => {
    const response = await fetch(`${BASE_URL}/contacts/import`, {
        method: 'POST',
        headers: getHeaders(), // sends Content-Type: application/json — matches backend's @RequestBody String
        body: jsonContent
    });
    if (!response.ok) await handleApiError(response, 'Failed to import contacts');
    return await response.text();
};

export const changePasswordApi = async (passwordData) => {
    const response = await fetch(`${BASE_URL}/users/change-password`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(passwordData)
    });
    if (!response.ok) await handleApiError(response, 'Failed to update password');
    return await response.text();
};

// --- Register API ---
export const registerApi = async (userData) => {
    ensureSecureOrigin();

    const response = await fetch(`${BASE_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
    });

    if (!response.ok) {
        await handleApiError(response, 'Failed to register. Please check your inputs.');
    }

    return await response.json();
};

// --- User Profile API ---
export const getUserProfileApi = async () => {
    const response = await fetch(`${BASE_URL}/users/me`, {
        method: 'GET',
        headers: getHeaders()
    });

    if (!response.ok) {
        await handleApiError(response, 'Failed to fetch user profile.');
    }

    return await response.json();
};