import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { EntryService } from '../../services/api';
import './ViewEntry.css';

const ViewEntry = () => {
  const { journalId, entryId } = useParams();
  const [entry, setEntry] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeMediaIndex, setActiveMediaIndex] = useState(0);
  const navigate = useNavigate();
  
  useEffect(() => {
    const fetchEntry = async () => {
      try {
        setLoading(true);
        setError(null);
        console.log(`Fetching entry with ID: ${entryId}`);
        
        const entryData = await EntryService.getEntryById(entryId);
        console.log('Entry data received:', entryData);
        
        if (entryData) {
          setEntry(entryData);
        } else {
          setError('Entry not found or returned empty data');
        }
      } catch (error) {
        console.error('Error fetching entry:', error);
        setError(`Failed to load entry data: ${error.response?.data?.message || error.message || 'Unknown error'}`);
      } finally {
        setLoading(false);
      }
    };
    
    if (entryId) {
      fetchEntry();
    } else {
      setError('Invalid entry ID');
      setLoading(false);
    }
  }, [entryId]);
  
  // Process image URLs for display
  const processImageUrl = (url) => {
    if (!url) return '';
    
    console.log('Processing image URL:', url); // Debug log
    
    // If it's already a full URL, return as is
    if (url.startsWith('http')) {
      return url;
    }
    
    // If it starts with /uploads, add the backend base URL
    if (url.startsWith('/uploads')) {
      const fullUrl = `http://localhost:8080${url}`;
      console.log('Converted to full URL:', fullUrl);
      return fullUrl;
    }
    
    // If it starts with /, add the backend base URL
    if (url.startsWith('/')) {
      const fullUrl = `http://localhost:8080${url}`;
      console.log('Converted to full URL:', fullUrl);
      return fullUrl;
    }
    
    // Handle relative paths (just in case)
    const fullUrl = `http://localhost:8080/${url.replace(/^\.\//, '')}`;
    console.log('Converted relative URL:', fullUrl);
    return fullUrl;
  };
  
  const formatDate = (dateString) => {
    if (!dateString) return '';
    
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
    } catch (e) {
      console.error('Error formatting date:', e);
      return dateString; // Return the original string if parsing fails
    }
  };
  
  const handlePrevMedia = () => {
    if (!entry?.mediaAttachments?.length) return;
    
    setActiveMediaIndex(prev => 
      prev === 0 ? entry.mediaAttachments.length - 1 : prev - 1
    );
  };
  
  const handleNextMedia = () => {
    if (!entry?.mediaAttachments?.length) return;
    
    setActiveMediaIndex(prev => 
      prev === entry.mediaAttachments.length - 1 ? 0 : prev + 1
    );
  };

  // Generate map URL for embedded map
  const getMapUrl = (lat, lng) => {
    if (!lat || !lng) return null;
    
    // Using OpenStreetMap embedded iframe with marker
    const zoom = 15;
    const bbox = `${lng - 0.01},${lat - 0.01},${lng + 0.01},${lat + 0.01}`;
    return `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${lat},${lng}`;
  };
  
  if (error) {
    return (
      <div className="entry-view-container">
        <div className="error-message">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="8" x2="12" y2="12"/>
            <line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          {error}
        </div>
        <Link to={`/journals/${journalId}/edit`} className="back-link">
          <svg className="icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path d="M19 12H5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M12 19l-7-7 7-7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Return to journal
        </Link>
      </div>
    );
  }

  if (!entry) {
    return (
      <div className="entry-view-container">
        <div className="error-message">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10"/>
            <line x1="15" y1="9" x2="9" y2="15"/>
            <line x1="9" y1="9" x2="15" y2="15"/>
          </svg>
          Entry not found
        </div>
        <Link to={`/journals/${journalId}/edit`} className="back-link">
          <svg className="icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path d="M19 12H5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M12 19l-7-7 7-7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Return to journal
        </Link>
      </div>
    );
  }

  return (
    <div className="entry-view-container">
      <div className="entry-header">
        <Link to={`/journals/${journalId}/edit`} className="back-link">
          <svg className="icon" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path d="M19 12H5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M12 19l-7-7 7-7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Back to journal
        </Link>
        <h1 className="entry-title">{entry.title}</h1>
        <div className="entry-meta">
          <span className="entry-date">
            <svg className="icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" strokeWidth="2"/>
              <line x1="16" y1="2" x2="16" y2="6" strokeWidth="2"/>
              <line x1="8" y1="2" x2="8" y2="6" strokeWidth="2"/>
              <line x1="3" y1="10" x2="21" y2="10" strokeWidth="2"/>
            </svg>
            {formatDate(entry.createdAt)}
          </span>
          {entry.locationName && (
            <span className="entry-location">
              <svg className="icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <circle cx="12" cy="10" r="3" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              {entry.locationName}
            </span>
          )}
        </div>
      </div>
      
      {entry.mediaAttachments && entry.mediaAttachments.length > 0 && (
        <div className="media-gallery">
          <div className="media-main">
            <img 
              src={processImageUrl(entry.mediaAttachments[activeMediaIndex].url)} 
              alt={entry.mediaAttachments[activeMediaIndex].caption || `Media ${activeMediaIndex + 1}`}
              className="media-image"
              onError={(e) => {
                console.error('Error loading image:', e.target.src);
                e.target.style.display = 'none';
                e.target.nextSibling.style.display = 'flex';
              }}
            />
            <div className="image-error-placeholder" style={{ display: 'none' }}>
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                <circle cx="8.5" cy="8.5" r="1.5"/>
                <polyline points="21,15 16,10 5,21"/>
              </svg>
              <p>Image not available</p>
              <small>{entry.mediaAttachments[activeMediaIndex].url}</small>
            </div>
            
            {entry.mediaAttachments.length > 1 && (
              <>
                <button className="media-nav prev" onClick={handlePrevMedia}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path d="M15 18l-6-6 6-6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
                <button className="media-nav next" onClick={handleNextMedia}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path d="M9 18l6-6-6-6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
              </>
            )}
            
            {entry.mediaAttachments.length > 1 && (
              <div className="media-counter">
                {activeMediaIndex + 1} / {entry.mediaAttachments.length}
              </div>
            )}
          </div>
          
          {entry.mediaAttachments.length > 1 && (
            <div className="media-thumbnails">
              {entry.mediaAttachments.map((media, index) => (
                <div 
                  key={index}
                  className={`thumbnail ${index === activeMediaIndex ? 'active' : ''}`}
                  onClick={() => setActiveMediaIndex(index)}
                >
                  <img 
                    src={processImageUrl(media.url)} 
                    alt={`Thumbnail ${index + 1}`}
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.parentElement.innerHTML = `
                        <div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;background:#f0f0f0;color:#666;font-size:12px;">
                          No Image
                        </div>
                      `;
                    }}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      )}
      
      <div className="entry-content">
        {entry.content ? 
          entry.content.split('\n').map((paragraph, index) => (
            paragraph ? <p key={index}>{paragraph}</p> : <br key={index} />
          )) : 
          <p>No content for this entry.</p>
        }
      </div>
      
      {entry.longitude && entry.latitude && (
        <div className="entry-map">
          <h3 className="map-title">
            <svg className="icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" strokeWidth="2"/>
              <circle cx="12" cy="10" r="3" strokeWidth="2"/>
            </svg>
            Location
          </h3>
          <div className="map-container">
            {getMapUrl(parseFloat(entry.latitude), parseFloat(entry.longitude)) ? (
              <>
                <iframe
                  src={getMapUrl(parseFloat(entry.latitude), parseFloat(entry.longitude))}
                  width="100%"
                  height="250"
                  style={{ border: 0, borderRadius: '10px' }}
                  allowFullScreen=""
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title={`Map showing ${entry.locationName}`}
                />
                <div className="map-overlay">
                  <div className="map-info">
                    <svg className="map-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" strokeWidth="2"/>
                      <circle cx="12" cy="10" r="3" strokeWidth="2"/>
                    </svg>
                    <div>
                      <span>{entry.locationName}</span>
                      <small className="coordinates">{entry.latitude}, {entry.longitude}</small>
                    </div>
                  </div>
                  <a 
                    href={`https://www.google.com/maps?q=${entry.latitude},${entry.longitude}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="open-in-maps"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"/>
                      <polyline points="15,3 21,3 21,9"/>
                      <line x1="10" y1="14" x2="21" y2="3"/>
                    </svg>
                    Open in Maps
                  </a>
                </div>
              </>
            ) : (
              <div className="map-placeholder">
                <svg className="map-icon" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" strokeWidth="2"/>
                  <circle cx="12" cy="10" r="3" strokeWidth="2"/>
                </svg>
                <span>{entry.locationName}</span>
                <span className="coordinates">{entry.latitude}, {entry.longitude}</span>
                <a 
                  href={`https://www.google.com/maps?q=${entry.latitude},${entry.longitude}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="open-in-maps"
                >
                  View on Google Maps
                </a>
              </div>
            )}
          </div>
        </div>
      )}
      
      <div className="entry-actions">
        <button 
          className="back-btn"
          onClick={() => navigate(`/journals/${journalId}/edit`)}
        >
          <svg className="icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path d="M19 12H5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M12 19l-7-7 7-7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Back to Journal
        </button>
        <button 
          className="edit-btn"
          onClick={() => navigate(`/journals/${journalId}/entries/${entryId}/edit`)}
        >
          <svg className="icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Edit Entry
        </button>
      </div>
    </div>
  );
};

export default ViewEntry;