import { useState, useEffect } from 'react';
import ArrowUp from "../assets/arrow_upward_24dp.svg?react"

export default function ScrollToTopButton() {
  const [isVisible, setIsVisible] = useState(false);

  // Show button when page is scrolled down
  useEffect(() => {
    const toggleVisibility = () => {
      if (window.pageYOffset > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', toggleVisibility);
    return () => window.removeEventListener('scroll', toggleVisibility);
  }, []);

  // Scroll to top smoothly
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  return (
    <div>
      {/* Scroll to Top Button */}
      {isVisible && (
        <button
          onClick={scrollToTop}
          className="btn btn-primary btn-sm btn-circle fixed bottom-8 right-8 z-1 md:btn-md animate-bounce"
          aria-label="Scroll to top"
        >
          <ArrowUp/>
        </button>
      )}
    </div>
  );
}