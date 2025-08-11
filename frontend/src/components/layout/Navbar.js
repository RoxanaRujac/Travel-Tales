import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import './Navbar.css';

const Navbar = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();
  // Check if user is logged in on component mount and when localStorage changes
  useEffect(() => {
    const checkAuthStatus = () => {
      const userStr = localStorage.getItem('user');
      const token = localStorage.getItem('token'); // if you're using tokens
      
      if (userStr) {
        try {
          const userData = JSON.parse(userStr);
          setUser(userData);
          setIsLoggedIn(true);
        } catch (error) {
          console.error('Error parsing user data:', error);
          // Clear invalid data
          localStorage.removeItem('user');
          localStorage.removeItem('token');
          setIsLoggedIn(false);
          setUser(null);
        }
      } else {
        setIsLoggedIn(false);
        setUser(null);
      }
    };

    // Check on mount
    checkAuthStatus();

    // Listen for storage changes (when user logs in/out in another tab)
    const handleStorageChange = (e) => {
      if (e.key === 'user' || e.key === 'token') {
        checkAuthStatus();
      }
    };

    // Listen for custom auth events
    const handleAuthChange = () => {
      checkAuthStatus();
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('authStateChanged', handleAuthChange);

    // Cleanup
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('authStateChanged', handleAuthChange);
    };
  }, [location.pathname]); // Re-run when route changes

  // Additional effect to check auth status more frequently
  useEffect(() => {
    const interval = setInterval(() => {
      const userStr = localStorage.getItem('user');
      const currentlyLoggedIn = !!userStr;
      
      if (currentlyLoggedIn !== isLoggedIn) {
        // Auth state has changed, update it
        if (currentlyLoggedIn && userStr) {
          try {
            const userData = JSON.parse(userStr);
            setUser(userData);
            setIsLoggedIn(true);
          } catch (error) {
            console.error('Error parsing user data:', error);
            localStorage.removeItem('user');
            localStorage.removeItem('token');
            setIsLoggedIn(false);
            setUser(null);
          }
        } else {
          setIsLoggedIn(false);
          setUser(null);
        }
      }
    }, 1000); // Check every second

    return () => clearInterval(interval);
  }, [isLoggedIn]);

  const handleLogout = () => {
    // Clear all auth-related data from localStorage
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken'); // if you're using refresh tokens
    
    // Update state
    setIsLoggedIn(false);
    setUser(null);
    
    // Dispatch custom event to notify other components
    window.dispatchEvent(new Event('authStateChanged'));
    
    // Redirect to home page
    navigate('/');
    
    // Optional: Show logout success message
    console.log('User logged out successfully');
  };

  const getUserDisplayName = () => {
    if (!user) return 'User';
    return user.name || user.username || user.email || 'User';
  };

  return (
    <header className="header">
      <div className="logo">
        <Link to="/" className="logo-link">
          <span className="logo-text">Travel Tales</span>
        </Link>
      </div>
  
      <nav className="nav-links">
        {/* Show these links when logged in */}
        {isLoggedIn && (
          <>
            <Link to="/journals/new" className="nav-link">
              <svg className="nav-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M12 4v16m-8-8h16" strokeWidth="2" strokeLinecap="round"/>
              </svg>
              Create
            </Link>
            
            <Link to="/journals" className="nav-link">
              <svg className="nav-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <rect x="4" y="4" width="16" height="16" rx="2" strokeWidth="2"/>
                <path d="M4 8H20" strokeWidth="2"/>
                <path d="M8 4V8" strokeWidth="2"/>
                <path d="M16 4V8" strokeWidth="2"/>
              </svg>
              My Diaries
            </Link>

            <Link to="/create-postcard" className="nav-link">
              <svg className="nav-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <rect x="3" y="8" width="18" height="12" rx="2" strokeWidth="2"/>
                <path d="M3 8l9 6 9-6" strokeWidth="2"/>
              </svg>
              Postcards
            </Link>

            <Link to="/notifications" className="nav-link notification-link">
              <svg className="nav-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" strokeWidth="2"/>
                <path d="M13.73 21a2 2 0 01-3.46 0" strokeWidth="2"/>
              </svg>
              Notifications
            </Link>

            <Link to="/explore" className="nav-link">
              <svg className="nav-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <circle cx="12" cy="12" r="10" strokeWidth="2"/>
                <polygon points="16.24,7.76 14.12,14.12 7.76,16.24 9.88,9.88" strokeWidth="2"/>
              </svg>
              Explore
            </Link>

            <Link to="/profile" className="nav-link">
              <svg className="nav-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <circle cx="12" cy="8" r="4" strokeWidth="2"/>
                <path d="M20 19c0 3-3.582 3-8 3s-8 0-8-3c0-3 3.582-5 8-5s8 2 8 5z" strokeWidth="2"/>
              </svg>
              Profile
            </Link>
          </>
        )}

      </nav>

      <div className="auth-links">
        {isLoggedIn ? (
          // Logged in state
          <div className="user-menu">
            <span className="user-welcome">
              Welcome, {getUserDisplayName()}!
            </span>
            <button onClick={handleLogout} className="auth-link logout-btn">
              <svg className="nav-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" strokeWidth="2"/>
                <polyline points="16,17 21,12 16,7" strokeWidth="2"/>
                <line x1="21" y1="12" x2="9" y2="12" strokeWidth="2"/>
              </svg>
              Logout
            </button>
          </div>
        ) : (
          // Logged out state
          <>
            <Link to="/login" className="auth-link login-btn">
              <svg className="nav-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M15 3h4a2 2 0 012 2v14a2 2 0 01-2 2h-4" strokeWidth="2"/>
                <polyline points="10,17 15,12 10,7" strokeWidth="2"/>
                <line x1="15" y1="12" x2="3" y2="12" strokeWidth="2"/>
              </svg>
              Login
            </Link>
            <Link to="/register" className="auth-link register-btn">
              <svg className="nav-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M16 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" strokeWidth="2"/>
                <circle cx="8.5" cy="7" r="4" strokeWidth="2"/>
                <line x1="20" y1="8" x2="20" y2="14" strokeWidth="2"/>
                <line x1="23" y1="11" x2="17" y2="11" strokeWidth="2"/>
              </svg>
              Register
            </Link>
          </>
        )}
      </div>
    </header>
  );
};

export default Navbar;