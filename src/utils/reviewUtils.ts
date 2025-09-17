/**
 * Utility functions for generating consistent review data
 */

// Simple hash function to create a deterministic "random" number from a string
const hashCode = (str: string): number => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash);
};

// Function to generate a pseudo-random number between min and max based on a seed
const seededRandom = (seed: string, min: number, max: number): number => {
  const hash = hashCode(seed);
  const random = (hash % 1000000) / 1000000; // Convert to 0-1 range
  return Math.floor(random * (max - min + 1)) + min;
};

// Function to generate a pseudo-random float between min and max based on a seed
const seededRandomFloat = (seed: string, min: number, max: number): number => {
  const hash = hashCode(seed);
  const random = (hash % 1000000) / 1000000; // Convert to 0-1 range
  return parseFloat((random * (max - min) + min).toFixed(1));
};

/**
 * Generate consistent review count for a product
 * @param productId Product ID to use as seed
 * @returns Review count between 10-50
 */
export const getConsistentReviewCount = (productId: string): number => {
  return seededRandom(productId, 10, 50);
};

/**
 * Generate consistent rating for a product
 * @param productId Product ID to use as seed
 * @returns Rating between 4.5-5.0
 */
export const getConsistentRating = (productId: string): number => {
  return seededRandomFloat(productId, 4.5, 5.0);
};

/**
 * List of Indian female names for reviews
 */
export const INDIAN_FEMALE_NAMES = [
  'Priya Sharma', 'Anjali Patel', 'Meera Reddy', 'Sneha Singh', 'Kavita Desai',
  'Ritu Gupta', 'Neha Verma', 'Pooja Iyer', 'Divya Nair', 'Sunita Menon',
  'Aishwarya Rao', 'Tanvi Joshi', 'Shruti Pillai', 'Komal Choudhary', 'Radhika Agarwal',
  'Nikita Rajput', 'Swati Malhotra', 'Deepa Naidu', 'Shalini Bhatia', 'Anita Khanna'
];

/**
 * Get a random Indian female name
 * @param seed Seed for consistent randomness
 * @returns Random Indian female name
 */
export const getRandomIndianFemaleName = (seed: string): string => {
  const index = seededRandom(seed, 0, INDIAN_FEMALE_NAMES.length - 1);
  return INDIAN_FEMALE_NAMES[index];
};