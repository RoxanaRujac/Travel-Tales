import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080';

// Configure Axios for better error handling
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to attach Authorization header if user is logged in
apiClient.interceptors.request.use(
  (config) => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      const user = JSON.parse(userStr);
      if (user.token) {
        config.headers['Authorization'] = `Bearer ${user.token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export const JournalService = {
  getAllJournals: async (userId) => {
  try {
    console.log("Fetching journals for userId:", userId);
    const response = await apiClient.get('/journals', { 
      params: { userId: userId } 
    });
    console.log("Response data:", response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching journals:', error);
    throw error;
  }
},
  
  getJournalById: async (id) => {
    try {
      const response = await apiClient.get(`/journals/${id}`); 
      return response.data;
    } catch (error) {
      console.error(`Error fetching journal ${id}:`, error);
      throw error;
    }
  },
  
  createJournal: async (journalData) => {
  try {
    const response = await apiClient.post('/journals', journalData);
    return response;
  } catch (error) {
    console.error('Error creating journal:', error);
    throw error;
  }
  },
  
  updateJournal: async (journal) => {
    try {
      const response = await apiClient.put(`/journals/${journal.id}`, journal); 
      return response.data;
    } catch (error) {
      console.error('Error updating journal:', error);
      throw error;
    }
  },
  
  uploadCoverImage: async (journalId, formData) => {
    try {
      const response = await apiClient.post(
        `/journals/${journalId}/upload-cover`, 
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        }
      );
      return response.data;
    } catch (error) {
      console.error(`Error uploading cover image for journal ${journalId}:`, error);
      throw error;
    }
  },
  
  getCoverImageUrl: async (journalId) => {
  try {
    const journal = await JournalService.getJournalById(journalId);
    
    // Check for 'coverImageURL', 'coverImageUrl', or 'cover_imageurl'
    const imageUrl = journal.coverImageURL || journal.coverImageUrl || journal.cover_imageurl;
    
    if (!imageUrl) return null;
    
    // If it's a relative URL (starts with /), append to API base URL
    if (imageUrl.startsWith('/')) {
      return `${API_BASE_URL}${imageUrl}`;
    }
    
    // If it's already an absolute URL (starts with http)
    if (imageUrl.startsWith('http')) {
      return imageUrl;
    }
    
    // If it's a file path (starts with ./ or uploads/)
    if (imageUrl.startsWith('./') || imageUrl.startsWith('uploads/')) {
      return `${API_BASE_URL}/${imageUrl.replace(/^\.\//, '')}`;
    }
    
    // Default fallback - just prepend API base URL
    return `${API_BASE_URL}/${imageUrl}`;
  } catch (error) {
    console.error(`Error fetching cover image URL for journal ${journalId}:`, error);
    return null;
  }
},
  
  deleteJournal: async (id) => {
    try {
      const response = await apiClient.delete(`/journals/${id}`); 
      return response.data;
    } catch (error) {
      console.error(`Error deleting journal ${id}:`, error);
      throw error;
    }
  }
};

// Entry Service
export const EntryService = {
  createEntry: async (entryData) => {
    try {
      const response = await apiClient.post('/entries', entryData);
      return response.data;
    } catch (error) {
      console.error('Error creating entry:', error);
      throw error;
    }
  },
  
  uploadEntryImage: async (entryId, imageFile, description) => {
    try {
    console.log(`Uploading image for entry ${entryId}`, {
      fileName: imageFile.name,
      fileSize: imageFile.size,
      fileType: imageFile.type,
      description: description
    });
    
    // Prepare form data
    const formData = new FormData();
    formData.append('file', imageFile);  
    if (description) {
      formData.append('caption', description);
    }
    
    // 1. First upload the media file
    const mediaResponse = await apiClient.post(
      `/media/upload`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        timeout: 60000
      }
    );

    console.log('Media upload response:', mediaResponse.data);

    // 2. Then associate the media with the entry
    if (mediaResponse.data && mediaResponse.data.id) {
      console.log(`Associating media ${mediaResponse.data.id} with entry ${entryId}`);
      const associationResponse = await apiClient.post(
        `/entries/${entryId}/media/${mediaResponse.data.id}`
      );
      console.log('Association response:', associationResponse);
    }
    
    return mediaResponse.data;
  } catch (error) {
    console.error('Upload error details:', {
      message: error.message,
      response: error.response?.data,
      config: error.config
    });
    throw error;
  }
},
  
  getEntriesByJournalId: async (journalId) => {
  try {
    console.log(`Fetching entries for journal ${journalId}`);
    const response = await apiClient.get(`/entries/journal/${journalId}`);
    console.log(`Entries received:`, response.data);
    return response.data;
  } catch (error) {
    console.error(`Error fetching entries for journal ${journalId}:`, error);
    throw error;
  }
},
  
  updateEntry: async (entry) => {
    try {
      const response = await apiClient.put(`/entries/${entry.id}`, entry);
      return response.data;
    } catch (error) {
      console.error(`Error updating entry ${entry.id}:`, error);
      throw error;
    }
  },
  
  deleteEntry: async (entryId) => {
    try {
      const response = await apiClient.delete(`/entries/${entryId}`);
      return response.data;
    } catch (error) {
      console.error(`Error deleting entry ${entryId}:`, error);
      throw error;
    }
  },

  getEntryById: async (id) => {
    try {
      console.log(`Fetching entry with ID: ${id}`);
      const response = await apiClient.get(`/entries/${id}`);
      console.log(`Entry data received:`, response.data);
      return response.data;
    } catch (error) {
      console.error(`Error fetching entry ${id}:`, error.response || error.message || error);
      throw error;
    }
  },
  
  geocodeLocation: async (location) => {
    try {
      const response = await apiClient.get('/map/geocode', {
        params: { location }
      });
      return response.data;
    } catch (error) {
      console.error('Geocoding error:', error);
      return { lat: 0, lng: 0, displayName: location };
    }
  },
  
  reverseGeocode: async (lat, lng) => {
    try {
      const response = await apiClient.get('/map/reverse-geocode', {
        params: { lat, lng }
      });
      return response.data;
    } catch (error) {
      console.error('Reverse geocoding error:', error);
      return { displayName: `${lat}, ${lng}` };
    }
  }
};

// Postcard Service
export const PostcardService = {
  getAllPostcards: async () => {
    try {
      const response = await apiClient.get('/postcards');
      return response.data;
    } catch (error) {
      console.error('Error fetching postcards:', error);
      throw error;
    }
  },
  
  getPostcardById: async (id) => {
    try {
      const response = await apiClient.get(`/postcards/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching postcard ${id}:`, error);
      throw error;
    }
  },
  
  getPostcardsSentByUser: async (senderId) => {
    try {
      const response = await apiClient.get(`/postcards/sent/${senderId}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching postcards sent by user ${senderId}:`, error);
      throw error;
    }
  },
  
  getPostcardsReceivedByUser: async (receiverId) => {
    try {
      const response = await apiClient.get(`/postcards/received/${receiverId}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching postcards received by user ${receiverId}:`, error);
      throw error;
    }
  },
  
  createPostcard: async (postcard) => {
    try {
      const response = await apiClient.post('/postcards', postcard);
      return response.data;
    } catch (error) {
      console.error('Error creating postcard:', error);
      throw error;
    }
  },
  
  sendPostcard: async (postcard) => {
    try {
      const response = await apiClient.post('/postcards/send', postcard);
      return response.data;
    } catch (error) {
      console.error('Error sending postcard:', error);
      throw error;
    }
  },
  
  updatePostcard: async (postcard) => {
    try {
      const response = await apiClient.put(`/postcards/${postcard.id}`, postcard);
      return response.data;
    } catch (error) {
      console.error('Error updating postcard:', error);
      throw error;
    }
  },
  
  deletePostcard: async (id) => {
    try {
      const response = await apiClient.delete(`/postcards/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error deleting postcard ${id}:`, error);
      throw error;
    }
  }
};

// Media Service
export const MediaService = {
  getAllMedia: async () => {
    try {
      const response = await apiClient.get('/media');
      return response.data;
    } catch (error) {
      console.error('Error fetching media:', error);
      throw error;
    }
  },
  
  getMediaById: async (id) => {
    try {
      const response = await apiClient.get(`/media/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching media ${id}:`, error);
      throw error;
    }
  },
  
  uploadMedia: async (file, caption, type) => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      if (caption) {
        formData.append('caption', caption);
      }
      if (type) {
        formData.append('type', type);
      }
      
      const response = await apiClient.post(
        '/media/upload',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error uploading media:', error);
      throw error;
    }
  },
  
  deleteMedia: async (id) => {
    try {
      const response = await apiClient.delete(`/media/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error deleting media ${id}:`, error);
      throw error;
    }
  }
};

// User Service
export const UserService = {
  getAllUsers: async () => {
    try {
      const response = await apiClient.get('/users');
      return response.data;
    } catch (error) {
      console.error('Error fetching users:', error);
      throw error;
    }
  },
  
  getUserById: async (id) => {
    try {
      const response = await apiClient.get(`/users/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching user ${id}:`, error);
      throw error;
    }
  },

  updateUser: async (userData) => {
    try {
      console.log(`Updating user with ID: ${userData.id}`, userData);
      const response = await apiClient.put(`/users/${userData.id}`, userData);
      console.log('User update response:', response.data);
      return response.data;
    } catch (error) {
      console.error(`Error updating user ${userData.id}:`, error);
      throw error;
    }
  }
}

export const XMLExportService = {
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
  },

  // Export journal data
  exportJournalData: async (journalId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/export/journal/${journalId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/xml',
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const contentDisposition = response.headers.get('Content-Disposition');
      let filename = `journal_${journalId}_export.xml`;
      
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="(.+)"/);
        if (filenameMatch) {
          filename = filenameMatch[1];
        }
      }

      const blob = await response.blob();
      return { blob, filename };
    } catch (error) {
      console.error('Error exporting journal data:', error);
      throw error;
    }
  }
};

export const downloadFile = (blob, filename) => {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};