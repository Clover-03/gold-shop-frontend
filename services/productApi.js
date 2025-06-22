const API_BASE_URL = 'http://localhost:5000/api';

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
    if (response.status === 204) return null;
    return response.json();
  } catch (error) {
    console.error(`API request to ${endpoint} failed:`, error);
    throw new Error(error.message || 'An unexpected API error occurred.');
  }
};

export const fetchProducts = () => apiRequest('/products');

export const createProduct = (productData) => {
  return apiRequest('/products', {
    method: 'POST',
    body: JSON.stringify(productData),
  });
};

export const updateProduct = (productId, productData) => {
  return apiRequest(`/products/${productId}`, {
    method: 'PUT',
    body: JSON.stringify(productData),
  });
};

export const deleteProduct = (productId) => {
  return apiRequest(`/products/${productId}`, {
    method: 'DELETE',
  });
}; 