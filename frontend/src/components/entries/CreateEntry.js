import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { EntryService } from '../../services/api';
import birdImage from '../../images/bird.png';
import './CreateEntry.css';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const CreateEntry = () => {
  const { journalId } = useParams();
  const [entry, setEntry] = useState({
    title: '',
    description: '',
    location: '',
    coordinates: { lat: 20, lng: 0 } 
  });
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('details');
  const navigate = useNavigate();
  
  // Refs for map and marker
  const mapRef = useRef(null);
  const markerRef = useRef(null);
  const mapContainerRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEntry(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Initialize map when the location tab becomes active
  useEffect(() => {
    if (activeTab === 'location' && !mapRef.current && mapContainerRef.current) {
      // Initialize the map
      const mapInstance = L.map(mapContainerRef.current).setView([entry.coordinates.lat, entry.coordinates.lng], 2);
      
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }).addTo(mapInstance);
      
      // Create marker
      const markerInstance = L.marker([entry.coordinates.lat, entry.coordinates.lng], {
        draggable: true
      }).addTo(mapInstance);
      
      // Update coordinates when marker is dragged
      markerInstance.on('dragend', function() {
        const position = markerInstance.getLatLng();
        setEntry(prev => ({
          ...prev,
          coordinates: { lat: position.lat, lng: position.lng }
        }));
        reverseGeocode(position);
      });
      
      // Update marker position when map is clicked
      mapInstance.on('click', function(e) {
        markerInstance.setLatLng(e.latlng);
        setEntry(prev => ({
          ...prev,
          coordinates: { lat: e.latlng.lat, lng: e.latlng.lng }
        }));
        reverseGeocode(e.latlng);
      });
      
      mapRef.current = mapInstance;
      markerRef.current = markerInstance;

      // Clean up on unmount
      return () => {
        if (mapRef.current) {
          mapRef.current.remove();
          mapRef.current = null;
          markerRef.current = null;
        }
      };
    }
  }, [activeTab, entry.coordinates.lat, entry.coordinates.lng]);

  // Update the map when switching back to location tab
  useEffect(() => {
    if (activeTab === 'location' && mapRef.current) {
      mapRef.current.invalidateSize();
    }
  }, [activeTab]);

  // Update marker when coordinates change
  useEffect(() => {
    if (mapRef.current && markerRef.current) {
      markerRef.current.setLatLng([entry.coordinates.lat, entry.coordinates.lng]);
      mapRef.current.setView([entry.coordinates.lat, entry.coordinates.lng], mapRef.current.getZoom());
    }
  }, [entry.coordinates]);

  const handleLocationSearch = async (e) => {
    const value = e.target.value;
    setEntry(prev => ({ ...prev, location: value }));
    
    // Clear any existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    
    // Only search if the value is not empty and has at least 3 characters
    if (value && value.length > 2) {
      // Add debounce to avoid too many requests
      typingTimeoutRef.current = setTimeout(async () => {
        try {
          console.log("Searching for:", value);
          // Use backend geocoding endpoint
          const response = await EntryService.geocodeLocation(value);
          console.log("Got geocoding response:", response);
          
          if (response && response.lat && response.lng) {
            console.log("Setting new coordinates:", response.lat, response.lng);
            // Update entry coordinates
            setEntry(prev => ({
              ...prev,
              coordinates: { lat: response.lat, lng: response.lng },
              location: response.displayName || value
            }));
            
            // Update map view and marker position directly
            if (mapRef.current && markerRef.current) {
              console.log("Updating map view and marker");
              markerRef.current.setLatLng([response.lat, response.lng]);
              mapRef.current.setView([response.lat, response.lng], 12);
            }
          }
        } catch (error) {
          console.error('Geocoding error:', error);
        }
      }, 500); // 500ms delay
    }
  };
  
  // Reverse geocoding function
  const reverseGeocode = async (latlng) => {
    try {
      // Use your backend geocoding endpoint for reverse geocoding
      const response = await fetch(
        `/api/geocode/reverse?lat=${latlng.lat}&lng=${latlng.lng}`
      );
      
      if (response.ok) {
        const data = await response.json();
        if (data.displayName) {
          setEntry(prev => ({
            ...prev,
            location: data.displayName
          }));
        }
      }
    } catch (error) {
      console.error('Reverse geocoding error:', error);
    }
  };

  const handleImageChange = (e) => {
    if (e.target.files) {
      const newImages = Array.from(e.target.files).map(file => ({
        file,
        preview: URL.createObjectURL(file),
        description: ''
      }));
      
      setImages(prev => [...prev, ...newImages]);
    }
  };

  const handleImageDescriptionChange = (index, value) => {
    const updatedImages = [...images];
    updatedImages[index].description = value;
    setImages(updatedImages);
  };

  const removeImage = (index) => {
    const updatedImages = [...images];
    URL.revokeObjectURL(updatedImages[index].preview);
    updatedImages.splice(index, 1);
    setImages(updatedImages);
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // 1. First create the entry
      const entryData = {
        title: entry.title,
        content: entry.description,
        locationName: entry.location, 
        latitude: entry.coordinates.lat,  
        longitude: entry.coordinates.lng,  
        journalId: journalId,
        createdAt: new Date().toISOString(),
      };
      
      const createdEntry = await EntryService.createEntry(entryData);
      
      // 2. Then upload images if entry was created
      if (images.length > 0 && createdEntry?.id) {
        await Promise.all(images.map(async (image) => {
          await EntryService.uploadEntryImage(
            createdEntry.id,
            image.file,
            image.description,
            journalId
          );
        }));
      }
      
      navigate(`/journals/${journalId}/edit`);
    } catch (error) {
      console.error('Submission error:', {
        error: error.response?.data || error.message
      });
      alert(`Error: ${error.response?.data?.message || 'Failed to create entry'}`);
    } finally {
      setLoading(false);
    }
  };

  
  return (
    <div className="create-entry-container">
      <div className="content-wrapper">
        <div className="create-entry-header">
          <h1 className="page-title">Add new memory</h1>
        </div>

        <div className="create-entry-card">
          <div className="form-tabs">
            <button 
              className={`tab-button ${activeTab === 'details' ? 'active' : ''}`}
              onClick={() => setActiveTab('details')}
            >
              Details
            </button>
            <button 
              className={`tab-button ${activeTab === 'location' ? 'active' : ''}`}
              onClick={() => setActiveTab('location')}
            >
              Location
            </button>
            <button 
              className={`tab-button ${activeTab === 'photos' ? 'active' : ''}`}
              onClick={() => setActiveTab('photos')}
            >
              Photos
            </button>
          </div>

          <form className="create-form" onSubmit={handleSubmit}>
            {/* Details Tab */}
            <div className={`form-tab-content ${activeTab === 'details' ? 'active' : ''}`}>
              <div className="form-group">
                <label className="form-label">Title</label>
                <input
                  type="text"
                  className="form-input"
                  name="title"
                  placeholder="Day 1: Exploring the City"
                  value={entry.title}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea
                  className="form-textarea"
                  name="description"
                  placeholder="Write about your experience..."
                  value={entry.description}
                  onChange={handleChange}
                ></textarea>
              </div>
              
              <div className="navigation-buttons">
                <button type="button" className="next-button" onClick={() => setActiveTab('location')}>
                  Next: Add Location
                </button>
              </div>
            </div>

            {/* Location Tab */}
            <div className={`form-tab-content ${activeTab === 'location' ? 'active' : ''}`}>
              <div className="form-group">
                <label className="form-label">Location</label>
                <input
                  type="text"
                  className="form-input"
                  name="location"
                  placeholder="Paris, France"
                  value={entry.location}
                  onChange={handleLocationSearch}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Pin on Map</label>
                <div ref={mapContainerRef} className="map-container"></div>
                <p className="map-hint">Click on the map to place a pin or search a location above</p>
              </div>
              
              <div className="navigation-buttons">
                <button type="button" className="back-button" onClick={() => setActiveTab('details')}>
                  Back
                </button>
                <button type="button" className="next-button" onClick={() => setActiveTab('photos')}>
                  Next: Add Photos
                </button>
              </div>
            </div>

            {/* Photos Tab */}
            <div className={`form-tab-content ${activeTab === 'photos' ? 'active' : ''}`}>
              <div className="form-group">
                <label className="form-label">Photos</label>
                <div className="file-upload">
                  <label className="upload-label">
                    <span className="upload-icon">+</span>
                    Upload photos
                    <input
                      type="file"
                      name="images"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="file-input"
                      multiple
                    />
                  </label>
                </div>

                {images.length > 0 && (
                  <div className="images-preview-container">
                    {images.map((image, index) => (
                      <div key={index} className="image-item">
                        <div 
                          className="image-preview" 
                          style={{ backgroundImage: `url(${image.preview})` }}
                        >
                          <button 
                            type="button" 
                            className="remove-image" 
                            onClick={() => removeImage(index)}
                          >
                            ×
                          </button>
                        </div>
                        <textarea
                          className="image-description"
                          placeholder="Optional description for this photo"
                          value={image.description}
                          onChange={(e) => handleImageDescriptionChange(index, e.target.value)}
                        ></textarea>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              <div className="navigation-buttons">
                <button type="button" className="back-button" onClick={() => setActiveTab('location')}>
                  Back
                </button>
              </div>
            </div>

            <div className="form-actions">
              <button 
                type="button"
                className="btn btn-secondary"
                onClick={() => navigate(`/journals/${journalId}`)}
              >
                Cancel
              </button>
              <button 
                type="submit"
                className="btn btn-primary"
                disabled={loading}
              >
                {loading ? 'Saving...' : 'Save Memory'}
              </button>
            </div>
          </form>
          
          {/* Progress indicator */}
          <div className="progress-indicator">
            <div className={`progress-step ${activeTab === 'details' || activeTab === 'location' || activeTab === 'photos' ? 'active' : ''}`}></div>
            <div className={`progress-step ${activeTab === 'location' || activeTab === 'photos' ? 'active' : ''}`}></div>
            <div className={`progress-step ${activeTab === 'photos' ? 'active' : ''}`}></div>
          </div>
        </div>
        
        <div className="preview-panel">
          <div className="preview-header">
            <h3>Memory Preview</h3>
          </div>
          <div className="memory-preview">
            <div className="preview-title">{entry.title || "Your Memory Title"}</div>
            <div className="preview-location">{entry.location || "Location will appear here"}</div>
            <div className="preview-description">{entry.description || "Your memory description will appear here as you type..."}</div>
            {images.length > 0 && (
              <div className="preview-photos">
                <div className="photos-count">{images.length} Photo{images.length !== 1 ? 's' : ''}</div>
                <div className="preview-thumbnails">
                  {images.slice(0, 3).map((image, index) => (
                    <div 
                      key={index} 
                      className="preview-thumbnail"
                      style={{ backgroundImage: `url(${image.preview})` }}
                    />
                  ))}
                  {images.length > 3 && (
                    <div className="more-photos">+{images.length - 3}</div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateEntry;