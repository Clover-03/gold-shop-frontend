const BASE_URL = 'http://localhost:5000/api';

const getToken = () => localStorage.getItem('token');

const request = async (endpoint, options = {}) => {
  const url = `${BASE_URL}/${endpoint}`;
  const token = getToken();
  
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const config = {
    ...options,
    headers,
  };

  const response = await fetch(url, config);

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: `An error occurred: ${response.statusText}` }));
    throw new Error(errorData.message || 'An unknown server error occurred');
  }

  if (response.status === 204) { // No Content
    return;
  }
  
  return response.json();
};

export const fetchInvoices = () => {
  return request('/invoices');
};

export const createInvoice = (invoiceData) => {
  return request('/invoices', {
    method: 'POST',
    body: JSON.stringify(invoiceData),
  });
};

export const updateInvoice = (id, invoiceData) => {
  return request(`/invoices/${id}`, {
    method: 'PUT',
    body: JSON.stringify(invoiceData),
  });
};

export const deleteInvoice = (id) => {
  return request(`/invoices/${id}`, {
    method: 'DELETE',
  });
};

export const fetchPendingOrders = () => {
  return request('/orders/pending');
}; 