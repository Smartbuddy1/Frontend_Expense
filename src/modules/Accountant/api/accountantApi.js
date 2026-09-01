import axios from 'axios';

const API = import.meta.env.VITE_API_BASE_URL;

export const accountantApi = {
  getPaymentLedger: async (params = {}) => {
    const res = await axios.get(`${API}/payments-ledger`, { params });
    return res.data;
  },

  getBankAccounts: async () => {
    const res = await axios.get(`${API}/payments-ledger/bank-accounts`);
    return res.data;
  },

  getAdvances: async (params = {}) => {
    const res = await axios.get(`${API}/advances`, { params });
    return res.data;
  }
};
