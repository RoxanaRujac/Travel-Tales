import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { JournalService, EntryService, MediaService, UserService } from '../../services/api';
import './ProfilePage.css';

// XML Export Service
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';

const XMLExportService = {
  // Export profile statistics
  exportProfileStats: async (userId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/export/user/${userId}/profile-stats`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/xml',
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Get filename from Content-Disposition header
      const contentDisposition = response.headers.get('Content-Disposition');
      let filename = `user_${userId}_profile_stats.xml`;
      
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="(.+)"/);
        if (filenameMatch) {
          filename = filenameMatch[1];
        }
      }

      const blob = await response.blob();
      return { blob, filename };
    } catch (error) {
      console.error('Error exporting profile stats:', error);
      throw error;
    }
  },

  // Export complete user data
  exportCompleteData: async (userId, includeMedia = false) => {
    try {
      const response = await fetch(`${API_BASE_URL}/export/user/${userId}/complete-data?includeMedia=${includeMedia}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/xml',
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const contentDisposition = response.headers.get('Content-Disposition');
      let filename = `user_${userId}_complete_data.xml`;
      
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="(.+)"/);
        if (filenameMatch) {
          filename = filenameMatch[1];
        }
      }

      const blob = await response.blob();
      return { blob, filename };
    } catch (error) {
      console.error('Error exporting complete data:', error);
      throw error;
    }
  }
};

// Helper function pentru download
const downloadFile = (blob, filename) => {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};

const ProfilePage = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [profileImage, setProfileImage] = useState(null);
  const [preview, setPreview] = useState(null);
  
  // Stats state
  const [stats, setStats] = useState({
    journalCount: 0,
    entryCount: 0,
    photoCount: 0,
    countries: new Set() // To track unique countries
  });

  // Export loading states
  const [exportLoading, setExportLoading] = useState({
    profileStats: false,
    completeData: false
  });
  
  const navigate = useNavigate();

  // Get current user from localStorage
  const getCurrentUser = () => {
    const userStr = localStorage.getItem('user');
    if (!userStr) return null;
    return JSON.parse(userStr);
  };

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        setError(null);

        const currentUser = getCurrentUser();
        if (!currentUser) {
          navigate('/login');
          return;
        }
        
        setUser(currentUser);
        setFormData({
          name: currentUser.name || '',
          username: currentUser.username || '',
          email: currentUser.email || '',
          password: '',
          confirmPassword: ''
        });
        
        if (currentUser.profileImageURL) {
          setPreview(currentUser.profileImageURL);
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
        setError('Failed to load profile data. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [navigate]);

  // Fetch user statistics
  useEffect(() => {
    const fetchUserStats = async () => {
      if (!user || !user.id) return;
      
      try {
        setStatsLoading(true);
        
        // Fetch journals
        const journals = await JournalService.getAllJournals(user.id);
        
        let totalEntries = 0;
        let totalPhotos = 0;
        const uniqueCountries = new Set();
        
        // For each journal, fetch its entries
        if (journals.length > 0) {
          const entriesPromises = journals.map(journal => 
            EntryService.getEntriesByJournalId(journal.id)
          );
          
          const journalEntriesResults = await Promise.all(entriesPromises);
          
          // Process all entries
          journalEntriesResults.forEach(entries => {
            if (entries && entries.length) {
              totalEntries += entries.length;
              
              // Process countries and photos for each entry
              entries.forEach(entry => {
                // Add location to countries if it exists
                if (entry.locationName) {
                  uniqueCountries.add(entry.locationName);
                }
                
                // Count photos in media attachments
                if (entry.mediaAttachments && entry.mediaAttachments.length) {
                  totalPhotos += entry.mediaAttachments.length;
                }
              });
            }
          });
        }
        
        // Update stats
        setStats({
          journalCount: journals.length,
          entryCount: totalEntries,
          photoCount: totalPhotos,
          countries: uniqueCountries
        });
        
      } catch (error) {
        console.error('Error fetching user statistics:', error);
        // Don't set error state to avoid disrupting the profile page
      } finally {
        setStatsLoading(false);
      }
    };
    
    fetchUserStats();
  }, [user]);

  // Export handlers
  const handleExportProfileStats = async () => {
    try {
      setExportLoading(prev => ({ ...prev, profileStats: true }));
      
      const { blob, filename } = await XMLExportService.exportProfileStats(user.id);
      downloadFile(blob, filename);
      
      // Show success message
      alert('Profile statistics exported successfully!');
    } catch (error) {
      console.error('Export failed:', error);
      alert('Failed to export profile statistics. Please try again.');
    } finally {
      setExportLoading(prev => ({ ...prev, profileStats: false }));
    }
  };

  const handleExportCompleteData = async () => {
    try {
      setExportLoading(prev => ({ ...prev, completeData: true }));
      
      const { blob, filename } = await XMLExportService.exportCompleteData(user.id, false);
      downloadFile(blob, filename);
      
      alert('Complete data export successful!');
    } catch (error) {
      console.error('Export failed:', error);
      alert('Failed to export complete data. Please try again.');
    } finally {
      setExportLoading(prev => ({ ...prev, completeData: false }));
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleFileChange = (e) => {
    if (e.target.files[0]) {
      const file = e.target.files[0];
      setProfileImage(file);
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    if (formData.password && formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }
    
    try {
       const updatedUserData = {
        id: user.id,
        name: formData.name,
        username: formData.username,
        email: formData.email,
        // Only include password if it's being changed
        ...(formData.password && { password: formData.password })
      };
      
      // Call API to update user in database
      const updatedUser = await UserService.updateUser(updatedUserData);
      
       const updatedUserForStorage = {
        ...user,
        ...updatedUser,
        profileImageURL: preview || user.profileImageURL
      };
      
      localStorage.setItem('user', JSON.stringify(updatedUserForStorage));
      
      setUser(updatedUser);
      setIsEditing(false);
      
      // Show success message
      alert('Profile updated successfully!');
    } catch (error) {
      console.error('Error updating profile:', error);
      setError('Failed to update profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (loading && !user) {
    return (
      <div className="profile-container">
        <div className="loading-state">Loading profile data...</div>
      </div>
    );
  }

  if (error && !user) {
    return (
      <div className="profile-container">
        <div className="error-message">{error}</div>
      </div>
    );
  }

  return (
    <div className="profile-container">
      {error && <div className="error-message">{error}</div>}
      
      <div className="profile-layout">
        {/* Profile Header */}
        <div className="profile-header">
          <div className="profile-image-container">
            <div 
              className="profile-image" 
              style={{ backgroundImage: preview ? `url(${preview})` : 'none' }}
            >
              {!preview && (
                <span className="profile-image-placeholder">
                  {user.name ? user.name.charAt(0).toUpperCase() : user.username.charAt(0).toUpperCase()}
                </span>
              )}
            </div>
          </div>
          <div className="profile-intro">
            <h1 className="profile-name">{user.name || user.username}</h1>
            <div className="profile-username">@{user.username}</div>
            <div className="join-date">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="4" width="18" height="18" rx="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
              Joined {user.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              }) : 'N/A'}
            </div>
          </div>
        </div>
        
        {/* Profile Stats */}
        <div className="profile-stats-bar">
          <div className="stat-item">
            <div className="stat-value">
              {statsLoading ? (
                <span className="stat-loading">...</span>
              ) : (
                stats.journalCount
              )}
            </div>
            <div className="stat-label">Journals</div>
          </div>
          <div className="stat-item">
            <div className="stat-value">
              {statsLoading ? (
                <span className="stat-loading">...</span>
              ) : (
                stats.entryCount
              )}
            </div>
            <div className="stat-label">Entries</div>
          </div>
          <div className="stat-item">
            <div className="stat-value">
              {statsLoading ? (
                <span className="stat-loading">...</span>
              ) : (
                stats.countries.size
              )}
            </div>
            <div className="stat-label">Locations</div>
          </div>
          <div className="stat-item">
            <div className="stat-value">
              {statsLoading ? (
                <span className="stat-loading">...</span>
              ) : (
                stats.photoCount
              )}
            </div>
            <div className="stat-label">Photos</div>
          </div>
        </div>
        
        {/* Main Content */}
        <div className="profile-main">
          {isEditing ? (
            <div className="edit-profile-section">
              <h2 className="section-title">Edit Profile</h2>
              <form className="edit-form" onSubmit={handleSubmit}>
                <div className="form-columns">
                  <div className="form-left-column">
                    <div className="form-image-upload">
                      <div 
                        className="profile-image-preview" 
                        style={{ backgroundImage: preview ? `url(${preview})` : 'none' }}
                      >
                        {!preview && (
                          <span className="profile-image-placeholder">
                            {formData.name ? formData.name.charAt(0).toUpperCase() : user.username.charAt(0).toUpperCase()}
                          </span>
                        )}
                      </div>
                      <label className="image-upload-btn">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleFileChange}
                          className="file-input"
                        />
                        Change Photo
                      </label>
                    </div>
                  </div>
                  <div className="form-right-column">
                    <div className="form-group">
                      <label className="form-label">Name</label>
                      <input
                        type="text"
                        className="form-input"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="Your full name"
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Username</label>
                      <input
                        type="text"
                        className="form-input"
                        name="username"
                        value={formData.username}
                        onChange={handleChange}
                        required
                        placeholder="Username"
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Email</label>
                      <input
                        type="email"
                        className="form-input"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        placeholder="email@example.com"
                      />
                    </div>

                    <h3 className="section-subtitle">Change Password</h3>
                    <div className="form-group">
                      <label className="form-label">New Password</label>
                      <input
                        type="password"
                        className="form-input"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        placeholder="Leave blank to keep current password"
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Confirm Password</label>
                      <input
                        type="password"
                        className="form-input"
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        placeholder="Confirm new password"
                      />
                    </div>
                  </div>
                </div>

                <div className="form-buttons">
                  <button type="submit" className="btn btn-primary" disabled={loading}>
                    {loading ? 'Saving...' : 'Save Changes'}
                  </button>
                  <button 
                    type="button" 
                    className="btn btn-secondary"
                    onClick={() => setIsEditing(false)}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <>
              <div className="profile-section account-info">
                <h2 className="section-title">Account Information</h2>
                <div className="info-grid">
                  <div className="info-item">
                    <div className="info-label">Email</div>
                    <div className="info-value">{user.email}</div>
                  </div>
                  <div className="info-item">
                    <div className="info-label">Member Since</div>
                    <div className="info-value">
                      {user.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      }) : 'N/A'}
                    </div>
                  </div>
                </div>
                
                <button 
                  className="edit-profile-btn"
                  onClick={() => setIsEditing(true)}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
                    <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
                  </svg>
                  Edit Profile
                </button>
              </div>

              {/* NEW: XML Export Section */}
              <div className="profile-section export-section">
                <h2 className="section-title">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
                    <polyline points="7,10 12,15 17,10" />
                    <line x1="12" y1="15" x2="12" y2="3" />
                  </svg>
                  Export Data
                </h2>
                
                <div className="export-options">
                  <div className="export-option">
                    <div className="export-info">
                      <h4>Profile Statistics</h4>
                      <p>Export your profile stats including {stats.journalCount} journals, {stats.entryCount} entries, and {stats.countries.size} locations visited.</p>
                    </div>
                    <button 
                      className="export-btn export-btn-primary"
                      onClick={handleExportProfileStats}
                      disabled={exportLoading.profileStats || statsLoading}
                    >
                      {exportLoading.profileStats ? (
                        <>
                          <span className="loading-spinner"></span>
                          Exporting...
                        </>
                      ) : (
                        <>
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M9 17H7A2 2 0 015 15V5A2 2 0 017 3H17A1 1 0 0118 4V9" />
                            <path d="M16 12L21 7L16 2" />
                            <path d="M21 7H13" />
                          </svg>
                          Export Stats XML
                        </>
                      )}
                    </button>
                  </div>

                  <div className="export-option">
                    <div className="export-info">
                      <h4>Complete Data</h4>
                      <p>Export all your journal data including full content, entries, and metadata (excluding media files).</p>
                    </div>
                    <button 
                      className="export-btn export-btn-secondary"
                      onClick={handleExportCompleteData}
                      disabled={exportLoading.completeData || statsLoading}
                    >
                      {exportLoading.completeData ? (
                        <>
                          <span className="loading-spinner"></span>
                          Exporting...
                        </>
                      ) : (
                        <>
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
                            <polyline points="14,2 14,8 20,8" />
                            <line x1="16" y1="13" x2="8" y2="13" />
                            <line x1="16" y1="17" x2="8" y2="17" />
                            <polyline points="10,9 9,9 8,9" />
                          </svg>
                          Export All Data XML
                        </>
                      )}
                    </button>
                  </div>
                </div>

                <div className="export-note">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" />
                    <path d="M12 16v-4" />
                    <path d="M12 8h.01" />
                  </svg>
                  <span>XML exports are formatted for easy data migration and backup. Files will be downloaded automatically.</span>
                </div>
              </div>
              
              <div className="profile-section recent-activity">
                <h2 className="section-title">Recent Activity</h2>
                {statsLoading ? (
                  <div className="loading-activity">Loading activity data...</div>
                ) : stats.entryCount > 0 ? (
                  <div className="activity-summary">
                    <p>You have created {stats.journalCount} journal{stats.journalCount !== 1 ? 's' : ''} with {stats.entryCount} entries across {stats.countries.size} {stats.countries.size !== 1 ? 'countries' : 'country'}.</p>
                    <p>Your collection includes {stats.photoCount} photo{stats.photoCount !== 1 ? 's' : ''}.</p>
                  </div>
                ) : (
                  <div className="empty-state">
                    <div className="empty-icon">📝</div>
                    <div className="empty-text">No recent activity yet</div>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;