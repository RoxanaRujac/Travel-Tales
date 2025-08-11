import React, { useState, useEffect } from 'react';
import { UserService, JournalService } from '../../services/api';
import './ExplorePage.css';

const ExplorePage = () => {
  const [users, setUsers] = useState([]);
  const [journals, setJournals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedTab, setSelectedTab] = useState('users');

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        console.log('Fetching explore data...');
        
        // Fetch all users
        const usersData = await UserService.getAllUsers();
        console.log('Users fetched:', usersData);
        
        // Fetch all journals
        const journalsData = await JournalService.getAllJournals();
        console.log('Journals fetched:', journalsData);
        
        // Process users data to include recent journals
        const usersWithJournals = await Promise.all(
          usersData.map(async (user) => {
            try {
              // Get journals for this user
              const userJournals = journalsData.filter(journal => journal.userId === user.id);
              
              // Sort by creation date and take the 2 most recent
              const recentJournals = userJournals
                .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                .slice(0, 2)
                .map(journal => ({
                  id: journal.id,
                  title: journal.title,
                  coverImageURL: journal.coverImageURL || 'https://via.placeholder.com/300x200?text=No+Image',
                  description: journal.description || '',
                  createdAt: journal.createdAt
                }));
              
              return {
                ...user,
                journalCount: userJournals.length,
                recentJournals: recentJournals,
                avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name || user.username)}&background=6a5acd&color=fff&size=80`,
                bio: `Travel enthusiast with ${userJournals.length} journal${userJournals.length !== 1 ? 's' : ''} 🌍`,
                lastActive: user.createdAt || new Date().toISOString()
              };
            } catch (err) {
              console.error(`Error processing user ${user.id}:`, err);
              return {
                ...user,
                journalCount: 0,
                recentJournals: [],
                avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name || user.username)}&background=6a5acd&color=fff&size=80`,
                bio: 'Travel enthusiast 🌍',
                lastActive: user.createdAt || new Date().toISOString()
              };
            }
          })
        );
        
        // Process journals data to include author information
        const journalsWithAuthors = journalsData.map(journal => {
          const author = usersData.find(user => user.id === journal.userId);
          return {
            ...journal,
            author: author ? (author.name || author.username) : 'Unknown Author',
            authorAvatar: author 
              ? `https://ui-avatars.com/api/?name=${encodeURIComponent(author.name || author.username)}&background=6a5acd&color=fff&size=40`
              : 'https://ui-avatars.com/api/?name=Unknown&background=999&color=fff&size=40',
            coverImageURL: journal.coverImageURL || 'https://via.placeholder.com/400x250?text=No+Image'
          };
        });
        
        // Sort journals by creation date (newest first)
        const sortedJournals = journalsWithAuthors.sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );
        
        setUsers(usersWithJournals);
        setJournals(sortedJournals);
        
      } catch (err) {
        console.error('Error fetching explore data:', err);
        setError('Failed to load explore data. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Process image URLs for display
  const processImageUrl = (url) => {
    if (!url || url.includes('placeholder') || url.includes('ui-avatars')) {
      return url; // Return as-is for placeholder/avatar URLs
    }
    
    // If it's already a full URL, return as is
    if (url.startsWith('http')) {
      return url;
    }
    
    // If it starts with /, add the backend base URL
    if (url.startsWith('/')) {
      return `http://localhost:8080${url}`;
    }
    
    // Handle relative paths
    return `http://localhost:8080/${url.replace(/^\.\//, '')}`;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const filteredUsers = users;
  const filteredJournals = journals;

  if (loading) {
    return (
      <div className="explore-page">
        <div className="explore-header">
          <h1>Explore Travel Tales</h1>
          <p>Discover amazing travel stories from around the world</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="explore-page">
        <div className="explore-header">
          <h1>Explore Travel Tales</h1>
        </div>
        <div className="error-message">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="8" x2="12" y2="12"/>
            <line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="explore-page">
      <div className="explore-header">
        <h1>Explore Travel Tales</h1>
        <p>Discover amazing travel stories from around the world</p>
      </div>

      <div className="explore-tabs">
        <button 
          className={`tab-button ${selectedTab === 'users' ? 'active' : ''}`}
          onClick={() => setSelectedTab('users')}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/>
            <circle cx="12" cy="7" r="4"/>
          </svg>
          Travelers ({filteredUsers.length})
        </button>
        <button 
          className={`tab-button ${selectedTab === 'journals' ? 'active' : ''}`}
          onClick={() => setSelectedTab('journals')}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M4 19.5A2.5 2.5 0 016.5 17H20"/>
            <path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z"/>
          </svg>
          Journals ({filteredJournals.length})
        </button>
      </div>

      <div className="explore-content">
        {selectedTab === 'users' && (
          <div className="users-grid">
            {filteredUsers.map(user => (
              <div key={user.id} className="user-card">
                <div className="user-header">
                  <img src={user.avatar} alt={user.name} className="user-avatar" />
                  <div className="user-info">
                    <h3 className="user-name">{user.name}</h3>
                    <p className="user-username">@{user.username}</p>
                    <p className="user-bio">{user.bio}</p>
                  </div>
                </div>
                
                <div className="user-stats">
                  <div className="stat">
                    <span className="stat-number">{user.journalCount}</span>
                    <span className="stat-label">Journals</span>
                  </div>
                  <div className="stat">
                    <span className="stat-number">{formatDate(user.lastActive)}</span>
                    <span className="stat-label">Last Active</span>
                  </div>
                </div>

                {user.recentJournals && user.recentJournals.length > 0 && (
                  <div className="user-journals">
                    <h4>Recent Journals</h4>
                    <div className="journal-thumbnails">
                      {user.recentJournals.map(journal => (
                        <div key={journal.id} className="journal-thumbnail">
                          <img 
                            src={processImageUrl(journal.coverImageURL)} 
                            alt={journal.title}
                            onError={(e) => {
                              e.target.src = 'https://via.placeholder.com/300x200?text=No+Image';
                            }}
                          />
                          <div className="journal-thumbnail-info">
                            <h5>{journal.title}</h5>
                            <span>{formatDate(journal.createdAt)}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
 
              </div>
            ))}
          </div>
        )}

        {selectedTab === 'journals' && (
          <div className="journals-grid">
            {filteredJournals.map(journal => (
              <div key={journal.id} className="journal-card">
                <div className="journal-image">
                  <img 
                    src={processImageUrl(journal.coverImageURL)} 
                    alt={journal.title}
                  />
                </div>
                
                <div className="journal-info">
                  <h3 className="journal-title">{journal.title}</h3>
                  <p className="journal-description">{journal.description}</p>
                  
                  <div className="journal-meta">
                    <div className="journal-author">
                      <img 
                        src={journal.authorAvatar} 
                        alt={journal.author} 
                        className="author-avatar"
                        onError={(e) => {
                          e.target.src = 'https://ui-avatars.com/api/?name=Unknown&background=999&color=fff&size=40';
                        }}
                      />
                      <span>{journal.author}</span>
                    </div>
                    <span className="journal-date">{formatDate(journal.createdAt)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {((selectedTab === 'users' && filteredUsers.length === 0) || 
        (selectedTab === 'journals' && filteredJournals.length === 0)) && (
        <div className="no-results">
          <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
            <circle cx="11" cy="11" r="8"/>
            <path d="m21 21-4.35-4.35"/>
          </svg>
          <h3>No {selectedTab === 'users' ? 'travelers' : 'journals'} found</h3>
          <p>Check back later for new content!</p>
        </div>
      )}
    </div>
  );
};

export default ExplorePage;