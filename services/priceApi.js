const API_BASE_URL = 'http://localhost:5000/api';

/**
 * A generic helper function for API requests.
 * Manages token authentication and standardized error handling.
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
    const response = await fetch(`${API_BASE_URL}${endpoint}`, { ...options, headers });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Request failed: ${response.status}`);
    }

    if (response.status === 204) {
      return null;
    }
    return response.json();
  } catch (error) {
    console.error(`API Error on ${endpoint}:`, error);
    throw error;
  }
};

/**
 * Fetches all prices. (Requires auth)
 */
export const fetchPrices = () => {
  return apiRequest('/prices');
};

/**
 * Fetches the latest price. (Public)
 */
export const fetchLatestPrice = () => {
  return apiRequest('/prices/latest');
};

/**
 * Creates a new price entry. (Requires auth)
 * @param {object} priceData - The price data to create.
 */
export const createPrice = (priceData) => {
  return apiRequest('/prices', {
    method: 'POST',
    body: JSON.stringify(priceData),
  });
};

/**
 * Updates an existing price entry. (Requires auth)
 * @param {number | string} priceId - The ID of the price to update.
 * @param {object} priceData - The updated price data.
 */
export const updatePrice = (priceId, priceData) => {
  return apiRequest(`/prices/${priceId}`, {
    method: 'PUT',
    body: JSON.stringify(priceData),
  });
};

/**
 * Deletes a price entry. (Requires auth)
 * @param {number | string} priceId - The ID of the price to delete.
 */
export const deletePrice = (priceId) => {
  return apiRequest(`/prices/${priceId}`, {
    method: 'DELETE',
  });
}; 