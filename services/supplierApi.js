// Note: This is nearly identical to customerApi.js, adapted for suppliers.
// In a larger application, we could create a generic API service factory.

const API_BASE_URL = 'http://localhost:5000/api';

/**
 * A helper function to manage API requests, token handling, and error parsing.
 * @param {string} endpoint - The API endpoint to call (e.g., '/suppliers').
 * @param {RequestInit} options - The options for the fetch request.
 * @returns {Promise<any>} - The JSON response from the API.
 * @throws {Error} - Throws an error with a user-friendly message if the request fails.
 */
const apiRequest = async (endpoint, options = {}) => {
  const token = localStorage.getItem('token');
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const message = errorData.message || `Request failed with status ${response.status}`;
      throw new Error(message);
    }

    if (response.status === 204) {
        return null;
    }

    return response.json();
  } catch (error) {
    console.error(`API request to ${endpoint} failed:`, error);
    throw error;
  }
};

/**
 * Fetches all suppliers from the API.
 * @returns {Promise<Array<any>>} A list of suppliers.
 */
export const fetchSuppliers = () => {
  return apiRequest('/suppliers');
};

/**
 * Creates a new supplier.
 * @param {object} supplierData - The supplier data to save.
 * @returns {Promise<object>} The newly created supplier.
 */
export const createSupplier = (supplierData) => {
  return apiRequest('/suppliers', {
    method: 'POST',
    body: JSON.stringify(supplierData),
  });
};

/**
 * Updates an existing supplier.
 * @param {string} supplierId - The ID of the supplier to update.
 * @param {object} supplierData - The updated supplier data.
 * @returns {Promise<object>} The updated supplier.
 */
export const updateSupplier = (supplierId, supplierData) => {
  return apiRequest(`/suppliers/${supplierId}`, {
    method: 'PUT',
    body: JSON.stringify(supplierData),
  });
};

/**
 * Deletes a supplier.
 * @param {string} supplierId - The ID of the supplier to delete.
 * @returns {Promise<null>}
 */
export const deleteSupplier = (supplierId) => {
  return apiRequest(`/suppliers/${supplierId}`, {
    method: 'DELETE',
  });
}; 