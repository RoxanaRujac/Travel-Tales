import React, { useState, useEffect } from 'react';
import { PostcardService, UserService } from '../../services/api';
import './Notifications.css';

const Notifications = () => {
  const [receivedPostcards, setReceivedPostcards] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedPostcard, setExpandedPostcard] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [selectedPostcard, setSelectedPostcard] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Get current user from localStorage
  const getCurrentUser = () => {
    const userStr = localStorage.getItem('user');
    if (!userStr) return null;
    return JSON.parse(userStr);
  };

  // Fetch received postcards
  useEffect(() => {
    const fetchReceivedPostcards = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const user = getCurrentUser();
        if (!user) {
          setError('You must be logged in to view notifications');
          return;
        }
        
        setCurrentUser(user);
        
        // Fetch postcards received by the current user
        const postcards = await PostcardService.getPostcardsReceivedByUser(user.id);
        console.log('Received postcards:', postcards);
        
        // Sort by most recent first (if you have timestamps)
        const sortedPostcards = Array.isArray(postcards) 
          ? postcards.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
          : [];
        
        setReceivedPostcards(sortedPostcards);
      } catch (err) {
        console.error('Error fetching received postcards:', err);
        setError('Failed to load your postcards. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchReceivedPostcards();
  }, []);

  // Toggle expanded view of a postcard
  const toggleExpandPostcard = (postcardId) => {
    setExpandedPostcard(expandedPostcard === postcardId ? null : postcardId);
  };

  // Open postcard modal
  const openPostcardModal = (postcard) => {
    setSelectedPostcard(postcard);
    setCurrentImageIndex(0);
    document.body.style.overflow = 'hidden'; // Prevent background scrolling
  };

  // Close postcard modal
  const closePostcardModal = () => {
    setSelectedPostcard(null);
    setCurrentImageIndex(0);
    document.body.style.overflow = 'unset'; // Restore scrolling
  };

  // Navigate to next image
  const nextImage = () => {
    if (selectedPostcard && selectedPostcard.photoUrls) {
      setCurrentImageIndex((prev) => 
        prev === selectedPostcard.photoUrls.length - 1 ? 0 : prev + 1
      );
    }
  };

  // Navigate to previous image
  const prevImage = () => {
    if (selectedPostcard && selectedPostcard.photoUrls) {
      setCurrentImageIndex((prev) => 
        prev === 0 ? selectedPostcard.photoUrls.length - 1 : prev - 1
      );
    }
  };

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (!selectedPostcard) return;
      
      if (e.key === 'Escape') {
        closePostcardModal();
      } else if (e.key === 'ArrowRight') {
        nextImage();
      } else if (e.key === 'ArrowLeft') {
        prevImage();
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [selectedPostcard]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  // Process image URLs for display
  const processImageUrl = (url) => {
    if (!url) return '';
    
    if (url.startsWith('http')) {
      return url;
    }
    
    if (url.startsWith('/')) {
      return `http://localhost:8080${url}`;
    }
    
    return `http://localhost:8080/${url.replace(/^\.\//, '')}`;
  };

  // Format sender name
  const getSenderName = (sender) => {
    if (!sender) return 'Unknown Sender';
    return sender.name || sender.username || 'Anonymous';
  };

  // Delete a postcard (optional functionality)
  const deletePostcard = async (postcardId) => {
    if (!window.confirm('Are you sure you want to delete this postcard?')) {
      return;
    }

    try {
      await PostcardService.deletePostcard(postcardId);
      setReceivedPostcards(prev => prev.filter(p => p.id !== postcardId));
      setExpandedPostcard(null);
    } catch (err) {
      console.error('Error deleting postcard:', err);
      alert('Failed to delete postcard. Please try again.');
    }
  };

  if (isLoading) {
    return (
      <div className="notifications-page">
        <div className="notifications-header">
          <h1>Your Postcards</h1>
          <p>Loading your received postcards...</p>
        </div>
        <div className="loading-spinner">
          <div className="spinner"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="notifications-page">
        <div className="notifications-header">
          <h1>Your Postcards</h1>
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
    <div className="notifications-page">
      <div className="notifications-header">
        <h1>Your Postcards</h1>
        <p>
          {receivedPostcards.length === 0 
            ? "No postcards received yet" 
            : `You have ${receivedPostcards.length} postcard${receivedPostcards.length !== 1 ? 's' : ''}`
          }
        </p>
      </div>

      {receivedPostcards.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">
            <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
              <line x1="16" y1="2" x2="16" y2="6"/>
              <line x1="8" y1="2" x2="8" y2="6"/>
              <line x1="3" y1="10" x2="21" y2="10"/>
              <path d="M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01M16 18h.01"/>
            </svg>
          </div>
          <h3>No Postcards Yet</h3>
          <p>When friends send you postcards, they'll appear here.</p>
        </div>
      ) : (
        <div className="postcards-grid">
          {receivedPostcards.map((postcard) => (
            <div key={postcard.id} className="postcard-notification">
              <div 
                className="postcard-preview"
                onClick={() => openPostcardModal(postcard)}
                style={{ cursor: 'pointer' }}
              >
                <div className="postcard-images">
                  {postcard.photoUrls && postcard.photoUrls.length > 0 ? (
                    postcard.photoUrls.slice(0, 4).map((url, index) => (
                      <img 
                        key={index}
                        src={processImageUrl(url)} 
                        alt={`Postcard image ${index + 1}`}
                        className="postcard-thumbnail"
                      />
                    ))
                  ) : (
                    <div className="no-image-placeholder">
                      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                        <circle cx="8.5" cy="8.5" r="1.5"/>
                        <polyline points="21,15 16,10 5,21"/>
                      </svg>
                    </div>
                  )}
                </div>
                
                <div className="postcard-info">
                  <div className="postcard-sender">
                    <strong>From: {getSenderName(postcard.sender)}</strong>
                  </div>
                  
                  <div className="postcard-message-preview">
                    {postcard.description ? (
                      expandedPostcard === postcard.id ? (
                        <p className="full-message">{postcard.description}</p>
                      ) : (
                        <p className="preview-message">
                          {postcard.description.length > 100 
                            ? `${postcard.description.substring(0, 100)}...` 
                            : postcard.description
                          }
                        </p>
                      )
                    ) : (
                      <p className="no-message">No message</p>
                    )}
                  </div>
                  
                  <div className="postcard-actions">
                    {postcard.description && postcard.description.length > 100 && (
                      <button 
                        className="action-button expand"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleExpandPostcard(postcard.id);
                        }}
                      >
                        {expandedPostcard === postcard.id ? 'Show Less' : 'Read More'}
                      </button>
                    )}
                    
                    <button 
                      className="action-button delete"
                      onClick={(e) => {
                        e.stopPropagation();
                        deletePostcard(postcard.id);
                      }}
                      title="Delete postcard"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="3,6 5,6 21,6"/>
                        <path d="M19,6v14a2,2,0,0,1-2,2H7a2,2,0,0,1-2-2V6m3,0V4a2,2,0,0,1,2-2h4a2,2,0,0,1,2,2v2"/>
                        <line x1="10" y1="11" x2="10" y2="17"/>
                        <line x1="14" y1="11" x2="14" y2="17"/>
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
              
              {postcard.photoUrls && postcard.photoUrls.length > 4 && (
                <div className="more-images-indicator">
                  +{postcard.photoUrls.length - 4} more photos
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Postcard Modal */}
      {selectedPostcard && (
        <div className="postcard-modal-overlay" onClick={closePostcardModal}>
          <div className="postcard-modal" onClick={(e) => e.stopPropagation()}>
            {/* Modal Header */}
            <div className="modal-header">
              <div className="modal-sender-info">
                <h3>Postcard from {getSenderName(selectedPostcard.sender)}</h3>
                <p>
                  {selectedPostcard.photoUrls ? selectedPostcard.photoUrls.length : 0} photo
                  {selectedPostcard.photoUrls && selectedPostcard.photoUrls.length !== 1 ? 's' : ''}
                </p>
              </div>
              <button className="modal-close-button" onClick={closePostcardModal}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18"/>
                  <line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>

            {/* Image Display Area */}
            {selectedPostcard.photoUrls && selectedPostcard.photoUrls.length > 0 ? (
              <div className="modal-image-container">
                <img 
                  src={processImageUrl(selectedPostcard.photoUrls[currentImageIndex])} 
                  alt={`Postcard image ${currentImageIndex + 1}`}
                  className="modal-main-image"
                />
                
                {/* Navigation Arrows */}
                {selectedPostcard.photoUrls.length > 1 && (
                  <>
                    <button className="image-nav-button prev" onClick={prevImage}>
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="15,18 9,12 15,6"/>
                      </svg>
                    </button>
                    <button className="image-nav-button next" onClick={nextImage}>
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="9,18 15,12 9,6"/>
                      </svg>
                    </button>
                  </>
                )}

                {/* Image Counter */}
                {selectedPostcard.photoUrls.length > 1 && (
                  <div className="image-counter">
                    {currentImageIndex + 1} / {selectedPostcard.photoUrls.length}
                  </div>
                )}
              </div>
            ) : (
              <div className="modal-no-images">
                <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                  <circle cx="8.5" cy="8.5" r="1.5"/>
                  <polyline points="21,15 16,10 5,21"/>
                </svg>
                <p>No images in this postcard</p>
              </div>
            )}

            {/* Thumbnail Strip */}
            {selectedPostcard.photoUrls && selectedPostcard.photoUrls.length > 1 && (
              <div className="modal-thumbnails">
                {selectedPostcard.photoUrls.map((url, index) => (
                  <img
                    key={index}
                    src={processImageUrl(url)}
                    alt={`Thumbnail ${index + 1}`}
                    className={`modal-thumbnail ${index === currentImageIndex ? 'active' : ''}`}
                    onClick={() => setCurrentImageIndex(index)}
                  />
                ))}
              </div>
            )}

            {/* Message Area */}
            <div className="modal-message-area">
              <h4>Message:</h4>
              <p className="modal-message">
                {selectedPostcard.description || 'No message included with this postcard.'}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Notifications;