const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:4000/api';

const getToken = () => localStorage.getItem('token');

export const api = {
  products: {
    getAll: async (queryParams = '') => {
      const res = await fetch(`${API_URL}/products?${queryParams}`);
      return res.json();
    },
    getById: async (id) => {
      const res = await fetch(`${API_URL}/products/${id}`);
      return res.json();
    },
    getBySeller: async (sellerId) => {
      const res = await fetch(`${API_URL}/products/seller/${sellerId}`);
      return res.json();
    },
    create: async (productData) => {
      const res = await fetch(`${API_URL}/products`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getToken()}`
        },
        body: JSON.stringify(productData)
      });
      return res.json();
    },
    delete: async (id) => {
      const res = await fetch(`${API_URL}/products/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${getToken()}` }
      });
      return res.json();
    }
  },
  auth: {
    login: async (credentials) => {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials)
      });
      return res.json();
    },
    register: async (userData) => {
      const res = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
      });
      return res.json();
    }
  },
  users: {
    getById: async (id) => {
      const res = await fetch(`${API_URL}/users/${id}`, {
        headers: { 'Authorization': `Bearer ${getToken()}` }
      });
      return res.json();
    },
    update: async (id, userData) => {
      const res = await fetch(`${API_URL}/users/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getToken()}`
        },
        body: JSON.stringify(userData)
      });
      return res.json();
    }
  },
  conversations: {
    getAll: async () => {
      const res = await fetch(`${API_URL}/conversations`, {
        headers: { 'Authorization': `Bearer ${getToken()}` }
      });
      return res.json();
    },
    getById: async (id) => {
      const res = await fetch(`${API_URL}/conversations/${id}`, {
        headers: { 'Authorization': `Bearer ${getToken()}` }
      });
      return res.json();
    },
    create: async (participantId, productId) => {
      const res = await fetch(`${API_URL}/conversations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getToken()}`
        },
        body: JSON.stringify({ participantId, productId })
      });
      return res.json();
    },
    getMessages: async (id) => {
      const res = await fetch(`${API_URL}/conversations/${id}/messages`, {
        headers: { 'Authorization': `Bearer ${getToken()}` }
      });
      return res.json();
    },
    sendMessage: async (id, content) => {
      const res = await fetch(`${API_URL}/conversations/${id}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getToken()}`
        },
        body: JSON.stringify({ content })
      });
      return res.json();
    }
  }
};