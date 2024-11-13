import React, { useState, useEffect, useRef } from 'react';
import './scroll.css'

function ScrollToTopButton() {
  const [showButton, setShowButton] = useState(false);
  const scrollButtonRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 200) {
        setShowButton(true);
      } else {
        setShowButton(false);
      }
    };

    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  return (
    <div>
      {/* ... other content ... */}
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

export default ScrollToTopButton;