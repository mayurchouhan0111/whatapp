const iconMap: Record<string, string> = {
  electronics: "📱",
  furniture: "🛋️",
  grocery: "🥦",
  kitchen: "🍳",
  fashion: "👕",
  clothing: "👕",
  beauty: "💄",
  sports: "⚽",
  books: "📚",
  toys: "🧸",
  automotive: "🚗",
  health: "💊",
  food: "🍔",
  drinks: "🥤",
  home: "🏠",
  garden: "🌿",
  accessories: "👜",
  shoes: "👟",
  jewelry: "💍",
  musical: "🎵",
  stationery: "✏️",
  pets: "🐾",
  baby: "👶",
  tools: "🔧",
};

const colorMap: Record<string, string> = {
  electronics: "#EEF2FF",
  grocery: "#ECFDF5",
  furniture: "#FFF7ED",
  kitchen: "#FEF3C7",
  fashion: "#FDF2F8",
  clothing: "#FDF2F8",
  beauty: "#FDF2F8",
  sports: "#F0F9FF",
  books: "#F5F3FF",
  toys: "#FFF7ED",
  automotive: "#F0F9FF",
  health: "#ECFDF5",
  food: "#FFF7ED",
  drinks: "#ECFDF5",
  home: "#FEF3C7",
  garden: "#ECFDF5",
  accessories: "#FDF2F8",
  shoes: "#FDF2F8",
  jewelry: "#FFF7ED",
  musical: "#F0F9FF",
  stationery: "#F5F3FF",
  pets: "#F0F9FF",
  baby: "#FDF2F8",
  tools: "#EEF2FF",
};

export function getCategoryEmoji(name: string): string {
  const key = name.toLowerCase().trim();
  if (iconMap[key]) return iconMap[key];
  for (const [k, emoji] of Object.entries(iconMap)) {
    if (key.includes(k) || k.includes(key)) return emoji;
  }
  return "🛍️";
}

export function getCategoryColor(name: string): string {
  const key = name.toLowerCase().trim();
  if (colorMap[key]) return colorMap[key];
  for (const [k, color] of Object.entries(colorMap)) {
    if (key.includes(k) || k.includes(key)) return color;
  }
  return "#F8FAFC";
}

export const promoIcons = ["🔥", "⚡", "🎁", "💥", "🌟"];
export const promoLabels = [
  "Best Seller",
  "Trending Now",
  "Special Offer",
  "Popular Picks",
  "Featured",
];
export const promoDescriptions = [
  "Most ordered items this week",
  "Everyone's buying these right now",
  "Limited time deals you won't want to miss",
  "Top-rated products our customers love",
  "Curated just for you",
];

export function getRandomPromo(index: number) {
  const i = index % promoIcons.length;
  return {
    icon: promoIcons[i],
    label: promoLabels[i],
    description: promoDescriptions[i],
  };
}
