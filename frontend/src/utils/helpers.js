// src/utils/helpers.js

// Calculate distance between two coordinates (in km)
export const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
};

// Get classes within specified distance
export const getClassesInRange = (classes, userLat, userLon, maxDistance) => {
  return classes
    .map(cls => ({
      ...cls,
      distance: calculateDistance(userLat, userLon, cls.latitude, cls.longitude)
    }))
    .filter(cls => cls.distance <= maxDistance)
    .sort((a, b) => a.distance - b.distance);
};

// Format date to readable string
export const formatDate = (dateString) => {
  const date = new Date(dateString);
  const options = { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' };
  return date.toLocaleDateString('en-US', options);
};

// Format time to 12-hour format
export const formatTime = (timeString) => {
  const [hours, minutes] = timeString.split(':');
  const hour = parseInt(hours);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour % 12 || 12;
  return `${displayHour}:${minutes} ${ampm}`;
};

// Check if class is in the future
export const isFutureClass = (date, time) => {
  const classDateTime = new Date(`${date}T${time}`);
  return classDateTime > new Date();
};

// Get upcoming classes
export const getUpcomingClasses = (classes) => {
  return classes
    .filter(cls => isFutureClass(cls.date, cls.time))
    .sort((a, b) => new Date(`${a.date}T${a.time}`) - new Date(`${b.date}T${b.time}`));
};

// Token packages
export const TOKEN_PACKAGES = [
  { tokens: 5, price: 25, discount: 0 },
  { tokens: 10, price: 45, discount: 10 },
  { tokens: 20, price: 80, discount: 20 },
  { tokens: 50, price: 175, discount: 30 }
];

// Calculate price per token
export const getPricePerToken = (tokens, price) => {
  return (price / tokens).toFixed(2);
};