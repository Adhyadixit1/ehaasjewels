export interface PurchaseNotification {
  name: string;
  state: string;
  product: string;
  timeAgo: string;
}

export const purchaseNotifications: PurchaseNotification[] = [
  // Maharashtra
  { name: "Priya Sharma", state: "Maharashtra", product: "Gold Necklace", timeAgo: "just now" },
  { name: "Ananya Deshmukh", state: "Maharashtra", product: "Diamond Earrings", timeAgo: "2 minutes ago" },
  { name: "Sakshi Patil", state: "Maharashtra", product: "Silver Bracelet", timeAgo: "5 minutes ago" },
  
  // Karnataka
  { name: "Deepa Reddy", state: "Karnataka", product: "Ruby Ring", timeAgo: "1 minute ago" },
  { name: "Meera Nair", state: "Karnataka", product: "Pearl Pendant", timeAgo: "3 minutes ago" },
  { name: "Lakshmi Iyer", state: "Karnataka", product: "Gold Bangles", timeAgo: "6 minutes ago" },
  
  // Tamil Nadu
  { name: "Kavitha Krishnan", state: "Tamil Nadu", product: "Temple Jewelry Set", timeAgo: "just now" },
  { name: "Priyanka Rajan", state: "Tamil Nadu", product: "Anklet", timeAgo: "4 minutes ago" },
  { name: "Sangeetha Kumar", state: "Tamil Nadu", product: "Nose Pin", timeAgo: "7 minutes ago" },
  
  // Gujarat
  { name: "Pooja Shah", state: "Gujarat", product: "Kundan Necklace", timeAgo: "2 minutes ago" },
  { name: "Riya Patel", state: "Gujarat", product: "Polki Earrings", timeAgo: "5 minutes ago" },
  { name: "Jhanvi Mehta", state: "Gujarat", product: "Gold Chain", timeAgo: "8 minutes ago" },
  
  // Rajasthan
  { name: "Geeta Singh", state: "Rajasthan", product: "Meenakari Ring", timeAgo: "1 minute ago" },
  { name: "Anjali Rathore", state: "Rajasthan", product: "Thewa Jewelry", timeAgo: "3 minutes ago" },
  { name: "Sunita Chauhan", state: "Rajasthan", product: "Silver Anklet", timeAgo: "6 minutes ago" },
  
  // West Bengal
  { name: "Riya Banerjee", state: "West Bengal", product: "Terracotta Jewelry", timeAgo: "just now" },
  { name: "Moumita Mukherjee", state: "West Bengal", product: "Gold Coin", timeAgo: "4 minutes ago" },
  { name: "Priyanka Das", state: "West Bengal", product: "Shell Necklace", timeAgo: "7 minutes ago" },
  
  // Punjab
  { name: "Simran Kaur", state: "Punjab", product: "Gold Kangan", timeAgo: "2 minutes ago" },
  { name: "Gurpreet Singh", state: "Punjab", product: "Diamond Pendant", timeAgo: "5 minutes ago" },
  { name: "Harpreet Gill", state: "Punjab", product: "Silver Payal", timeAgo: "8 minutes ago" },
  
  // Kerala
  { name: "Amrita Nair", state: "Kerala", product: "Gold Mala", timeAgo: "1 minute ago" },
  { name: "Deepika Menon", state: "Kerala", product: "Temple Ring", timeAgo: "3 minutes ago" },
  { name: "Lekha Pillai", state: "Kerala", product: "Coconut Shell Earrings", timeAgo: "6 minutes ago" },
  
  // Delhi
  { name: "Neha Gupta", state: "Delhi", product: "Designer Necklace", timeAgo: "just now" },
  { name: "Aisha Khan", state: "Delhi", product: "Platinum Ring", timeAgo: "4 minutes ago" },
  { name: "Pooja Verma", state: "Delhi", product: "Fashion Jewelry Set", timeAgo: "7 minutes ago" },
  
  // Uttar Pradesh
  { name: "Sneha Tiwari", state: "Uttar Pradesh", product: "Banarasi Jewelry", timeAgo: "2 minutes ago" },
  { name: "Anita Singh", state: "Uttar Pradesh", product: "Gold Nath", timeAgo: "5 minutes ago" },
  { name: "Ritu Yadav", state: "Uttar Pradesh", product: "Silver Toe Ring", timeAgo: "8 minutes ago" }
];

export const getRandomNotification = (): PurchaseNotification => {
  const randomIndex = Math.floor(Math.random() * purchaseNotifications.length);
  return purchaseNotifications[randomIndex];
};
