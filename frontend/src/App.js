import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/layout/Navbar';
import Home from './components/pages/Home';
import JournalList from './components/journals/JournalList';
import CreateJournal from './components/journals/CreateJournal';
import CreateEntry from './components/entries/CreateEntry';
import EditJournal from './components/journals/EditJournal';
import ViewEntry from './components/entries/ViewEntry';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import ProfilePage from './components/pages/ProfilePage';
import PostcardCreator from './components/postcard/PostcardCreator';
import Notifications from './components/notifications/Notifications';
import ExplorePage from './components/explore/ExplorePage';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';

function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in from localStorage
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        setCurrentUser(user);
      } catch (e) {
        console.error('Error parsing user data from localStorage:', e);
        localStorage.removeItem('user');
      }
    }
    setLoading(false);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('user');
    setCurrentUser(null);
  };

  // Protected route component
  const ProtectedRoute = ({ children }) => {
    if (loading) {
      return <div className="loading-screen">Loading...</div>;
    }
    
    if (!currentUser) {
      return <Navigate to="/login" replace />;
    }
    
    return children;
  };

  if (loading) {
    return <div className="loading-screen">Loading...</div>;
  }

  return (
    <Router>
      <div className="App">
        <Navbar currentUser={currentUser} onLogout={handleLogout} />
        <div className="container-fluid p-0">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login setCurrentUser={setCurrentUser} />} />
            <Route path="/register" element={<Register />} />
            
             <Route path="/profile" element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            } />
            <Route path="/notifications" element={
              <ProtectedRoute>
                <Notifications />
              </ProtectedRoute>
            } />
            {/* Protected Journal Routes */}
            <Route path="/journals" element={
              <ProtectedRoute>
                <JournalList />
              </ProtectedRoute>
            } />
            <Route path="/journals/new" element={
              <ProtectedRoute>
                <CreateJournal />
              </ProtectedRoute>
            } />
            <Route path="/journals/:id/edit" element={
              <ProtectedRoute>
                <EditJournal /> 
              </ProtectedRoute>
            } />
            <Route path="/create-postcard" element={
              <ProtectedRoute>
                <PostcardCreator />
              </ProtectedRoute>} />
            
            {/* Protected Entry Routes */}
            <Route path="/journals/:journalId/entries/new" element={
              <ProtectedRoute>
                <CreateEntry />
              </ProtectedRoute>
            } />
            <Route path="/journals/:journalId/entries/:entryId" element={
              <ProtectedRoute>
                <ViewEntry />
              </ProtectedRoute>
            } />      
            {/* Explore Page */}
            <Route path="/explore" element={
              <ProtectedRoute>
                <ExplorePage />
              </ProtectedRoute>
            } />
            
            {/* Redirect to home if no match */}      
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;