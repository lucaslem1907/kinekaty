import React, { useState, useEffect } from 'react';
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
  const [view, setView] = useState('login');
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState(null);



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
      setView(data.user.isAdmin ? 'admin-dashboard' : 'client-dashboard');
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
  },[]);

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

  const handleBookClass = (classId) => {
    // Check if user has tokens
    /*if (currentUser.tokens < 1) {
      return { success: false, message: 'Not enough tokens! Please purchase more.' };
    }

    // Deduct token
    const updatedUser = { ...currentUser, tokens: currentUser.tokens - 1 };
    setCurrentUser(updatedUser);

    // Update user in users array
    setUsers(users.map(u => u.id === updatedUser.id ? updatedUser : u));*/

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
      };
    }
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

      if (!res.ok) {
        console.error('Failed to load bookings:', data.error);
        setBookings([]); // fallback
        return;
      }
      console.log('Fetched bookings:', data);
      setBookings(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error fetching bookings:', err);
      setBookings([]);
    }
  };

  fetchBookings();
}, [currentUser]);

  const handlePurchaseTokens = (amount) => {
    const updatedUser = { ...currentUser, tokens: currentUser.tokens + amount };
    setCurrentUser(updatedUser);
    setUsers(users.map(u => u.id === updatedUser.id ? updatedUser : u));
    return true;
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setView('login');
  };
  const handleDeleteClass = (classId) => {
    setClasses(classes.filter(c => c.id !== classId));
    setBookings(bookings.filter(b => b.classId !== classId));
  };

  const handleUpdateClass = (updatedClass) => {
    setClasses(classes.map(c => c.id === updatedClass.id ? updatedClass : c));
  };

  const handleViewClass = (classId) => {
    const classToView = classes.find(c => c.id === classId);
    setSelectedClass(classToView);
    setView('class-edit');
  };

  return (
    <div className="app-background">
      {view === 'login' && (
        <LoginView
          onLogin={handleLogin}
          onSwitchToRegister={() => setView('register')}
        />
      )}
      {view === 'register' && (
        <RegisterView
          onRegister={handleRegister}
          onSwitchToLogin={() => setView('login')}
        />
      )}
      {view === 'admin-dashboard' && (
        <AdminDashboard
          currentUser={currentUser}
          classes={classes}
          users={users}
          bookings={bookings}
          onCreateClass={handleCreateClass}
          onDeleteClass={handleDeleteClass}
          onLogout={handleLogout}
          onViewChange={setView}
          onViewClass={handleViewClass}
        />
      )}
      {view === 'client-dashboard' && (
        <ClientDashboard
          currentUser={currentUser}
          classes={classes}
          bookings={bookings}
          onBookClass={handleBookClass}
          onPurchaseTokens={handlePurchaseTokens}
          onLogout={handleLogout}
        />
      )}
      {view === 'calendar-view' && (
        <CalendarView
          classes={classes}
          bookings={bookings}
          onBack={() => setView('admin-dashboard')}
        />
      )}
      {view === 'class-edit' && selectedClass && (
        <ClassEditView
          classes={selectedClass}
          users={users}
          bookings={bookings}
          onSave={handleUpdateClass}
          onDelete={handleDeleteClass}
          onBack={() => setView('admin-dashboard')}
        />
      )}
    </div>
  );
}


