import { useState } from 'react';
import { MdClose, MdArrowBackIos, MdArrowForwardIos } from 'react-icons/md';
import './ImageSlider.css';

export default function ImageSlider({ images, initialIndex = 0, onClose }) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);

  const nextImage = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const handleKeyDown = (e) => {
    if (e.key === 'ArrowRight') nextImage();
    if (e.key === 'ArrowLeft') prevImage();
    if (e.key === 'Escape') onClose();
  };

  return (
    <div 
      className="image-slider-overlay" 
      onClick={onClose}
      onKeyDown={handleKeyDown}
      tabIndex={0}
    >
      <div className="image-slider-container" onClick={(e) => e.stopPropagation()}>
        <button className="slider-close" onClick={onClose}>
          <MdClose size={24} />
        </button>
        
        {images.length > 1 && (
          <>
            <button className="slider-nav prev" onClick={prevImage}>
              <MdArrowBackIos size={24} />
            </button>
            <button className="slider-nav next" onClick={nextImage}>
              <MdArrowForwardIos size={24} />
            </button>
          </>
        )}
        
        <img 
          src={images[currentIndex]} 
          alt={`Image ${currentIndex + 1}`}
          className="slider-image"
          onError={(e) => {
            console.error('Slider image failed to load:', e.target.src);
            e.target.style.border = '2px solid red';
          }}
          onLoad={() => console.log('Slider image loaded:', images[currentIndex])}
        />
        
        {images.length > 1 && (
          <div className="slider-counter">
            {currentIndex + 1} / {images.length}
          </div>
        )}
        
        {images.length > 1 && (
          <div className="slider-dots">
            {images.map((_, index) => (
              <button
                key={index}
                className={`dot ${index === currentIndex ? 'active' : ''}`}
                onClick={() => setCurrentIndex(index)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}