import axios from 'axios';

const API_URL = 'https://dog.ceo/api/breeds/image/random';

export const fetchRandomPuppyImage = async () => {
  try {
    const response = await axios.get(API_URL);
    return response.data.message; // Returns the image URL
  } catch (error) {
    throw new Error('Failed to fetch puppy image');
  }
};