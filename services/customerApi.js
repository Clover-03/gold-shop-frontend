const API_BASE_URL = 'http://localhost:5000/api';

/**
 * A helper function to manage API requests, token handling, and error parsing.
 * @param {string} endpoint - The API endpoint to call (e.g., '/customers').
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
      // Try to parse the error message from the server, otherwise use a generic message.
      const errorData = await response.json().catch(() => ({}));
      const message = errorData.message || `Request failed with status ${response.status}`;
      throw new Error(message);
    }

    // For 204 No Content (like DELETE), there's no body to parse.
    if (response.status === 204) {
        return null;
    }

    return response.json();
  } catch (error) {
    console.error(`API request to ${endpoint} failed:`, error);
    // Re-throw the error so the component can handle it (e.g., show a snackbar).
    throw error;
  }
};

/**
 * Fetches all customers from the API.
 * @returns {Promise<Array<any>>} A list of customers.
 */
export const fetchCustomers = () => {
  return apiRequest('/customers');
};

/**
 * Creates a new customer.
 * @param {object} customerData - The customer data to save.
 * @returns {Promise<object>} The newly created customer.
 */
export const createCustomer = (customerData) => {
  return apiRequest('/customers', {
    method: 'POST',
    body: JSON.stringify(customerData),
  });
};

/**
 * Updates an existing customer.
 * @param {string} customerId - The ID of the customer to update.
 * @param {object} customerData - The updated customer data.
 * @returns {Promise<object>} The updated customer.
 */
export const updateCustomer = (customerId, customerData) => {
  return apiRequest(`/customers/${customerId}`, {
    method: 'PUT',
    body: JSON.stringify(customerData),
  });
};

/**
 * Deletes a customer.
 * @param {string} customerId - The ID of the customer to delete.
 * @returns {Promise<null>}
 */
export const deleteCustomer = (customerId) => {
  return apiRequest(`/customers/${customerId}`, {
    method: 'DELETE',
  });
}; 