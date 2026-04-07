const API_URL = process.env.REACT_APP_API_URL || '/api';

const getToken = () => localStorage.getItem('token');

export const api = {
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
    create: async (participantId) => {
      const res = await fetch(`${API_URL}/conversations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getToken()}`
        },
        body: JSON.stringify({ participantId })
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