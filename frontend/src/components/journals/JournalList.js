import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { JournalService } from '../../services/api';
import './JournalList.css';

const JournalList = () => {
  const [journals, setJournals] = useState([]);
  const [journalImages, setJournalImages] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  
  const API_BASE_URL = 'http://localhost:8080';

  // Get current user from localStorage
  const getCurrentUser = () => {
    const userStr = localStorage.getItem('user');
    if (!userStr) return null;
    return JSON.parse(userStr);
  };

  // Function to process image URLs
  const processImageUrl = (imageUrl) => {
    if (!imageUrl) return null;
    
    // If it's already an absolute URL
    if (imageUrl.startsWith('http')) {
      return imageUrl;
    }
    
    // If it's a relative URL starting with /
    if (imageUrl.startsWith('/')) {
      return `${API_BASE_URL}${imageUrl}`;
    }
    
    // If it's a file path (starting with ./ or uploads/)
    if (imageUrl.startsWith('./') || imageUrl.startsWith('uploads/')) {
      return `${API_BASE_URL}/${imageUrl.replace(/^\.\//, '')}`;
    }
    
    // Default fallback
    return `${API_BASE_URL}/${imageUrl}`;
  };

  useEffect(() => {
    const user = getCurrentUser();
    if (!user) {
      // If not logged in, redirect to login page
      navigate('/login');
      return;
    }

    const fetchJournals = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Get user's journals by passing the user ID
        const journalsData = await JournalService.getAllJournals(user.id);
        console.log("Fetched journals:", journalsData);
        setJournals(journalsData || []);
        
        // Process image URLs for all journals
        const imageUrls = {};
        for (const journal of journalsData || []) {
          console.log(`Processing journal ${journal.id} with image URL:`, 
            journal.coverImageURL || journal.coverImageUrl || journal.cover_imageurl);
            
          const imageKey = journal.coverImageURL || journal.coverImageUrl || journal.cover_imageurl;
          if (imageKey) {
            imageUrls[journal.id] = processImageUrl(imageKey);
          }
        }
        setJournalImages(imageUrls);
        console.log("Processed image URLs:", imageUrls);
        
      } catch (error) {
        console.error('Error fetching journals:', error);
        setError('Failed to load journals. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchJournals();
  }, [navigate]);

  const handleDelete = async (e, id) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (window.confirm('Are you sure you want to delete this journal?')) {
      try {
        console.log("Deleting journal ID:", id);
        await JournalService.deleteJournal(id);
        console.log("Journal deleted successfully");
        setJournals(journals.filter(journal => journal.id !== id));
      } catch (error) {
        console.error('Error deleting journal:', error);
        console.error('Status:', error.response?.status);
        console.error('Error data:', error.response?.data);
        setError(`Failed to delete journal: ${error.response?.data?.message || error.message}`);
      }
    }
  };

  const handleJournalClick = (journalId) => {
    navigate(`/journals/${journalId}/edit`);
  };
  
  return (
    <main className="content">
      <div className="page-header">
        <h1 className="page-title">My Travel Journals</h1>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="journals-container">
        {loading ? (
          <div className="loading-state">Loading journals...</div>
        ) : journals.length > 0 ? (
          <div className="journals-grid">
            {journals.map(journal => (
              <div 
                className="journal-card" 
                key={journal.id}
                onClick={() => handleJournalClick(journal.id)}
              >
                <div 
                  className="journal-cover" 
                  style={journalImages[journal.id] ? 
                    { backgroundImage: `url(${journalImages[journal.id]})` } : {}}
                >
                  {!journalImages[journal.id] && (
                    <div className="no-cover">
                      <span>No Cover Image</span>
                    </div>
                  )}
                </div>
                <div className="journal-content">
                  <h2 className="journal-title">{journal.title}</h2>
                  <p className="journal-description">{journal.description}</p>
                  <div className="journal-actions">
                    <Link 
                      to={`/journals/${journal.id}/edit`} 
                      className="btn btn-edit btn-sm"
                      onClick={(e) => e.stopPropagation()}
                    >
                      View
                    </Link>
                    <button 
                      className="btn btn-delete btn-sm"
                      onClick={(e) => handleDelete(e, journal.id)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <div className="empty-state-icon">📔</div>
            <p className="empty-state-message">
              You haven't created any travel journals yet
            </p>
            <Link to="/journals/new" className="btn btn-primary">
              Create Your First Journal
            </Link>
          </div>
        )}
      </div>
    </main>
  );
};

export default JournalList;