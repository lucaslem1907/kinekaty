import React, { useState, useEffect, use } from 'react';
import { Routes, Route, useNavigate, Navigate } from 'react-router-dom';
import ClientDashboard from './components/ClientDashboard.js';
import LoginView from './components/LoginView.js';
import RegisterView from './components/RegisterView.js';
import AdminDashboard from './components/AdminDashboard.js';
import CalendarView from './components/CalendarView.js';
import ClassEditView from './components/ClassEditView.js';
import './styles/App.css';

/* ------------------- MAIN APP ------------------- */

export default function ClassBookingApp() {
  const [currentUser, setCurrentUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [tokens, setTokens] = useState([]);
  const [view, setView] = useState('login');
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState(null);

  const navigate = useNavigate();

  const handleLogin = async (userData) => {
    const { email, password, isAdmin } = userData;

    try {
      const res = await fetch('http://localhost:4000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, isAdmin }),
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || 'Login failed');

      // set current user
      setCurrentUser(data.user);
      navigate(data.user.isAdmin ? '/admin' : '/client');
      localStorage.setItem('token', data.token);

      return true;
    } catch (err) {
      console.error(err);
      return false;
    }
  };


  const handleRegister = (userData) => {
    const newUser = { ...userData, id: Date.now() };
    setUsers([...users, newUser]);
    return true;
  };

  useEffect(() => {
    const fetchUsers = async () => {
      const token = localStorage.getItem('token');
      if (!token) return; // user not logged in yet

      try {
        const res = await fetch('http://localhost:4000/api/auth', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await res.json();

        if (!res.ok) {
          console.error('Failed to load users:', data.error);
          setUsers([]); // fallback
          return;
        }

        setUsers(data);
      } catch (err) {
        console.error('Error fetching users:', err);
        setUsers([]);
      }
    };

    fetchUsers();
  }, []);

  const handleCreateClass = async (classData) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:4000/api/classes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(classData),
      });
      const newClass = await res.json();
      setClasses((prev) => [...prev, newClass]);
    } catch (err) {
      console.error(err);
    }
  };

  //Fetch classes on component mount
  useEffect(() => {
    const fetchClasses = async () => {
      const res = await fetch('http://localhost:4000/api/classes');
      const data = await res.json();
      setClasses(data);
    };
    fetchClasses();
  }, []);

  const handleBookClass = async (classId) => {
    // deduct token from user
    const deductToken = async (amount) => {
      try {
        const token = localStorage.getItem('token');
        console.log('Using token:', amount);
        const res = await fetch(`http://localhost:4000/api/tokens/use`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify(amount),
        });
        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || 'Failed to fetch tokens');
        }
        return data
      } catch (err) {
        console.error('Error fetching tokens:', err);
        return 0;
      }
    };

    // ✅ Book the class (only if token deduction succeeded)
    await deductToken(1);
    // Create booking
    const newBooking = async (bookingsdata) => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch('http://localhost:4000/api/bookings', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(bookingsdata),
        });
        const newBooking = await res.json();

        if (!res.ok) {
          throw new Error(newBooking.error || newBooking.message || 'Booking failed');
        }
        console.log('New booking:', newBooking);
        setBookings((prev) => [...prev, newBooking.booking]);

        alert(newBooking.message);
      } catch (err) {
        console.error('booking error', err);
        alert(err.message || 'Booking failed!');
      }
    };

    newBooking({ userId: currentUser.id, classId, user: currentUser.name });
  };

  useEffect(() => {
    const fetchBookings = async () => {
      const token = localStorage.getItem('token');
      if (!token || !currentUser) return;

      const endpoint = currentUser.isAdmin
        ? 'http://localhost:4000/api/bookings/all' // admin gets all bookings
        : 'http://localhost:4000/api/bookings/me'; // normal user gets own bookings

      try {
        const res = await fetch(endpoint, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        console.log('aantal bookings bij fetching:', data);
        if (!res.ok) {
          console.error('Failed to load bookings:', data.error);
          setBookings([]); // fallback
          return;
        }
        setBookings(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error('Error fetching bookings:', err);
        setBookings([]);
      }
    };

    fetchBookings();
  }, [currentUser]);

  const handlePurchaseTokens = (amount) => {
    try {
      const token = localStorage.getItem('token');
      fetch('http://localhost:4000/api/tokens/buy', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ amount }),
      })
        .then(res => res.json())
        .then(data => {
          if (data.error) {
            alert('Error purchasing tokens: ' + data.error);
            return;
          }
          alert('Successfully purchased ' + amount + ' tokens!');

        }
        );
    } catch (err) {
      console.error('Error purchasing tokens:', err);
    }
    setView('client-dashboard');
  };

  useEffect(() => {
    const fetchtokens = async () => {
      const token = localStorage.getItem('token');
      if (!token || !currentUser) return;

      const endpoint = currentUser.isAdmin
        ? 'http://localhost:4000/api/tokens/all' // admin gets all tokens
        : 'http://localhost:4000/api/tokens/me'; // normal user gets own tokens

      try {
        const res = await fetch(endpoint, {
          headers: {
            'content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
        });
        const data = await res.json();

        if (!res.ok) {
          console.error('Failed to load bookings:', data.error);
          setTokens([]); // fallback
          return;
        }
        console.log('Fetched tokens:', data);
        setTokens(data);
      } catch (err) {
        console.error('Error fetching bookings:', err);
        setTokens([]);
      }
    };
    fetchtokens();
  }, [currentUser, bookings]);


  const handleLogout = () => {
    setCurrentUser(null);
    navigate('/login');
  };
  const handleDeleteClass = async (classId) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:4000/api/classes/${classId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to delete class');
      }
      alert(data.message);
    } catch (err) {
      console.error('Error deleting class:', err);
      alert(err.message || 'Failed to delete class');
    }
    setClasses(classes.filter(c => c.id !== classId));
    setBookings(bookings.filter(b => b.classId !== classId));
  };

  const handleUpdateClass = (updatedClass) => {
    setClasses(classes.map(c => c.id === updatedClass.id ? updatedClass : c));
  };

  const handleViewClass = (classId) => {
    const classToView = classes.find(c => c.id === classId);
    setSelectedClass(classToView);
    navigate('/class-edit');
  };

useEffect(() => {
  // Only redirect if the current path is protected and no user is logged in
  const protectedPaths = ["/admin", "/client", "/calendar", "/class-edit"];
  if (!currentUser && protectedPaths.includes(window.location.pathname)) {
    navigate("/login", { replace: true });
  }
}, [currentUser, navigate]);

  return (
    <div className="app-background">
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route
          path="/login"
          element={
            <LoginView
              onLogin={handleLogin}
              onSwitchToRegister={() => navigate("/register")}
            />
          }
        />
        <Route
          path="/register"
          element={
            <RegisterView
              onRegister={handleRegister}
              onSwitchToLogin={() => navigate("/login")}
            />
          }
        />
        <Route
          path="/admin"
          element={
            <AdminDashboard
              currentUser={currentUser}
              classes={classes}
              users={users}
              bookings={bookings}
              tokens={tokens}
              onCreateClass={handleCreateClass}
              onDeleteClass={handleDeleteClass}
              onLogout={handleLogout}
              onViewChange={() => navigate("/calendar")}
              onViewClass={handleViewClass}
            />    
          }
        />
        <Route
          path="/client"
          element={
            <ClientDashboard
              currentUser={currentUser}
              classes={classes}
              bookings={bookings}
              tokens={tokens}
              onBookClass={handleBookClass}
              onPurchaseTokens={handlePurchaseTokens}
              onLogout={handleLogout}
            />
          }
        />
        <Route
          path="/calendar"
          element={
            <CalendarView
              classes={classes}
              bookings={bookings}
              onBack={() => navigate("/admin")}
            />
          }
        />
        <Route
          path="/class-edit"
          element={selectedClass &&
            <ClassEditView
              classes={selectedClass}
              users={users}
              bookings={bookings}
              tokens={tokens}
              onSave={handleUpdateClass}
              onDelete={handleDeleteClass}
              onBack={() => navigate("/admin")}
            />
          }
        />
      </Routes>
    </div>
  );
}


