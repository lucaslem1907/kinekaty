// src/components/AdminDashboard.js
import React, { useState } from 'react';
import { LogOut, Calendar, Users, Plus, Trash2, Coins } from 'lucide-react';
import '../styles/Dashboard.css';

export default function AdminDashboard({ currentUser, classes, users, bookings, onCreateClass, onDeleteClass, onLogout, onViewChange, onViewClass }) {
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [error, setError] = useState('');
    const [newClass, setNewClass] = useState({
        title: '',
        date: '',
        time: '',
        duration: '',
        location: '',
        latitude: 50.8503,
        longitude: 4.3517,
        capacity: '',
        description: ''
    });

    const handleCreateClass = async (e) => {
        e.preventDefault();

        onCreateClass(newClass);
        setNewClass({
            title: '',
            date: '',
            time: '',
            duration: '',
            location: '',
            latitude: 50.8503,
            longitude: 4.3517,
            capacity: '',
            description: ''
        });
        setError('');
        setShowCreateForm(false);
        alert('Class created successfully!');

    };

    const handleInputChange = (field, value) => {
        setNewClass({ ...newClass, [field]: value });
    };

    const clientUsers = users.filter(u => !u.isAdmin);
    const totalTokensInSystem = clientUsers.reduce((sum, user) => sum + (user.tokens || 0), 0);

    return (
        <div className="dashboard-container">
            {/* Header */}
            <header className="dashboard-header">
                <div>
                    <h1 className="dashboard-title">Admin Dashboard</h1>
                    <p className="dashboard-subtitle">Welcome back, {currentUser.name}</p>
                </div>
                <button onClick={onLogout} className="btn btn-danger">
                    <LogOut size={18} />
                    Logout
                </button>
            </header>

            {/* Stats Cards */}
            <div className="stats-grid">
                <div className="stat-card">
                    <div>
                        <div className="stat-value">{classes.length}</div>
                        {console.log(classes)}

                        <div className="stat-label">Total Classes</div>
                    </div>
                    <Calendar size={48} style={{ color: '#667eea', opacity: 0.3 }} />
                </div>

                <div className="stat-card">
                    <div>
                        <div className="stat-value">{users.length}</div>
                        <div className="stat-label">Total Clients</div>
                    </div>
                    <Users size={48} style={{ color: '#48bb78', opacity: 0.3 }} />
                </div>

                <div className="stat-card">
                    <div>
                        <div className="stat-value">{bookings.length}</div>
                        <div className="stat-label">Total Bookings</div>
                    </div>
                    <Calendar size={48} style={{ color: '#f56565', opacity: 0.3 }} />
                </div>

                <div className="stat-card">
                    <div>
                        <div className="stat-value">{totalTokensInSystem}</div>
                        <div className="stat-label">Active Tokens</div>
                    </div>
                    <Coins size={48} style={{ color: '#ffa500', opacity: 0.3 }} />
                </div>
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
                <button
                    onClick={() => setShowCreateForm(!showCreateForm)}
                    className="btn btn-primary"
                >
                    <Plus size={18} />
                    {showCreateForm ? 'Cancel' : 'Create New Class'}
                </button>
                <button
                    onClick={() => onViewChange('calendar-view')}
                    className="btn btn-secondary"
                >
                    <Calendar size={18} />
                    View Calendar
                </button>
            </div>

            {/* Create Class Form */}
            {showCreateForm && (
                <div className="card-form">
                    <h2 className="card-title">Create New Class</h2>
                    <form onSubmit={handleCreateClass}>
                        <div className="form-grid">
                            <div className="form-group">
                                <label className="form-label">Class Title *</label>
                                <input
                                    type="text"
                                    value={newClass.title}
                                    onChange={(e) => handleInputChange('title', e.target.value)}
                                    className="form-input"
                                    placeholder="e.g., Yoga for Beginners"
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">Date *</label>
                                <input
                                    type="date"
                                    value={newClass.date}
                                    onChange={(e) => handleInputChange('date', e.target.value)}
                                    className="form-input"
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">Time *</label>
                                <input
                                    type="time"
                                    value={newClass.time}
                                    onChange={(e) => handleInputChange('time', e.target.value)}
                                    className="form-input"
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">Duration (minutes) *</label>
                                <input
                                    type="number"
                                    value={newClass.duration}
                                    onChange={(e) => handleInputChange('duration', e.target.value)}
                                    className="form-input"
                                    placeholder="60"
                                    min="15"
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">Location *</label>
                                <input
                                    type="text"
                                    value={newClass.location}
                                    onChange={(e) => handleInputChange('location', e.target.value)}
                                    className="form-input"
                                    placeholder="Studio A, Main Street 123"
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">Capacity *</label>
                                <input
                                    type="number"
                                    value={newClass.capacity}
                                    onChange={(e) => handleInputChange('capacity', e.target.value)}
                                    className="form-input"
                                    placeholder="20"
                                    min="1"
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">Latitude</label>
                                <input
                                    type="number"
                                    step="0.0001"
                                    value={newClass.latitude}
                                    onChange={(e) => handleInputChange('latitude', parseFloat(e.target.value))}
                                    className="form-input"
                                    placeholder="50.8503"
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">Longitude</label>
                                <input
                                    type="number"
                                    step="0.0001"
                                    value={newClass.longitude}
                                    onChange={(e) => handleInputChange('longitude', parseFloat(e.target.value))}
                                    className="form-input"
                                    placeholder="4.3517"
                                />
                            </div>


                            <div className="form-group">
                                <label className="form-label">Description *</label>
                                <textarea
                                    value={newClass.description}
                                    onChange={(e) => handleInputChange('description', e.target.value)}
                                    className="form-input"
                                    placeholder="Describe the class..."
                                    required
                                />
                            </div>

                        </div>
                        <button type="submit" className="btn btn-primary">
                            <Plus size={18} />
                            Create Class
                        </button>
                    </form>
                </div>
            )}

            {/* Classes List */}
            <div className="card">
                <h2 className="card-title">All Classes</h2>
                {classes.length === 0 ? (
                    <p className="text-muted">No classes created yet. Click "Create New Class" to get started!</p>
                ) : (
                    <div className="class-list">
                        {classes.map((cls) => {
                            const classBookings = bookings.filter(b => b.classId === cls.id);
                            return (
                                <div key={cls.id} className="class-list-item" style={{ cursor: 'pointer' }} >
                                    <div className="class-list-content" onClick={() => onViewClass(cls.id)}>
                                        <div style={{ flex: 1 }}>
                                            <h3 className="class-title">{cls.title}</h3>
                                            <p className="class-description">{cls.description}</p>
                                            <div className="class-details">
                                                <span><Calendar size={14} /> {cls.date}</span>
                                                <span>⏰ {cls.time} ({cls.duration} min)</span>
                                                <span>📍 {cls.location}</span>
                                            </div>
                                        </div>
                                        <div className="class-list-actions">
                                            <span className="badge badge-primary">
                                                {classBookings.length}/{cls.capacity} booked
                                            </span>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    if (window.confirm('Are you sure you want to delete this class?')) {
                                                        onDeleteClass(cls.id);
                                                    }
                                                }}
                                                className="btn btn-danger"
                                                style={{ marginTop: '8px' }}
                                            >
                                                <Trash2 size={16} />
                                                Delete
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Client Database */}
            <div className="card">
                <h2 className="card-title">Client Database</h2>
                {clientUsers.length === 0 ? (
                    <p className="text-muted">No clients registered yet.</p>
                ) : (
                    <div style={{ overflowX: 'auto' }}>
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>Name</th>
                                    <th>Email</th>
                                    <th>Phone</th>
                                    <th>City</th>
                                    <th>Tokens</th>
                                    <th>Bookings</th>
                                    <th>Joined</th>
                                </tr>
                            </thead>
                            <tbody>
                                {clientUsers.map((user) => {
                                    const userBookings = bookings.filter(b => b.userId === user.id);
                                    return (
                                        <tr key={user.id}>
                                            <td style={{ fontWeight: 600 }}>{user.name}</td>
                                            <td>{user.email}</td>
                                            <td>{user.phone}</td>
                                            <td>{user.city || 'N/A'}</td>
                                            <td>
                                                <span className="badge badge-warning">
                                                    <Coins size={12} /> {user.tokens || 0}
                                                </span>
                                            </td>
                                            <td>
                                                <span className="badge badge-primary">
                                                    {userBookings.length} classes
                                                </span>
                                            </td>
                                            <td style={{ fontSize: '13px', color: '#718096' }}>
                                                {new Date(user.createdAt).toLocaleDateString()}
                                            </td>
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