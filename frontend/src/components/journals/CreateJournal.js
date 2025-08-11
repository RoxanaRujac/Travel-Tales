import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { JournalService } from '../../services/api';
import './CreateJournal.css';

const CreateJournal = () => {
  const [journal, setJournal] = useState({
    title: '',
    description: ''
  });
  const [coverImage, setCoverImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Get current user from localStorage
  const getCurrentUser = () => {
    const userStr = localStorage.getItem('user');
    if (!userStr) return null;
    return JSON.parse(userStr);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setJournal(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleFileChange = (e) => {
    if (e.target.files[0]) {
      const file = e.target.files[0];
      setCoverImage(file);
      
      // Create preview
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
    setError(null);
    
    const currentUser = getCurrentUser();
    if (!currentUser) {
      setError('You must be logged in to create a journal');
      setLoading(false);
      return;
    }
    
    try {
      // Add the user ID to the journal data
      const journalData = {
        ...journal,
        userId: currentUser.id
      };
      
      const response = await JournalService.createJournal(journalData);
      const journalId = response.data?.id || response.id;
    
    if (!journalId) {
      throw new Error('Failed to get journal ID from response');
    }
    
    // If there's a cover image, upload it
    if (coverImage) {
      console.log(`Uploading cover image for journal ID: ${journalId}`);
      const formData = new FormData();
      formData.append('file', coverImage);
      
      const imageResponse = await JournalService.uploadCoverImage(journalId, formData);
      console.log('Image upload response:', imageResponse);
    }
    
    navigate('/journals');
  } catch (err) {
    console.error('Error creating journal:', err);
    setError('Failed to create journal. Please try again.');
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="create-journal-container">
      <div className="journal-header">
        <h1>Create New Journal</h1>
        <p>Document your travels and adventures in a beautiful way</p>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="journal-form-wrapper">
        <form className="journal-form" onSubmit={handleSubmit}>
          <div className="form-section">
            <h2 className="section-title">Journal Details</h2>
            
            <div className="form-group">
              <label className="form-label">Title</label>
              <input
                type="text"
                className="form-input"
                name="title"
                placeholder="My Amazing Adventure"
                value={journal.title}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Description</label>
              <textarea
                className="form-textarea"
                name="description"
                placeholder="Write a brief description of your journey..."
                value={journal.description}
                onChange={handleChange}
              ></textarea>
            </div>
          </div>
          
          <div className="form-section">
            <h2 className="section-title">Cover Image</h2>
            <div className="cover-image-container">
              <div className="cover-preview">
                {preview ? (
                  <div className="preview-image" style={{ backgroundImage: `url(${preview})` }}></div>
                ) : (
                  <div className="empty-preview">
                    <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <rect x="3" y="3" width="18" height="18" rx="2" />
                      <circle cx="8.5" cy="8.5" r="1.5" />
                      <path d="M20 15l-5-5L5 20" />
                    </svg>
                    <p>No cover image selected</p>
                  </div>
                )}
              </div>
              
              <div className="upload-controls">
                <label className="upload-button">
                  {preview ? 'Change Image' : 'Upload Cover Image'}
                  <input
                    type="file"
                    name="coverImageFile"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="file-input"
                  />
                </label>
                
                {preview && (
                  <button
                    type="button"
                    className="remove-button"
                    onClick={() => {
                      setPreview(null);
                      setCoverImage(null);
                    }}
                  >
                    Remove Image
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="form-actions">
            <button 
              type="button"
              className="cancel-button"
              onClick={() => navigate('/journals')}
            >
              Cancel
            </button>
            <button 
              type="submit"
              className="save-button"
              disabled={loading}
            >
              {loading ? 'Saving...' : 'Create Journal'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateJournal;