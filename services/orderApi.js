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
 * Fetches all orders.
 */
export const fetchOrders = () => {
  return apiRequest('/orders');
};

/**
 * Creates a new order.
 * @param {object} orderData - The complete order object, including products array.
 */
export const createOrder = (orderData) => {
  return apiRequest('/orders', {
    method: 'POST',
    body: JSON.stringify(orderData),
  });
};

/**
 * Updates an existing order.
 * @param {number | string} orderId - The ID of the order to update.
 * @param {object} orderData - The complete updated order object.
 */
export const updateOrder = (orderId, orderData) => {
  return apiRequest(`/orders/${orderId}`, {
    method: 'PUT',
    body: JSON.stringify(orderData),
  });
};

/**
 * Deletes an order.
 * @param {number | string} orderId - The ID of the order to delete.
 */
export const deleteOrder = (orderId) => {
  return apiRequest(`/orders/${orderId}`, {
    method: 'DELETE',
  });
}; 