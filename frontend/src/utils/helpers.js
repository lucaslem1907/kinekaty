// src/utils/helpers.js



// Format date to readable string
export const formatDate = (dateString) => {
  const date = new Date(dateString);
  if (isNaN(date.getTime())) {
    return '';
  }
  const options = { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' };
  return date.toLocaleDateString('en-US', options);
};

// Format time to 12-hour format
export const formatTime = (timeString) => {
  if (typeof timeString !== 'string' || !timeString.includes(':')) {
    return '';
  }
  const [hours, minutes] = timeString.split(':');
  const hour = parseInt(hours, 10);
  if (isNaN(hour) || isNaN(parseInt(minutes, 10))) {
    return '';
  }
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