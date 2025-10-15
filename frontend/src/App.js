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
import './App.css';

export default function ClassBookingApp() {
  const [currentUser, setCurrentUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [classes, setClasses] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [view, setView] = useState('login');

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

  // Fetch classes on component mount
  /*useEffect(() => {
    const fetchClasses = async () => {
      const res = await fetch('http://localhost:4000/api/classes');
      const data = await res.json();
      setClasses(data);
    };
    fetchClasses();
  }, []);-->*/

  const handleBookClass = (classId) => {
    const newBooking = {
      id: Date.now(),
      classId,
      userId: currentUser.id,
      bookedAt: new Date().toISOString(),
    };
    setBookings([...bookings, newBooking]);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setView('login');
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

/* ------------------- LOGIN ------------------- */
function LoginView({ onLogin, onSwitchToRegister }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    const success = await onLogin({ email, password, isAdmin });
    if (!success) setError('Invalid credentials or role');

    try {
      const res = await fetch('http://localhost:4000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, isAdmin }),
      });
      const data = await res.json();
      if (!res.ok)
        throw new Error(data.error || 'Login failed')
      return;

      // Pass token and user to parent
      localStorage.setItem('token', data.token);
      onLogin(data.user);
      setError('');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-box">
        <div className="auth-header">
          <Calendar className="icon-large" />
          <h1>Class Booking System</h1>
          <p>Login to manage or book classes</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <label>Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <label>Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <div className="checkbox-row">
            <input
              type="checkbox"
              checked={isAdmin}
              onChange={(e) => setIsAdmin(e.target.checked)}
            />
            <label>Login as Administrator</label>
          </div>

          {error && <p className="error-text">{error}</p>}

          <button type="submit" className="btn-primary">
            <LogIn className="icon-small" /> Login
          </button>
        </form>

        <div className="switch-auth">
          <button onClick={onSwitchToRegister}>
            Don’t have an account? Register here
          </button>
        </div>
      </div>
    </div>
  );
}

/* ------------------- REGISTER ------------------- */
function RegisterView({ onRegister, onSwitchToLogin }) {
  const [isAdmin, setIsAdmin] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    isAdmin: isAdmin
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
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
  };

  return (
    <div className="auth-container">
      <div className="auth-box">
        <h2>Create Account</h2>
        {success ? (
          <div className="success-box">
            Account created successfully! Redirecting to login...
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="auth-form">
            <label>Full Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              required
            />

            <label>Email</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              required
            />

            <label>Phone</label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) =>
                setFormData({ ...formData, phone: e.target.value })
              }
              required
            />

            <label>Password</label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
              required
            />

            <div className="checkbox-row">
              <input
                type="checkbox"
                checked={formData.isAdmin}
                onChange={(e) => setIsAdmin(e.target.checked)}

              />
              <label>Register as Administrator</label>
            </div>

            <button type="submit" className="btn-primary">
              Register
            </button>
          </form>
        )}
        <div className="switch-auth">
          <button onClick={onSwitchToLogin}>
            Already have an account? Login here
          </button>
        </div>
      </div>
    </div>
  );
}

/* ------------------- ADMIN DASHBOARD ------------------- */
function AdminDashboard({
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

/* ------------------- CLIENT DASHBOARD ------------------- */
function ClientDashboard({ currentUser, classes, bookings, onBookClass, onLogout }) {
  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <h1>
          <User className="icon-small" /> Hi, {currentUser.name}
        </h1>
        <button className="btn-danger" onClick={onLogout}>
          <LogOut className="icon-small" /> Logout
        </button>
      </header>

      <section className="dashboard-section">
        <h2>Available Classes</h2>
        <div className="card-grid">
          {classes.map((c) => (
            <div key={c.id} className="card">
              <h3>{c.name}</h3>
              <p>
                <User className="icon-tiny" /> {c.instructor}
              </p>
              <p>
                <Clock className="icon-tiny" /> {c.date} @ {c.time}
              </p>
              <p>
                <MapPin className="icon-tiny" /> {c.location}
              </p>
              <button className="btn-primary" onClick={() => onBookClass(c.id)}>
                Book
              </button>
            </div>
          ))}
          {classes.length === 0 && <p>No available classes yet.</p>}
        </div>
      </section>

      <section className="dashboard-section">
        <h2>Your Bookings</h2>
        <ul className="booking-list">
          {bookings
            .filter((b) => b.userId === currentUser.id)
            .map((b) => {
              const cls = classes.find((c) => c.id === b.classId);
              return (
                <li key={b.id}>
                  {cls ? `${cls.name} - ${cls.date} @ ${cls.time}` : 'Unknown class'}
                </li>
              );
            })}
          {bookings.filter((b) => b.userId === currentUser.id).length === 0 && (
            <p>You have no bookings yet.</p>
          )}
        </