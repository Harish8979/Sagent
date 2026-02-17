import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api/auth';

class AuthService {
  register(userData) {
    return axios.post(`${API_BASE_URL}/register`, userData);
  }

  login(credentials) {
    return axios.post(`${API_BASE_URL}/login`, credentials);
  }
}

export default new AuthService();
