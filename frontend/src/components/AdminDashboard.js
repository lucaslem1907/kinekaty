// src/components/AdminDashboard.js
import React, { useState } from 'react';
import { LogOut, Calendar, Users, Plus, Trash2, Coins } from 'lucide-react';
import '../styles/Dashboard.css';
import { formatDate } from '../utils/helpers';

export default function AdminDashboard({ currentUser, classes, users, bookings, tokens, onCreateClass, onDeleteClass, onLogout, onViewChange, onViewClass, onViewUser }) {
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [newClass, setNewClass] = useState({
        title: '',
        date: '',
        time: '',
        duration: '',
        location: '',
        capacity: '',
        description: '',
        tokenCost: '1'
    });

    const handleExportUsersCSV = () => {
        const tokenList = Array.isArray(tokens) ? tokens : [];
        const headers = ['Name', 'Email', 'Phone', 'City', 'Token Balance', 'Bookings', 'Joined'];
        const rows = users.map(u => {
            const userBookings = bookings.filter(b => b.userId === u.id).length;
            const t = tokenList.find(t => t.id === u.id);
            return [
                u.name,
                u.email,
                u.phone || '',
                u.city  || '',
                t?.tokenBalance ?? 0,
                userBookings,
                new Date(u.createdAt).toLocaleDateString(),
            ];
        });
        let csv = headers.join(',') + '\n';
        rows.forEach(r => { csv += r.map(c => `"${c}"`).join(',') + '\n'; });
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url  = URL.createObjectURL(blob);
        const a    = document.createElement('a');
        a.href = url;
        a.download = `clients_${new Date().toISOString().slice(0,10)}.csv`;
        a.style.visibility = 'hidden';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    };

    const handleCreateClass = async (e) => {
        e.preventDefault();

        const payload = {
            title:       newClass.title,
            description: newClass.description,
            date:        new Date(newClass.date).toISOString(),
            time:        newClass.time,
            duration:    parseInt(newClass.duration, 10),
            location:    newClass.location,
            capacity:    parseInt(newClass.capacity, 10),
            tokenCost:   parseInt(newClass.tokenCost || '1', 10),
        };

        onCreateClass(payload);
        setNewClass({
            title: '',
            date: '',
            time: '',
            duration: '',
            location: '',
            capacity: '',
            description: '',
            tokenCost: '1'
        });
        setShowCreateForm(false);
    };

    const handleInputChange = (field, value) => {
        setNewClass({ ...newClass, [field]: value });
    };

    const clientUsers = users.filter(u => !u.isAdmin);

    const sum_tokens = () => {
        const list = Array.isArray(tokens) ? tokens : [];
        let sum = 0;
        for (let i = 0; i < list.length; i++) {
            sum += list[i].tokenBalance;
        };
        return sum;
    }
    const total = sum_tokens()

    return (
        <div className="dashboard-container">
            {/* Header */}
            <header className="dashboard-header">
                <div>
                    <h1 className="dashboard-title">Admin Dashboard</h1>
                    <p className="dashboard-subtitle">Welcome back, {currentUser ? currentUser.name : "Loading"}</p>
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
                        <div className="stat-value">{total}</div>

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
                    onClick={() => onViewChange()}
                    className="btn btn-primary"
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
                                <label className="form-label">Token Cost *</label>
                                <input
                                    type="number"
                                    value={newClass.tokenCost}
                                    onChange={(e) => handleInputChange('tokenCost', e.target.value)}
                                    className="form-input"
                                    placeholder="1"
                                    min="1"
                                    required
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
                                                <span><Calendar size={14} /> {formatDate(cls.date)}</span>
                                                <span>⏰ {cls.time} ({cls.duration} min)</span>
                                                <span>📍 {cls.location}</span>
                                            </div>
                                        </div>
                                        <div className="class-list-actions">
                                            <span className="badge badge-primary">
                                                {classBookings.length}/{cls.capacity} booked
                                            </span>
                                            <span className="badge badge-secondary" style={{ marginTop: '4px' }}>
                                                {cls.tokenCost} token{cls.tokenCost !== 1 ? 's' : ''}
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
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <h2 className="card-title" style={{ margin: 0 }}>Client Database</h2>
                    {clientUsers.length > 0 && (
                        <button onClick={handleExportUsersCSV} className="btn btn-secondary">
                            Export CSV
                        </button>
                    )}
                </div>
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
                                    const tokens_peruser = Array.isArray(tokens) ? tokens.find(t => t.id === user.id) : undefined;
                                    return (
                                        <tr
                                            key={user.id}
                                            onClick={() => onViewUser && onViewUser(user.id)}
                                            style={{ cursor: 'pointer' }}
                                            title={`Click to edit ${user.name}`}
                                        >
                                            <td style={{ fontWeight: 600 }}>{user.name}</td>
                                            <td>{user.email}</td>
                                            <td>{user.phone}</td>
                                            <td>{user.city || 'N/A'}</td>
                                            <td>
                                                <span className="badge badge-warning">
                                                    <Coins size={12} /> {tokens_peruser?.tokenBalance ?? 0}
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