import React, { useState, useEffect, useRef } from 'react';
import './scroll.css';

function Scroll() {
  const [showAbout, setShowAbout] = useState(false);
  const [showTeam, setShowTeam] = useState(false);
  const [showSupervisor, setShowSupervisor] = useState(false);
  const [showButton, setShowButton] = useState(false);
  const scrollButtonRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      const windowHeight = window.innerHeight;

      // Show about and team members first
      if (scrollPosition > windowHeight * 0.5) {
        setShowAbout(true);
        setShowTeam(true);
        setShowButton(true);
      } else {
        setShowAbout(false);
        setShowTeam(false);
        setShowButton(false);
      }

      // Show supervisor on further scroll
      if (scrollPosition > windowHeight * 0.8) {
        setShowSupervisor(true);
      } else {
        setShowSupervisor(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  return (
    <div className={showAbout ? 'about-section' : ''}>
      <div className={`grid-background ${showAbout ? 'visible' : ''}`}></div>

      {showAbout && (
        <div className={`about-container ${showAbout ? 'fade-in' : ''}`}>
          <div className="feature-text">
            DataTails is a data analytics platform that transforms unstructured Reddit data into meaningful insights. Our platform uses the latest advancements in Large Language Models (LLMs), Knowledge Graphs, and Visualization Recommendation Engines to make data exploration even better.
          </div>

          {/* Team Members Section */}
          {showTeam && (
            <div className={`team-section ${showTeam ? 'fade-in' : ''}`}>
              <div className="team-card">
                <h3>Shitba Kashif</h3>
                <p className="member-id">211-2676</p>
              </div>
              <div className="team-card">
                <h3>Fasih Ur Rehman</h3>
                <p className="member-id">211-1705</p>
              </div>
              <div className="team-card">
                <h3>Maryam Noor</h3>
                <p className="member-id">211-2656</p>
              </div>
            </div>
          )}

          {/* Supervisor Section */}
          {showSupervisor && (
            <div className={`supervisor-container ${showSupervisor ? 'fade-in' : ''}`}>
              <div className="supervisor-section">
                <h3>Supervised by</h3>
                <p className="supervisor-name">Dr. Arshad Islam</p>
              </div>
            </div>
          )}
        </div>
      )}

      <div className="outer-circle">
        <button
          ref={scrollButtonRef}
          className={`scroll-to-top ${showButton ? 'show' : ''}`}
          onClick={scrollToTop}
        >
          ↑
        </button>
      </div>
    </div>
  );
}

export default Scroll;
