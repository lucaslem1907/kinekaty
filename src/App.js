import React, { useState } from 'react';
import { Calendar, Users, Plus, LogIn, LogOut, User, Clock, MapPin, Search } from 'lucide-react';

// Main App Component
export default function ClassBookingApp() {
  // STATE MANAGEMENT - This stores all our app data
  const [currentUser, setCurrentUser] = useState(null); // Who is logged in?
  const [users, setUsers] = useState([]); // All registered users
  const [classes, setClasses] = useState([]); // All classes created
  const [bookings, setBookings] = useState([]); // All bookings made
  const [view, setView] = useState('login'); // Which page are we on?

  // LOGIN FUNCTION - Checks if user exists
  const handleLogin = (email, password, isAdmin) => {
    const user = users.find(u => u.email === email && u.password === password && u.isAdmin === isAdmin);
    if (user) {
      setCurrentUser(user);
      setView(isAdmin ? 'admin-dashboard' : 'client-dashboard');
      return true;
    }
    return false;
  };

  // REGISTER FUNCTION - Creates new user account
  const handleRegister = (userData) => {
    const newUser = { ...userData, id: Date.now() };
    setUsers([...users, newUser]);
    return true;
  };

  // CREATE CLASS FUNCTION - Admin creates a new class
  const handleCreateClass = (classData) => {
    const newClass = { ...classData, id: Date.now() };
    setClasses([...classes, newClass]);
  };

  // BOOKING FUNCTION - Client books a class
  const handleBookClass = (classId) => {
    const newBooking = {
      id: Date.now(),
      classId,
      userId: currentUser.id,
      bookedAt: new Date().toISOString()
    };
    setBookings([...bookings, newBooking]);
  };

  // LOGOUT FUNCTION
  const handleLogout = () => {
    setCurrentUser(null);
    setView('login');
  };

  // RENDER DIFFERENT VIEWS BASED ON STATE
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {view === 'login' && <LoginView onLogin={handleLogin} onSwitchToRegister={() => setView('register')} />}
      {view === 'register' && <RegisterView onRegister={handleRegister} onSwitchToLogin={() => setView('login')} />}
      {view === 'admin-dashboard' && <AdminDashboard currentUser={currentUser} classes={classes} users={users} bookings={bookings} onCreateClass={handleCreateClass} onLogout={handleLogout} onViewChange={setView} />}
      {view === 'client-dashboard' && <ClientDashboard currentUser={currentUser} classes={classes} bookings={bookings} onBookClass={handleBookClass} onLogout={handleLogout} />}
      {view === 'calendar-view' && <CalendarView classes={classes} bookings={bookings} onBack={() => setView('admin-dashboard')} />}
    </div>
  );
}

// LOGIN PAGE COMPONENT
function LoginView({ onLogin, onSwitchToRegister }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (onLogin(email, password, isAdmin)) {
      setError('');
    } else {
      setError('Invalid credentials. Please try again.');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen p-4">
      <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <Calendar className="w-12 h-12 text-indigo-600 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-gray-800">Class Booking System</h1>
          <p className="text-gray-600 mt-2">Login to manage or book classes</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              placeholder="your@email.com"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              placeholder="••••••••"
              required
            />
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="isAdmin"
              checked={isAdmin}
              onChange={(e) => setIsAdmin(e.target.checked)}
              className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
            />
            <label htmlFor="isAdmin" className="ml-2 text-sm text-gray-700">Login as Administrator</label>
          </div>

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <button type="submit" className="w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 transition flex items-center justify-center gap-2">
            <LogIn className="w-4 h-4" />
            Login
          </button>
        </form>

        <div className="mt-6 text-center">
          <button onClick={onSwitchToRegister} className="text-indigo-600 hover:text-indigo-700 text-sm">
            Don't have an account? Register here
          </button>
        </div>
      </div>
    </div>
  );
}

// REGISTER PAGE COMPONENT
function RegisterView({ onRegister, onSwitchToLogin }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    isAdmin: false
  });
  const [success, setSuccess] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    onRegister(formData);
    setSuccess(true);
    setTimeout(() => {
      onSwitchToLogin();
    }, 1500);
  };

  return (
    <div className="flex items-center justify-center min-h-screen p-4">
      <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Create Account</h2>

        {success ? (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
            <p className="text-green-800">Account created successfully! Redirecting to login...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isAdminReg"
                  checked={formData.isAdmin}
                  onChange={(e) => setFormData({...formData, isAdmin: e.target.checked})}
                  className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
                />
                <label htmlFor="isAdminReg" className="ml-2 text-sm font-medium text-gray-900">
                  Register as Administrator
                </label>
              </div>
              <p className="text-xs text-gray-600 mt-1 ml-6">Check this if you want to create and manage classes</p>
            </div>

            <button type="submit" className="w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 transition">
              Register
            </button>
          </form>
        )}

        <div className="mt-6 text-center">
          <button onClick={onSwitchToLogin} className="text-indigo-600 hover:text-indigo-700 text-sm">
            Already have an account? Login here
          </button>
        </div>
      </div>
    </div>
  );
}

// ADMIN DASHBOARD COMPONENT
function AdminDashboard({ currentUser, classes, users, bookings, onCreateClass, onLogout, onViewChange }) {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newClass, setNewClass] = useState({
    title: '',
    date: '',
    time: '',
    duration: '',
    location: '',
    capacity: '',
    description: ''
  });

  const handleCreateClass = (e) => {
    e.preventDefault();
    onCreateClass(newClass);
    setNewClass({ title: '', date: '', time: '', duration: '', location: '', capacity: '', description: '' });
    setShowCreateForm(false);
  };

  const clientUsers = users.filter(u => !u.isAdmin);

  return (
    <div className="min-h-screen p-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Admin Dashboard</h1>
            <p className="text-gray-600">Welcome back, {currentUser.name}</p>
          </div>
          <button onClick={onLogout} className="flex items-center gap-2 bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600">
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Total Classes</p>
              <p className="text-3xl font-bold text-indigo-600">{classes.length}</p>
            </div>
            <Calendar className="w-12 h-12 text-indigo-200" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Total Clients</p>
              <p className="text-3xl font-bold text-green-600">{clientUsers.length}</p>
            </div>
            <Users className="w-12 h-12 text-green-200" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Total Bookings</p>
              <p className="text-3xl font-bold text-purple-600">{bookings.length}</p>
            </div>
            <Calendar className="w-12 h-12 text-purple-200" />
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-4 mb-6">
        <button onClick={() => setShowCreateForm(!showCreateForm)} className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 flex items-center gap-2">
          <Plus className="w-5 h-5" />
          Create New Class
        </button>
        <button onClick={() => onViewChange('calendar-view')} className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 flex items-center gap-2">
          <Calendar className="w-5 h-5" />
          View Calendar
        </button>
      </div>

      {/* Create Class Form */}
      {showCreateForm && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Create New Class</h2>
          <form onSubmit={handleCreateClass} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Class Title</label>
              <input type="text" value={newClass.title} onChange={(e) => setNewClass({...newClass, title: e.target.value})} className="w-full px-4 py-2 border border-gray-300 rounded-lg" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
              <input type="date" value={newClass.date} onChange={(e) => setNewClass({...newClass, date: e.target.value})} className="w-full px-4 py-2 border border-gray-300 rounded-lg" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Time</label>
              <input type="time" value={newClass.time} onChange={(e) => setNewClass({...newClass, time: e.target.value})} className="w-full px-4 py-2 border border-gray-300 rounded-lg" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Duration (minutes)</label>
              <input type="number" value={newClass.duration} onChange={(e) => setNewClass({...newClass, duration: e.target.value})} className="w-full px-4 py-2 border border-gray-300 rounded-lg" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
              <input type="text" value={newClass.location} onChange={(e) => setNewClass({...newClass, location: e.target.value})} className="w-full px-4 py-2 border border-gray-300 rounded-lg" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Capacity</label>
              <input type="number" value={newClass.capacity} onChange={(e) => setNewClass({...newClass, capacity: e.target.value})} className="w-full px-4 py-2 border border-gray-300 rounded-lg" required />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea value={newClass.description} onChange={(e) => setNewClass({...newClass, description: e.target.value})} className="w-full px-4 py-2 border border-gray-300 rounded-lg" rows="3" required />
            </div>
            <div className="md:col-span-2 flex gap-4">
              <button type="submit" className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700">Create Class</button>
              <button type="button" onClick={() => setShowCreateForm(false)} className="bg-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-400">Cancel</button>
            </div>
          </form>
        </div>
      )}

      {/* Classes List */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4">All Classes</h2>
        {classes.length === 0 ? (
          <p className="text-gray-600">No classes created yet. Click "Create New Class" to get started!</p>
        ) : (
          <div className="space-y-4">
            {classes.map((cls) => {
              const classBookings = bookings.filter(b => b.classId === cls.id);
              return (
                <div key={cls.id} className="border border-gray-200 rounded-lg p-4 hover:border-indigo-300 transition">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800">{cls.title}</h3>
                      <p className="text-gray-600 text-sm mt-1">{cls.description}</p>
                      <div className="flex gap-4 mt-2 text-sm text-gray-600">
                        <span className="flex items-center gap-1"><Calendar className="w-4 h-4" /> {cls.date}</span>
                        <span className="flex items-center gap-1"><Clock className="w-4 h-4" /> {cls.time}</span>
                        <span className="flex items-center gap-1"><MapPin className="w-4 h-4" /> {cls.location}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full text-sm">
                        {classBookings.length}/{cls.capacity} booked
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Client Database */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Client Database</h2>
        {clientUsers.length === 0 ? (
          <p className="text-gray-600">No clients registered yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Name</th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Email</th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Phone</th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Bookings</th>
                </tr>
              </thead>
              <tbody>
                {clientUsers.map((user) => {
                  const userBookings = bookings.filter(b => b.userId === user.id);
                  return (
                    <tr key={user.id} className="border-t border-gray-200">
                      <td className="px-4 py-3 text-sm text-gray-800">{user.name}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{user.email}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{user.phone}</td>
                      <td className="px-4 py-3 text-sm text-indigo-600 font-medium">{userBookings.length} classes</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

// CLIENT DASHBOARD COMPONENT
function ClientDashboard({ currentUser, classes, bookings, onBookClass, onLogout }) {
  const [searchStep, setSearchStep] = useState(1);
  const [selectedDate, setSelectedDate] = useState('');
  const [filteredClasses, setFilteredClasses] = useState([]);

  const myBookings = bookings.filter(b => b.userId === currentUser.id);

  const handleSearchDate = () => {
    const filtered = classes.filter(cls => cls.date === selectedDate);
    setFilteredClasses(filtered);
    setSearchStep(2);
  };

  const handleBooking = (classId) => {
    onBookClass(classId);
    alert('Class booked successfully!');
  };

  return (
    <div className="min-h-screen p-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">My Dashboard</h1>
            <p className="text-gray-600">Welcome, {currentUser.name}</p>
          </div>
          <button onClick={onLogout} className="flex items-center gap-2 bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600">
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
      </div>

      {/* My Bookings */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4">My Bookings</h2>
        {myBookings.length === 0 ? (
          <p className="text-gray-600">You haven't booked any classes yet.</p>
        ) : (
          <div className="space-y-4">
            {myBookings.map((booking) => {
              const cls = classes.find(c => c.id === booking.classId);
              if (!cls) return null;
              return (
                <div key={booking.id} className="border border-gray-200 rounded-lg p-4 bg-green-50">
                  <h3 className="text-lg font-semibold text-gray-800">{cls.title}</h3>
                  <div className="flex gap-4 mt-2 text-sm text-gray-600">
                    <span className="flex items-center gap-1"><Calendar className="w-4 h-4" /> {cls.date}</span>
                    <span className="flex items-center gap-1"><Clock className="w-4 h-4" /> {cls.time}</span>
                    <span className="flex items-center gap-1"><MapPin className="w-4 h-4" /> {cls.location}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Book New Class - Step by Step */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Book a New Class</h2>
        
        {/* Step 1: Select Date */}
        {searchStep === 1 && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-indigo-600 font-medium">
              <div className="w-8 h-8 bg-indigo-600 text-white rounded-full flex items-center justify-center">1</div>
              <span>Choose a date</span>
            </div>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full md:w-64 px-4 py-2 border border-gray-300 rounded-lg"
            />
            <button
              onClick={handleSearchDate}
              disabled={!selectedDate}
              className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 disabled:bg-gray-400 flex items-center gap-2"
            >
              <Search className="w-4 h-4" />
              Search Available Classes
            </button>
          </div>
        )}

        {/* Step 2: Select Class */}
        {searchStep === 2 && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-indigo-600 font-medium mb-4">
              <div className="w-8 h-8 bg-indigo-600 text-white rounded-full flex items-center justify-center">2</div>
              <span>Select a class for {selectedDate}</span>
            </div>
            
            <button onClick={() => setSearchStep(1)} className="text-indigo-600 hover:text-indigo-700 text-sm mb-4">
              ← Change date
            </button>

            {filteredClasses.length === 0 ? (
              <p className="text-gray-600">No classes available on this date. Try another date!</p>
            ) : (
              <div className="space-y-4">
                {filteredClasses.map((cls) => {
                  const classBookings = bookings.filter(b => b.classId === cls.id);
                  const isBooked = myBookings.some(b => b.classId === cls.id);
                  const isFull = classBookings.length >= parseInt(cls.capacity);

                  return (
                    <div key={cls.id} className="border border-gray-200 rounded-lg p-4 hover:border-indigo-300 transition">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-gray-800">{cls.title}</h3>
                          <p className="text-gray-600 text-sm mt-1">{cls.description}</p>
                          <div className="flex gap-4 mt-2 text-sm text-gray-600">
                            <span className="flex items-center gap-1"><Clock className="w-4 h-4" /> {cls.time} ({cls.duration} min)</span>
                            <span className="flex items-center gap-1"><MapPin className="w-4 h-4" /> {cls.location}</span>
                          </div>
                          <div className="mt-2">
                            <span className="text-sm text-gray-600">
                              {classBookings.length}/{cls.capacity} spots taken
                            </span>
                          </div>
                        </div>
                        <div>
                          {isBooked ? (
                            <span className="bg-green-100 text-green-800 px-4 py-2 rounded-lg text-sm">Already Booked</span>
                          ) : isFull ? (
                            <span className="bg-red-100 text-red-800 px-4 py-2 rounded-lg text-sm">Full</span>
                          ) : (
                            <button
                              onClick={() => handleBooking(cls.id)}
                              className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700"
                            >
                              Book Now
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// CALENDAR VIEW COMPONENT
function CalendarView({ classes, bookings, onBack }) {
  const [viewMode, setViewMode] = useState('week'); // 'week' or 'month'

  // Get current week dates
  const getWeekDates = () => {
    const today = new Date();
    const week = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() - today.getDay() + i);
      week.push(date);
    }
    return week;
  };

  const weekDates = getWeekDates();

  return (
    <div className="min-h-screen p-6">
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-800">Calendar View</h1>
          <div className="flex gap-4">
            <button
              onClick={() => setViewMode('week')}
              className={`px-4 py-2 rounded-lg ${viewMode === 'week' ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-700'}`}
            >
              Week
            </button>
            <button
              onClick={() => setViewMode('month')}
              className={`px-4 py-2 rounded-lg ${viewMode === 'month' ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-700'}`}
            >
              Month
            </button>
            <button onClick={onBack} className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700">
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>

      {/* Weekly View */}
      {viewMode === 'week' && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Weekly Calendar</h2>
          <div className="grid grid-cols-7 gap-2">
            {weekDates.map((date, idx) => {
              const dateStr = date.toISOString().split('T')[0];
              const dayClasses = classes.filter(cls => cls.date === dateStr);
              const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
              
              return (
                <div key={idx} className="border border-gray-200 rounded-lg p-3 min-h-[150px]">
                  <div className="font-semibold text-gray-800 mb-2">
                    {dayNames[date.getDay()]}
                    <div className="text-sm text-gray-600">{date.getDate()}/{date.getMonth() + 1}</div>
                  </div>
                  <div className="space-y-2">
                    {dayClasses.map(cls => {
                      const classBookings = bookings.filter(b => b.classId === cls.id);
                      return (
                        <div key={cls.id} className="bg-indigo-100 p-2 rounded text-xs">
                          <div className="font-medium text-indigo-900">{cls.title}</div>
                          <div className="text-indigo-700">{cls.time}</div>
                          <div className="text-indigo-600">{classBookings.length}/{cls.capacity}</div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Monthly View */}
      {viewMode === 'month' && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Monthly Overview</h2>
          <div className="space-y-3">
            {classes.map(cls => {
              const classBookings = bookings.filter(b => b.classId === cls.id);
              return (
                <div key={cls.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="font-semibold text-gray-800">{cls.title}</h3>
                      <div className="text-sm text-gray-600 mt-1">
                        {cls.date} at {cls.time} - {cls.location}
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full text-sm">
                        {classBookings.length}/{cls.capacity} booked
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
            {classes.length === 0 && (
              <p className="text-gray-600 text-center py-8">No classes scheduled yet.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}