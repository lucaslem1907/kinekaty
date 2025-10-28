// src/App.js
import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, Navigate } from 'react-router-dom';
import ClientDashboard from './components/ClientDashboard';
import LoginView from './components/LoginView';
import RegisterView from './components/RegisterView';
import AdminDashboard from './components/AdminDashboard';
import CalendarView from './components/CalendarView';
import ClassEditView from './components/ClassEditView';
import PaymentSuccess from './components/PaymentSucces';
import {
  loginUser,
  fetchClasses,
  fetchBookings,
  fetchUsers,
  fetchTokens,
  createClass,
  updateClass,
  deleteClass,
  bookClass,
  purchaseTokens,
  buyTokens
} from './services/api';
import './styles/App.css';

export default function ClassBookingApp() {
  const [currentUser, setCurrentUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [tokens, setTokens] = useState([]);
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState(null);

  const navigate = useNavigate();

  // ---------------- LOGIN ----------------
  const handleLoginSubmit = async (userData) => {
    try {
      const data = await loginUser(userData);
      setCurrentUser(data.user);
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      navigate(data.user.isAdmin ? '/admin' : '/client');
    } catch (err) {
      alert(err.message);
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('token')
    localStorage.removeItem('user');
    navigate('/login');
  };

  // ---------------- REGISTER ----------------
  const handleRegister = (userData) => {
    const newUser = { ...userData, id: Date.now() };
    setUsers([...users, newUser]);
    return true;
  };

  // ---------------- FETCH DATA ----------------
  useEffect(() => {
  const token = localStorage.getItem("token");
  const storedUser = localStorage.getItem("user");

  if (token && storedUser) {
    const parsedUser = JSON.parse(storedUser);
    setCurrentUser(parsedUser);
    

    fetchUsers().then(setUsers).catch(() => setUsers([]));
    fetchClasses().then(setClasses).catch(() => setClasses([]));
    fetchBookings(parsedUser.isAdmin).then(setBookings).catch(() => setBookings([]));
    fetchTokens(parsedUser.isAdmin).then(setTokens).catch(() => setTokens([]));
  }
}, [currentUser]);
console.log(currentUser)

  // ---------------- CLASS HANDLERS ----------------
  const handleCreateClassSubmit = async (classData) => {
    try {
      const newClass = await createClass(classData);
      setClasses(prev => [...prev, newClass]);
    } catch (err) {
      alert(err.message);
    }
  };

  const handleUpdateClassSubmit = async (updatedClass) => {
    try {
      const newClass = await updateClass(updatedClass.id, updatedClass);
      setClasses(prev => prev.map(c => (c.id === newClass.id ? newClass : c)));
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDeleteClassSubmit = async (classId) => {
    try {
      await deleteClass(classId);
      setClasses(prev => prev.filter(c => c.id !== classId));
      setBookings(prev => prev.filter(b => b.classId !== classId));
    } catch (err) {
      alert(err.message);
    }
  };

  const handleViewClass = (classId) => {
    const classToView = classes.find(c => c.id === classId);
    setSelectedClass(classToView);
    navigate('/class-edit');
  };

  // ---------------- BOOKING & TOKENS ----------------
  const handleBookClassSubmit = async (classId) => {
    try {
      const data = await bookClass(classId, currentUser.id, currentUser.name);
      setBookings(prev => [...prev, data.booking]);
      alert(data.message);
    } catch (err) {
      alert(err.message);
    }
  };

  const handlePurchaseTokensSubmit = async (amount, tokens) => {

    try {
      await buyTokens(currentUser.id, amount, tokens);
      // Refetch tokens
      const updatedTokens = await fetchTokens(currentUser.isAdmin);
      setTokens(updatedTokens);
    } catch (err) {
      alert(err.message);
    }
  };

  // ---------------- PROTECTED ROUTES ----------------
  useEffect(() => {
    const protectedPaths = ['/admin', '/client', '/calendar', '/class-edit'];
    if (!currentUser && protectedPaths.includes(window.location.pathname)) {
      navigate('/login', { replace: true });
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
              onLogin={handleLoginSubmit}
              onSwitchToRegister={() => navigate('/register')}
            />
          }
        />

        <Route
          path="/success"
          element={
            <PaymentSuccess
              onBack={() => navigate('/client')}
            />
          }
        />

        <Route
          path="/register"
          element={
            <RegisterView
              onRegister={handleRegister}
              onSwitchToLogin={() => navigate('/login')}
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
              onCreateClass={handleCreateClassSubmit}
              onDeleteClass={handleDeleteClassSubmit}
              onUpdateClass={handleUpdateClassSubmit}
              onLogout={handleLogout}
              onViewClass={handleViewClass}
              onViewChange={() => navigate('/calendar')}
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
              onBookClass={handleBookClassSubmit}
              onPurchaseTokens={handlePurchaseTokensSubmit}
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
              onBack={() => navigate('/admin')}
            />
          }
        />

        <Route
          path="/class-edit"
          element={
            selectedClass ? (
              <ClassEditView
                classes={selectedClass}
                users={users}
                bookings={bookings}
                tokens={tokens}
                onSave={handleUpdateClassSubmit}
                onDelete={handleDeleteClassSubmit}
                onBack={() => navigate('/admin')}
              />
            ) : <Navigate to="/admin" />
          }
        />
      </Routes>
    </div>
  );
}
