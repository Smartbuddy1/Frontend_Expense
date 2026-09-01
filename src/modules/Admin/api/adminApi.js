import axios from 'axios';

const API = import.meta.env.VITE_API_BASE_URL;

export const adminApi = {
  getProjects: async (params = {}) => {
    const res = await axios.get(`${API}/projects`, { params });
    return res.data;
  },
  
  getUsers: async (role) => {
    const params = role ? { role } : {};
    const res = await axios.get(`${API}/users`, { params });
    return res.data;
  },

  getTeamMembers: async (params = {}) => {
    const res = await axios.get(`${API}/team-members`, { params });
    return res.data;
  },

  getExpenses: async (params = {}) => {
    const res = await axios.get(`${API}/expenses`, { params });
    return res.data;
  }
};
