import axios from 'axios';

const API_BASE_URL = 'http://localhost:8082';
const AUTH_API = `${API_BASE_URL}/api/auth`;

/**
 * Login user with username and password
 * @param {Object} credentials - User credentials
 * @returns {Promise<Object>} User data
 */
export const loginUser = async (credentials) => {
  try {
    const response = await axios.post(`${AUTH_API}/login`, credentials);
    
    // If authentication is successful, set the token in axios defaults
    if (response.data) {
      setAuthHeader(response.data.token);
    }
    
    return response.data;
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
};

/**
 * Register a new user
 * @param {Object} userData - User registration data
 * @returns {Promise<Object>} New user data
 */
 registerUser: async (userData) => {
    try {
      const response = await axios.post(`${AUTH_API}/register`, userData);
      return response.data;
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  }


/**
 * Check if user is authenticated
 * @returns {boolean} Authentication status
 */
export const isAuthenticated = () => {
  return !!getCurrentUser();
};

/**
 * Get current user data from local storage
 * @returns {Object|null} User data or null if not authenticated
 */
export const getCurrentUser = () => {
  const userStr = localStorage.getItem('user');
  if (!userStr) return null;
  return JSON.parse(userStr);
};

/**
 * Set authentication header for all future requests
 * @param {string} token - JWT token
 */
export const setAuthHeader = (token) => {
  if (token) {
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete axios.defaults.headers.common['Authorization'];
  }
};

/**
 * Logout user
 */
export const logout = () => {
  localStorage.removeItem('user');
  setAuthHeader(null);
};

// Initialize auth header from localStorage when page loads
const init = () => {
  const user = getCurrentUser();
  if (user && user.token) {
    setAuthHeader(user.token);
  }
};

// Call init function
init();

export default {
  loginUser,
  registerUser,
  isAuthenticated,
  getCurrentUser,
  logout,
  setAuthHeader
};