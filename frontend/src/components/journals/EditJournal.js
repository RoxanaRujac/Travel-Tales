import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { JournalService, EntryService } from '../../services/api';
import birdImage from '../../images/bird.png';
import './EditJournal.css';

const EditJournal = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [journal, setJournal] = useState(null);
  const [entries, setEntries] = useState([]);
  const [coverImage, setCoverImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Get the current user from localStorage
  const getCurrentUser = () => {
    const userStr = localStorage.getItem('user');
    if (!userStr) return null;
    return JSON.parse(userStr);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Get journal data 
        const journalData = await JournalService.getJournalById(id);
        setJournal(journalData);
        
        if (journalData.coverImageURL) {
          setPreview(journalData.coverImageURL);
        }
  
        // Fetch entries for this journal
        const entriesData = await EntryService.getEntriesByJournalId(id);
        setEntries(entriesData || []);
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('Failed to load journal data. Please try again.');
      } finally {
        setLoading(false);
      }
    };
  
    fetchData();
  }, [id]);

  if (loading) {
    return <div className="loading">Loading journal data...</div>;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  if (!journal) {
    return <div className="error-message">Journal not found.</div>;
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setJournal(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    if (e.target.files[0]) {
      const file = e.target.files[0];
      setCoverImage(file);
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!journal?.id) {
      console.error('Journal ID is missing');
      return;
    }

    setLoading(true);
    
    try {
      // Update journal details
      const updatedJournal = await JournalService.updateJournal(journal);
      
      // Upload cover image if provided
      if (coverImage) {
        const formData = new FormData();
        formData.append('file', coverImage);
        await JournalService.uploadCoverImage(journal.id, formData);
      }
      
      navigate('/journals');
    } catch (error) {
      console.error('Error updating journal:', error);
      setError('Failed to update journal. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  return (
    <div className="edit-journal-page">
      <div className="content">
        
        <div className="edit-journal-layout">
          {/* Left side: Journal Edit Form */}
          <div className="edit-form-container">
            <div className="form-container">
              {/* Container for bird and speech bubble */}
              <div className="bird-speech-container">
                <div className="tip-box">
                  Tip: Keep your descriptions vivid and detailed!
                </div>
                <img src={birdImage} alt="Small colorful bird" className="bird-image" />
              </div>

              <div className="edit-form">
                <form onSubmit={handleSubmit}>
                  <input type="hidden" name="id" value={journal.id} />
                  <input type="hidden" name="userId" value={journal.userId || getCurrentUser()?.id} />
                  <input type="hidden" name="createdAt" value={journal.createdAt} />

                  <div className="form-group">
                    <label className="form-label">Title</label>
                    <input
                      type="text"
                      className="form-input"
                      name="title"
                      value={journal.title}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Cover image</label>
                    <div className="file-upload">
                      <label className="upload-label">
                        {preview ? 'Change image' : 'Upload new image (optional)'}
                        <input
                          type="file"
                          name="coverImageFile"
                          accept="image/*"
                          onChange={handleFileChange}
                        />
                      </label>
                    </div>
                    {preview && (
                      <div className="image-preview-container">
                        <img src={preview} alt="Current cover" className="image-preview" />
                      </div>
                    )}
                  </div>

                  <div className="form-group">
                    <label className="form-label">Description</label>
                    <textarea
                      className="form-textarea"
                      name="description"
                      value={journal.description}
                      onChange={handleChange}
                    ></textarea>
                  </div>

                  <div className="btn-container">
                    <button type="submit" className="btn btn-primary" disabled={loading}>
                      {loading ? 'Updating...' : 'Update'}
                    </button>
                    <button type="button" className="btn" onClick={() => navigate('/journals')}>
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>

          {/* Right side: Journal Entries */}
          <div className="entries-container">
            <div className="entries-section">
              <div className="entries-section-title">Journal Entries</div>

              <button
                className="add-entry-btn"
                onClick={() => navigate(`/journals/${journal.id}/entries/new`)}
              >
                + Add New Entry
              </button>

              <div className="entries-grid">
                {entries && entries.length > 0 ? (
                  entries.map(entry => (
                    <div
                      key={entry.id}
                      className="entry-card"
                      onClick={() => navigate(`/journals/${journal.id}/entries/${entry.id}`)}
                    >
                      <div className="entry-details">
                        <div className="entry-title">{entry.title}</div>
                        {entry.createdAt && (
                          <div className="entry-date">{formatDate(entry.createdAt)}</div>
                        )}
                        {entry.content && (
                          <div className="entry-preview">
                            {entry.content.length > 100
                              ? `${entry.content.substring(0, 100)}...`
                              : entry.content}
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="no-entries">
                    <p>No entries found for this journal. Click "Add New Entry" to get started!</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditJournal;