import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Users,
  Plus,
  LogIn,
  LogOut,
  User,
  Clock,
  MapPin,
  Search,
} from 'lucide-react';
import ClientDashboard from './components/ClientDashboard.js';
import LoginView from './components/LoginView.js';
import RegisterView from './components/RegisterView.js';
import AdminDashboard from './components/AdminDashboard.js';
import './styles/App.css';

/* ------------------- MAIN APP ------------------- */

export default function ClassBookingApp() {
  const [currentUser, setCurrentUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [view, setView] = useState('login');
  const [classes, setClasses] = useState([]);

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
    if (currentUser.tokens < 1) {
      return { success: false, message: 'Not enough tokens! Please purchase more.' };
    }

    // Deduct token
    const updatedUser = { ...currentUser, tokens: currentUser.tokens - 1 };
    setCurrentUser(updatedUser);

    // Update user in users array
    setUsers(users.map(u => u.id === updatedUser.id ? updatedUser : u));

    // Create booking
    const newBooking = {
      id: Date.now(),
      classId,
      userId: currentUser.id,
      bookedAt: new Date().toISOString(),
      tokensUsed: 1
    };
    setBookings([...bookings, newBooking]);

    return { success: true, message: 'Class booked successfully! 1 token used.' };
  };

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
    </div>
  );
}





/* ------------------- ADMIN DASHBOARD ------------------- */
/*function AdminDashboard({
  currentUser,
  onLogout,
  onViewChange,
}) {
  const [classes, setClasses] = useState([]);
  const [newClass, setNewClass] = useState({
    title: '',
    description: '',
    date: '',
    time: '',
    duration: '',
    location: '',
    capacity: '',
  });
  const [error, setError] = useState('');

  // Load classes from backend
  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const res = await fetch('http://localhost:4000/api/classes');
        const data = await res.json();
        setClasses(data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchClasses();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('http://localhost:4000/api/classes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newClass),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create class');

      setClasses((prev) => [...prev, data]);
      setNewClass({
        title: '',
        description: '',
        date: '',
        time: '',
        duration: '',
        location: '',
        capacity: '',
      });
      setError('');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <h1>
          <Users className="icon-small" /> Welcome, {currentUser.name}
        </h1>
        <div className="dashboard-actions">
          <button className="btn-secondary" onClick={() => onViewChange('calendar-view')}>
            <Calendar className="icon-small" /> View Calendar
          </button>
          <button className="btn-danger" onClick={onLogout}>
            <LogOut className="icon-small" /> Logout
          </button>
        </div>
      </header>

      <section className="dashboard-section">
        <h2>Create New Class</h2>
        <form onSubmit={handleCreate} className="class-form">
          <input
            className='form-input'
            type="text"
            placeholder="Title"
            value={newClass.title}
            onChange={(e) => setNewClass({ ...newClass, title: e.target.value })}
            required
          />
          <input
            className='form-input'
            type="text"
            placeholder="Description"
            value={newClass.description}
            onChange={(e) => setNewClass({ ...newClass, description: e.target.value })}
          />
          <input
            className='form-input'
            type="date"
            value={newClass.date}
            onChange={(e) => setNewClass({ ...newClass, date: e.target.value })}
            required
          />
          <input
            className='form-input'
            type="time"
            value={newClass.time}
            onChange={(e) => setNewClass({ ...newClass, time: e.target.value })}
            required
          />
          <input
            className='form-input'
            type="number"
            placeholder="Duration (minutes)"
            value={newClass.duration}
            onChange={(e) => setNewClass({ ...newClass, duration: e.target.value })}
            required
          />
          <input
            className='form-input'
            type="text"
            placeholder="Location"
            value={newClass.location}
            onChange={(e) => setNewClass({ ...newClass, location: e.target.value })}
            required
          />
          <input
            className='form-input'
            type="number"
            placeholder="Capacity"
            value={newClass.capacity}
            onChange={(e) => setNewClass({ ...newClass, capacity: e.target.value })}
            required
          />

          {error && <p className="error-text">{error}</p>}
          <button type="submit" className="btn-primary">Add Class</button>
        </form>
      </section>

      <section className="dashboard-section">
        <h2>Existing Classes</h2>
        <div className="card-grid">
          {classes.map((c) => (
            <div key={c.id} className="card">
              <h3>{c.title}</h3>
              <p>{c.description}</p>
              <p>{new Date(c.date).toLocaleDateString()} @ {c.time}</p>
              <p>{c.location}</p>
              <p>Duration: {c.duration} min | Capacity: {c.capacity}</p>
            </div>
          ))}
          {classes.length === 0 && <p>No classes yet.</p>}
        </div>
      </section>
    </div>
  );
}


/* ------------------- CALENDAR VIEW ------------------- */
function CalendarView({ classes, bookings, onBack }) {
  const [classes2, setClasses] = useState([]);

  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const res = await fetch('http://localhost:4000/api/classes');
        const data = await res.json();
        setClasses(data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchClasses();
  }, []);

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <h1>
          <Calendar className="icon-small" /> Class Calendar
        </h1>
        <button className="btn-secondary" onClick={onBack}>
          Back
        </button>
      </header>

      <section className="dashboard-section">
        <h2>Existing Classes</h2>
        <div className="card-grid">
          {classes2.map((c) => (
            <div key={c.id} className="card">
              <h3>{c.title}</h3>
              <p>{c.description}</p>
              <p>{new Date(c.date).toLocaleDateString()} @ {c.time}</p>
              <p>{c.location}</p>
              <p>Duration: {c.duration} min | Capacity: {c.capacity}</p>
            </div>
          ))}
          {classes2.length === 0 && <p>No classes yet.</p>}
        </div>
      </section>
    </div>
  );
}
