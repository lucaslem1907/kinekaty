// src/services/api.js
const API_URL = process.env.REACT_APP_API_URL

// Helper to get token
const getToken = () => localStorage.getItem('token');

// ---------------- LOGIN ----------------
export const loginUser = async ({ email, password, isAdmin }) => {
  const res = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, isAdmin }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Login failed');
  return data; // return user info + token
};

// ----------------REGISTER-----------------
/*export const RegisterUser = async () => {
    e.preventDefault();

    try {
      const res = await fetch('http://localhost:4000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (!res.ok)
        throw new Error(data.error || 'Registration failed');

      setSuccess(true);
      setError('');

      setTimeout(() => {
        onSwitchToLogin();
      }, 1500);
    } catch (err) {
      setError(err.message);
    }
  };*/
// ---------------- CLASSES ----------------
export const fetchClasses = async () => {
  const res = await fetch(`${API_URL}/classes`);
  if (!res.ok) throw new Error('Failed to fetch classes');
  return res.json();
};

export const createClass = async (classData) => {
  const token = getToken();
  const res = await fetch(`${API_URL}/classes`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(classData),
  });
  if (!res.ok) throw new Error('Failed to create class');
  return res.json();
};

export const updateClass = async (classId, updatedData) => {
  const token = getToken();
  const res = await fetch(`${API_URL}/classes/${classId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(updatedData),
  });
  if (!res.ok) throw new Error('Failed to update class');
  return res.json();
};

export const deleteClass = async (classId) => {
  const token = getToken();
  const res = await fetch(`${API_URL}/classes/${classId}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to delete class');
  return data;
};

// ---------------- BOOKINGS ----------------
export const fetchBookings = async (isAdmin) => {
  const token = getToken();
  const endpoint = isAdmin ? `${API_URL}/bookings/all` : `${API_URL}/bookings/me`;
  const res = await fetch(endpoint, { headers: { Authorization: `Bearer ${token}` } });
  if (!res.ok) throw new Error('Failed to fetch bookings');
  return res.json();
};

export const bookClass = async (classId, userId, userName) => {
  const token = getToken();

  // deduct token
  const tokenRes = await fetch(`${API_URL}/tokens/use`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({amount: 1}),
  });
  if (!tokenRes.ok) throw new Error('Failed to deduct token');

  // create booking
  const res = await fetch(`${API_URL}/bookings`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ classId, userId, user: userName }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Booking failed');
  return data;
};

// ---------------- USERS ----------------
export const fetchUsers = async () => {
  const token = getToken();
  const res = await fetch(`${API_URL}/auth`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error('Failed to fetch users');
  return res.json();
};

// ---------------- TOKENS ----------------
export const fetchTokens = async (isAdmin) => {
  const token = getToken();
  const endpoint = isAdmin ? `${API_URL}/tokens/all` : `${API_URL}/tokens/me`;
  const res = await fetch(endpoint, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error('Failed to fetch tokens');
  return res.json();
};

export const purchaseTokens = async (amount) => {
  const token = getToken();
  const res = await fetch(`${API_URL}/tokens/buy`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ amount }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to purchase tokens');
  return data;
};

export const buyTokens = async (amount, tokens) => {
    const token = getToken();
    const res = await fetch(`${API_URL}/payment/createsession`, {
      method: "POST",
      headers: { "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({amount, tokens}),
    });
    
    const data = await res.json();
    console.log (data)
    if (!res.ok) throw new Error(data.error || 'Failed to purchase tokens')
    window.location.href = data.url; // ga naar Stripe checkout
  };
