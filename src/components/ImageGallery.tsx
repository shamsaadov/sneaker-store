import React, { useState, useEffect } from "react";
import { X, ChevronLeft, ChevronRight, ZoomIn } from "lucide-react";

interface ImageGalleryProps {
  images: string[];
  productName: string;
  isOpen: boolean;
  onClose: () => void;
  initialIndex?: number;
}

const ImageGallery: React.FC<ImageGalleryProps> = ({
  images,
  productName,
  isOpen,
  onClose,
  initialIndex = 0,
}) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);

  useEffect(() => {
    setCurrentIndex(initialIndex);
  }, [initialIndex]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      switch (e.key) {
        case "Escape":
          onClose();
          break;
        case "ArrowLeft":
          e.preventDefault();
          setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
          break;
        case "ArrowRight":
          e.preventDefault();
          setCurrentIndex((prev) => (prev + 1) % images.length);
          break;
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, images.length, onClose]);

  const nextImage = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const handleImageClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-95 z-50 flex items-center justify-center">
      {/* Close Button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 z-10 w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-all duration-200"
      >
        <X className="w-6 h-6" />
      </button>

      {/* Navigation Buttons */}
      {images.length > 1 && (
        <>
          <button
            onClick={prevImage}
            className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10 w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-all duration-200"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button
            onClick={nextImage}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 z-10 w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-all duration-200"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </>
      )}

      {/* Main Image */}
      <div className="relative max-w-7xl max-h-full p-4">
        <img
          src={images[currentIndex]}
          alt={`${productName} - изображение ${currentIndex + 1}`}
          className="max-w-full max-h-[90vh] object-contain rounded-lg"
          onClick={handleImageClick}
        />
      </div>

      {/* Image Counter */}
      {images.length > 1 && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-10 bg-black/50 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm">
          {currentIndex + 1} / {images.length}
        </div>
      )}

      {/* Thumbnail Navigation */}
      {images.length > 1 && (
        <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 z-10 flex space-x-2">
          {images.map((image, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`w-16 h-16 rounded-lg overflow-hidden border-2 transition-all duration-200 ${
                currentIndex === index
                  ? "border-white"
                  : "border-white/30 hover:border-white/60"
              }`}
            >
              <img
                src={image}
                alt={`${productName} - миниатюра ${index + 1}`}
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default ImageGallery;
