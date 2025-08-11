import React, { useState, useEffect } from 'react';
import { JournalService, EntryService, UserService, PostcardService } from '../../services/api';
import './PostcardCreator.css';

const PostcardCreator = () => {
  // State for all the data we need
  const [journals, setJournals] = useState([]);
  const [selectedJournal, setSelectedJournal] = useState(null);
  const [entries, setEntries] = useState([]);
  const [selectedEntry, setSelectedEntry] = useState(null);
  const [selectedImages, setSelectedImages] = useState([]);
  const [message, setMessage] = useState('');
  const [recipient, setRecipient] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [step, setStep] = useState(1);
  const [users, setUsers] = useState([]);

  // Get current user from localStorage
  const getCurrentUser = () => {
    const userStr = localStorage.getItem('user');
    if (!userStr) return null;
    return JSON.parse(userStr);
  };

  // Fetch journals and users on component mount
  useEffect(() => {
    const fetchInitialData = async () => {
      setIsLoading(true);
      try {
        const currentUser = getCurrentUser();
        if (!currentUser) {
          setError('You must be logged in to create a postcard');
          return;
        }
        
        // Fetch journals
        const journalData = await JournalService.getAllJournals(currentUser.id);
        console.log('Journals loaded:', journalData);
        setJournals(journalData);
        
        // Fetch users
        const userData = await UserService.getAllUsers();
        console.log('Users loaded:', userData);
        
        // Filter out the current user from the list
        const filteredUsers = userData.filter(user => user.id !== currentUser.id);
        setUsers(filteredUsers);
      } catch (err) {
        setError('Failed to load initial data. Please try again.');
        console.error('Error fetching initial data:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchInitialData();
  }, []);

  // Fetch entries when a journal is selected
  useEffect(() => {
    if (!selectedJournal) {
      setEntries([]);
      setSelectedEntry(null);
      return;
    }

    const fetchEntries = async () => {
      setIsLoading(true);
      try {
        console.log(`Fetching entries for journal ID: ${selectedJournal}`);
        
        // Use the proper method to get entries by journal ID
        const entriesData = await EntryService.getEntriesByJournalId(selectedJournal);
        console.log('Entries loaded:', entriesData);
        
        if (Array.isArray(entriesData)) {
          setEntries(entriesData);
        } else {
          console.error('Unexpected response format for entries:', entriesData);
          setEntries([]);
          setError('Unexpected data format received for entries');
        }
      } catch (err) {
        setError('Failed to load entries. Please try again.');
        console.error('Error fetching entries:', err);
        setEntries([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchEntries();
  }, [selectedJournal]);

  // Get media when an entry is selected
  useEffect(() => {
    if (!selectedEntry) {
      setSelectedImages([]);
      return;
    }

    const fetchEntryDetails = async () => {
      setIsLoading(true);
      try {
        console.log(`Fetching details for entry ID: ${selectedEntry}`);
        const entryDetails = await EntryService.getEntryById(selectedEntry);
        console.log('Entry details loaded:', entryDetails);
        
        // Assuming the entry has a mediaAttachments property
        if (entryDetails.mediaAttachments && Array.isArray(entryDetails.mediaAttachments)) {
          // Filter to only include images (if type exists)
          const images = entryDetails.mediaAttachments.filter(
            media => !media.type || media.type.toLowerCase().includes('photo')
          );
          console.log('Available images:', images);
          
          // We'll see all images but won't select any by default
          setSelectedImages([]);
        } else {
          console.log('No media attachments found or not in expected format');
        }
      } catch (err) {
        setError('Failed to load entry details. Please try again.');
        console.error('Error fetching entry details:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchEntryDetails();
  }, [selectedEntry]);

  // Handle journal selection
  const handleJournalChange = (e) => {
    const journalId = parseInt(e.target.value, 10);
    console.log(`Journal selected: ${journalId}`);
    setSelectedJournal(journalId);
    setSelectedEntry(null);
  };

  // Handle entry selection
  const handleEntryChange = (e) => {
    const entryId = parseInt(e.target.value, 10);
    console.log(`Entry selected: ${entryId}`);
    setSelectedEntry(entryId);
  };

  // Handle image selection
  const handleImageSelection = (image) => {
    setSelectedImages(prevSelectedImages => {
      const isAlreadySelected = prevSelectedImages.some(img => img.id === image.id);
      
      if (isAlreadySelected) {
        return prevSelectedImages.filter(img => img.id !== image.id);
      } else {
        return [...prevSelectedImages, image];
      }
    });
  };

  // Handle message input
  const handleMessageChange = (e) => {
    setMessage(e.target.value);
  };

  // Handle recipient selection
  const handleRecipientChange = (e) => {
    setRecipient(e.target.value);
  };

  // Navigate to next step
  const nextStep = () => {
    setStep(step + 1);
  };

  // Navigate to previous step
  const prevStep = () => {
    setStep(step - 1);
  };

  // Check if current step is complete
  const isStepComplete = () => {
    switch (step) {
      case 1:
        return selectedJournal && selectedEntry;
      case 2:
        return selectedImages.length > 0;
      case 3:
        return recipient && message;
      default:
        return false;
    }
  };

  // Send postcard
  const handleSendPostcard = async (e) => {
    e.preventDefault();
    
    if (!selectedJournal || !selectedEntry || selectedImages.length === 0 || !recipient || !message) {
      setError('Please fill in all fields and select at least one image.');
      return;
    }

    setIsLoading(true);
    setError(null);
    
    try {
      const currentUser = getCurrentUser();
      
      if (!currentUser) {
        setError('You must be logged in to send a postcard.');
        return;
      }
      
      // Get the sender and receiver user objects
      const senderUser = {
        id: currentUser.id,
        name: currentUser.name || currentUser.username
      };
      
      const receiverUser = users.find(user => user.id.toString() === recipient.toString());
      
      if (!receiverUser) {
        setError('Selected recipient not found.');
        return;
      }
      
      // Prepare image URLs (photoUrls should be an array of strings)
      const photoUrls = selectedImages.map(image => image.url);
      
      // Create postcard data object matching your backend model
      const postcardData = {
        sender: {
          id: senderUser.id
        },
        receiver: {
          id: receiverUser.id
        },
        description: message,
        photoUrls: photoUrls
      };
      
      console.log('Sending postcard with data:', postcardData);
      
      // Save the postcard to database
      const savedPostcard = await PostcardService.createPostcard(postcardData);
      console.log('Postcard created successfully:', savedPostcard);
      
      // Success!
      setSuccess(true);
      
      // Reset form after 3 seconds
      setTimeout(() => {
        setSuccess(false);
        setSelectedJournal(null);
        setSelectedEntry(null);
        setSelectedImages([]);
        setMessage('');
        setRecipient('');
        setStep(1);
      }, 3000);
      
    } catch (err) {
      console.error('Error sending postcard:', err);
      setError(err.response?.data?.message || 'Failed to send postcard. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Render step indicators
  const renderStepIndicators = () => {
    return (
      <div className="step-indicators">
        <div className={`step-item ${step >= 1 ? 'active' : ''}`}>
          <div className="step-number">1</div>
          <div className="step-label">Choose Memory</div>
        </div>
        <div className="step-connector"></div>
        <div className={`step-item ${step >= 2 ? 'active' : ''}`}>
          <div className="step-number">2</div>
          <div className="step-label">Select Photos</div>
        </div>
        <div className="step-connector"></div>
        <div className={`step-item ${step >= 3 ? 'active' : ''}`}>
          <div className="step-number">3</div>
          <div className="step-label">Add Message</div>
        </div>
        <div className="step-connector"></div>
        <div className={`step-item ${step >= 4 ? 'active' : ''}`}>
          <div className="step-number">4</div>
          <div className="step-label">Review</div>
        </div>
      </div>
    );
  };

  // Get current user name
  function getCurrentUserName() {
    const user = getCurrentUser();
    return user ? (user.name || user.username || "You") : "You";
  }
  
  // Get recipient name
  function getRecipientName() {
    if (!recipient) return "Recipient";
    const user = users.find(u => u.id.toString() === recipient.toString());
    return user ? (user.name || user.username) : "Recipient";
  }

  // Function to process image URLs for display
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

  return (
    <div className="postcard-creator">
      <div className="postcard-header">
        <h1>Create a Postcard</h1>
        <p>Share your travel memories with friends and family</p>
      </div>
      
      {renderStepIndicators()}
      
      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">Postcard sent successfully!</div>}
      
      <div className="postcard-content">
        {/* Step 1: Select Journal and Entry */}
        {step === 1 && (
          <div className="step-content">
            <div className="step-header">
              <h2>Step 1: Choose a Memory</h2>
              <p>Select a journal and entry to create your postcard from</p>
            </div>
            
            <div className="form-section">
              <label htmlFor="journal-select">
                <span className="form-label-text">Select a Journal</span>
              </label>
              <select 
                id="journal-select" 
                value={selectedJournal || ''} 
                onChange={handleJournalChange}
                disabled={isLoading}
                className="form-select"
              >
                <option value="">-- Select a Journal --</option>
                {journals.map(journal => (
                  <option key={journal.id} value={journal.id}>
                    {journal.title}
                  </option>
                ))}
              </select>
            </div>
            
            {selectedJournal && (
              <div className="form-section">
                <label htmlFor="entry-select">
                  <span className="form-label-text">Select an Entry</span>
                </label>
                <select 
                  id="entry-select" 
                  value={selectedEntry || ''} 
                  onChange={handleEntryChange}
                  disabled={isLoading || entries.length === 0}
                  className="form-select"
                >
                  <option value="">-- Select an Entry --</option>
                  {entries.map(entry => (
                    <option key={entry.id} value={entry.id}>
                      {entry.title || new Date(entry.createdAt).toLocaleDateString()}
                    </option>
                  ))}
                </select>
                
                {entries.length === 0 && selectedJournal && !isLoading && (
                  <div className="info-message">
                    No entries found in this journal.
                  </div>
                )}
                
                {isLoading && (
                  <div className="info-message">
                    Loading entries...
                  </div>
                )}
              </div>
            )}
            
            <div className="step-actions">
              <button 
                className="step-button next"
                onClick={nextStep}
                disabled={!isStepComplete()}
              >
                Continue to Photos
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M9 18l6-6-6-6" />
                </svg>
              </button>
            </div>
          </div>
        )}
        
        {/* Step 2: Select Images */}
        {step === 2 && (
          <div className="step-content">
            <div className="step-header">
              <h2>Step 2: Select Photos</h2>
              <p>Choose one or more photos to include in your postcard</p>
            </div>
            
            <div className="form-section">
              <div className="image-selection-header">
                <label>
                  <span className="form-label-text">Available Photos</span>
                </label>
                <span className="selection-count">{selectedImages.length} selected</span>
              </div>
              
              <div className="image-grid">
                {entries.find(e => e.id === selectedEntry)?.mediaAttachments
                  ?.filter(media => !media.type || media.type.toLowerCase().includes('photo'))
                  .map((media, index) => (
                    <div 
                      key={media.id || index} 
                      className={`image-item ${selectedImages.some(img => img.id === media.id) ? 'selected' : ''}`}
                      onClick={() => handleImageSelection(media)}
                    >
                      <img 
                        src={processImageUrl(media.url)} 
                        alt={media.caption || `Image ${index + 1}`} 
                      />
                      {selectedImages.some(img => img.id === media.id) && (
                        <div className="selection-indicator">✓</div>
                      )}
                      {media.caption && <div className="image-caption">{media.caption}</div>}
                    </div>
                  ))}
              </div>
              
              {(!entries.find(e => e.id === selectedEntry)?.mediaAttachments || 
                entries.find(e => e.id === selectedEntry)?.mediaAttachments.length === 0) && (
                <div className="info-message">
                  No images available for this entry. Please select a different entry.
                </div>
              )}
            </div>
            
            <div className="step-actions">
              <button 
                className="step-button back"
                onClick={prevStep}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M15 18l-6-6 6-6" />
                </svg>
                Back
              </button>
              
              <button 
                className="step-button next"
                onClick={nextStep}
                disabled={!isStepComplete()}
              >
                Continue to Message
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M9 18l6-6-6-6" />
                </svg>
              </button>
            </div>
          </div>
        )}
        
        {/* Step 3: Add Message and Recipient */}
        {step === 3 && (
          <div className="step-content">
            <div className="step-header">
              <h2>Step 3: Compose Your Message</h2>
              <p>Write a message and select who you want to send the postcard to</p>
            </div>
            
            <div className="form-section">
              <label htmlFor="recipient">
                <span className="form-label-text">Select Recipient</span>
              </label>
              <select 
                id="recipient" 
                value={recipient} 
                onChange={handleRecipientChange}
                disabled={isLoading || users.length === 0}
                className="form-select"
              >
                <option value="">-- Select a Recipient --</option>
                {users.map(user => (
                  <option key={user.id} value={user.id}>
                    {user.name || user.username}
                  </option>
                ))}
              </select>
              
              {users.length === 0 && !isLoading && (
                <div className="info-message">
                  No other users found to send postcards to.
                </div>
              )}
            </div>
            
            <div className="form-section">
              <label htmlFor="message">
                <span className="form-label-text">Your Message</span>
              </label>
              <textarea 
                id="message" 
                value={message} 
                onChange={handleMessageChange}
                disabled={isLoading}
                placeholder="Write your message here..."
                rows="5"
                className="form-textarea"
              />
            </div>
            
            <div className="step-actions">
              <button 
                className="step-button back"
                onClick={prevStep}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M15 18l-6-6 6-6" />
                </svg>
                Back
              </button>
              
              <button 
                className="step-button next"
                onClick={nextStep}
                disabled={!isStepComplete()}
              >
                Review Postcard
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M9 18l6-6-6-6" />
                </svg>
              </button>
            </div>
          </div>
        )}
        
        {/* Step 4: Review and Send */}
        {step === 4 && (
          <div className="step-content">
            <div className="step-header">
              <h2>Step 4: Review & Send</h2>
              <p>Review your postcard and send it to your recipient</p>
            </div>
            
            <div className="postcard-final">
              <div className="postcard-preview-container">
                <div className="postcard-front">
                  <div className="postcard-label">Front</div>
                  <div className="postcard-images">
                    {selectedImages.map((image, index) => (
                      <img 
                        key={image.id || index} 
                        src={processImageUrl(image.url)} 
                        alt={image.caption || `Selected image ${index + 1}`} 
                      />
                    ))}
                  </div>
                </div>
                
                <div className="postcard-back">
                  <div className="postcard-label">Back</div>
                  <div className="postcard-message-area">
                    <div className="postcard-message">{message}</div>
                    <div className="postcard-signature">
                      <span>From: {getCurrentUserName()}</span>
                      <span>To: {getRecipientName()}</span>
                    </div>
                    <div className="postcard-stamp"></div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="step-actions">
              <button 
                className="step-button back"
                onClick={prevStep}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M15 18l-6-6 6-6" />
                </svg>
                Back
              </button>
              
              <button 
                className="step-button send"
                onClick={handleSendPostcard}
                disabled={isLoading}
              >
                {isLoading ? 'Sending...' : 'Send Postcard'}
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" />
                </svg>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PostcardCreator;