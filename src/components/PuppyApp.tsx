import React, { useState, useEffect } from 'react';
import { fetchRandomPuppyImage } from '../services/api';

const PuppyApp = () => {
  const [currentImage, setCurrentImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const loadImage = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const imageUrl = await fetchRandomPuppyImage();
      setCurrentImage(imageUrl);
    } catch (err: any) {
      setError(err.message || 'Failed to load image.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadImage();
  }, []);

  const handleNextImage = () => {
    loadImage();
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <h1 className="text-3xl font-semibold text-gray-800 mb-6">Cute Puppy Pictures</h1>

      {isLoading ? (
        <div className="text-center text-gray-600">Loading...</div>
      ) : error ? (
        <div className="text-center text-red-500">Error: {error}</div>
      ) : currentImage ? (
        <div className="flex flex-col items-center">
          <img
            src={currentImage}
            alt="Cute Puppy"
            className="rounded-xl shadow-md max-w-full h-auto object-cover"
            style={{ maxWidth: '640px', maxHeight: '480px' }}
          />
        </div>
      ) : (
        <div className="text-center text-gray-600">No images available.</div>
      )}

      <button
        onClick={handleNextImage}
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mt-6"
        disabled={isLoading}
      >
        Next Puppy!
      </button>
    </div>
  );
};

export default PuppyApp;