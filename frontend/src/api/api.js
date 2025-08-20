import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8000/api', 
  withCredentials: true, // Optional if using sessions or auth
});

export default api;
