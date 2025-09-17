// List of Indian female names for reviews
const INDIAN_FEMALE_NAMES = [
  'Aanya', 'Aaradhya', 'Aashi', 'Aditi', 'Aishwarya',
  'Ananya', 'Anika', 'Anushka', 'Avni', 'Chhavi',
  'Diya', 'Ishita', 'Kavya', 'Kiara', 'Meera',
  'Neha', 'Pari', 'Riya', 'Saanvi', 'Tara'
];

// Review templates
const REVIEW_TEMPLATES = [
  'Absolutely love this product! The quality is amazing.',
  'Very satisfied with my purchase. Would definitely recommend!',
  'Beautiful design and great craftsmanship.',
  'Exceeded my expectations. Worth every penny!',
  'The pictures don\'t do it justice. It looks even better in person!',
  'Perfect gift for my loved ones. They adored it!',
  'Great attention to detail. Very happy with the quality.',
  'Fast shipping and excellent packaging. The product is stunning!',
  'I get compliments every time I wear this. Love it!',
  'The perfect addition to my collection. Highly recommend!'
];

// Review titles based on review content
const REVIEW_TITLES = [
  'Stunning Quality!',
  'Exceeded Expectations',
  'Beautiful Craftsmanship',
  'Worth Every Penny',
  'Better Than Expected',
  'Perfect Gift Choice',
  'Impressive Details',
  'Excellent Packaging',
  'Compliment Magnet',
  'Perfect Addition'
];

// Generate a random review
const generateReview = (productId: string, index: number) => {
  // Create a consistent seed based on product ID and review index
  const seed = `${productId}-${index}`;
  const nameIndex = Math.abs(hashCode(seed)) % INDIAN_FEMALE_NAMES.length;
  const reviewIndex = Math.abs(hashCode(seed + 'review')) % REVIEW_TEMPLATES.length;
  const rating = 4 + Math.floor((Math.abs(hashCode(seed + 'rating')) % 10) / 8); // 4 or 5 stars
  
  // Generate a date within the last year
  const daysAgo = Math.abs(hashCode(seed + 'date')) % 365;
  const reviewDate = new Date();
  reviewDate.setDate(reviewDate.getDate() - daysAgo);

  return {
    id: `review-${productId}-${index}`,
    reviewer_name: INDIAN_FEMALE_NAMES[nameIndex],
    rating,
    review_text: REVIEW_TEMPLATES[reviewIndex],
    review_title: REVIEW_TITLES[reviewIndex],
    created_at: reviewDate.toISOString(),
    is_verified_purchase: Math.random() > 0.3 // 70% chance of verified purchase
  };
};

// Simple hash function for consistent randomness
const hashCode = (str: string): number => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0; // Convert to 32bit integer
  }
  return hash;
};

// Generate random number of reviews (between 15-100)
export const generateReviewCount = (productId: string): number => {
  const seed = `count-${productId}`;
  return 15 + (Math.abs(hashCode(seed)) % 86); // 15-100 reviews
};

// Generate random rating (4.0-5.0)
export const generateRating = (productId: string): number => {
  const seed = `rating-${productId}`;
  return 4.0 + (Math.abs(hashCode(seed)) % 100) / 100; // 4.0-5.0
};

// Generate reviews for a product
export const generateReviews = (productId: string, count: number) => {
  const reviews = [];
  const reviewCount = Math.min(count, 20); // Max 20 reviews to show
  
  for (let i = 0; i < reviewCount; i++) {
    reviews.push(generateReview(productId, i));
  }
  
  // Sort by date, newest first
  return reviews.sort((a, b) => 
    new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );
};