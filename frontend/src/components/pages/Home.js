import React, { useState, useEffect } from 'react';
import "./Home.css";

const Home = () => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Hero images for rotation
  const heroImages = [
    {
      url: 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=1200&h=800&fit=crop',
    },
    {
      url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&h=800&fit=crop',
    },
    {
      url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1200&h=800&fit=crop',
    },
    {
      url: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=1200&h=800&fit=crop',
    }
  ];

  // Rotate hero images
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % heroImages.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [heroImages.length]);

  return (
    <div className="modern-home">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-background">
          {heroImages.map((image, index) => (
            <div
              key={index}
              className={`hero-image ${index === currentImageIndex ? 'active' : ''}`}
              style={{ backgroundImage: `url(${image.url})` }}
            />
          ))}
          <div className="hero-overlay" />
        </div>
        
        <div className="hero-content">
          <div className="hero-text">
            <h1 className="hero-title">
              <span className="gradient-text">Travel Tales</span>
              <br />
              <span className="subtitle-text">Your Journey, Your Story</span>
            </h1>
            <p className="hero-subtitle">
              Capture, create, and share your travel adventures in beautiful digital journals. 
              Turn every trip into a treasure trove of memories.
            </p>
            <div className="hero-buttons">
              <a href="/journals/new" className="btn-primary">
                Start Your Journey
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </a>
              <a href="/journals" className="btn-secondary">
                Explore Journals
              </a>
            </div>
          </div>
          
        </div>

      </section>
    </div>
  );
};

export default Home;