// src/services/api.js

const BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8080/api';

const getHeaders = () => {
    const token = localStorage.getItem('token');
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
        // Supports Spring Boot validation maps or error messages
        errorMessage = errorJson.message || errorJson.error || JSON.stringify(errorJson);
    } catch (e) {
        if (errorText) errorMessage = errorText;
    }
    throw new Error(errorMessage);
};

// --- Auth API ---
export const loginApi = async (username, password) => {
    const response = await fetch(`${BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
    });

    if (!response.ok) {
        await handleApiError(response, 'Invalid username or password.');
    }

    return await response.json();
};

// --- Contacts API ---
export const fetchContactsApi = async () => {
    const response = await fetch(`${BASE_URL}/contacts`, {
        method: 'GET',
        headers: getHeaders()
    });
    if (!response.ok) await handleApiError(response, 'Failed to fetch contacts');
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

export const changePasswordApi = async (passwordData) => {
    const response = await fetch(`${BASE_URL}/auth/change-password`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(passwordData)
    });
    if (!response.ok) await handleApiError(response, 'Failed to update password');
    return await response.json();
};

// --- Register API ---
export const registerApi = async (userData) => {
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
    const response = await fetch(`${BASE_URL}/auth/profile`, {
        method: 'GET',
        headers: getHeaders()
    });

    if (!response.ok) {
        await handleApiError(response, 'Failed to fetch user profile.');
    }

    return await response.json();
};