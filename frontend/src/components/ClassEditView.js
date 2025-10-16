// src/components/ClassEditView.js
import React, { useState } from 'react';
import { ArrowLeft, Edit2, Save, X, Calendar, Clock, MapPin, Users, Coins, Trash2, Mail, Phone } from 'lucide-react';
import { formatDate, formatTime } from '../utils/helpers';
import '../styles/ClassEdit.css';

export default function ClassEditView({ classes, users, bookings, onSave, onDelete, onBack }) {
  console.log('ClassEditView props:', { classes, users, bookings });
  const [isEditing, setIsEditing] = useState(true);
  const [editedClass, setEditedClass] = useState({ ...classes });
  const [activeTab, setActiveTab] = useState('details');
  const classData = classes;
  // Get all bookings for this class
  const classBookings = bookings.filter(b => b.classId === classData.id);
  
  // Get user details for each booking
  const bookingsWithUsers = classBookings.map(booking => {
    const user = users.find(u => u.id === booking.userId);
    return { ...booking, user };
  });

  // Calculate statistics
  const spotsAvailable = parseInt(classData.capacity) - classBookings.length;
  const fillPercentage = ((classBookings.length / parseInt(classData.capacity)) * 100).toFixed(0);
  const totalTokensCollected = classBookings.length; // Each booking = 1 token

  const handleInputChange = (field, value) => {
    setEditedClass({ ...editedClass, [field]: value });
  };

  const handleSave = () => {
    onSave(editedClass);
    setIsEditing(false);
    alert('Class updated successfully!');
  };

  const handleCancel = () => {
    setEditedClass({ ...classData });
    setIsEditing(false);
  };

  const handleDelete = () => {
    if (window.confirm(`Are you sure you want to delete "${classData.title}"? This will cancel all ${classBookings.length} bookings.`)) {
      onDelete(classData.id);
      onBack();
    }
  };

  const handleRemoveBooking = (bookingId) => {
    if (window.confirm('Remove this booking? The client will need to be notified manually.')) {
      // This would call a function to remove the booking
      alert('Booking removed (implement backend connection)');
    }
  };

  return (
    <div className="class-edit-container">
      {/* Header */}
      <div className="class-edit-header">
        <button onClick={onBack} className="btn btn-secondary">
          <ArrowLeft size={18} />
          Back to Dashboard
        </button>
        <div className="header-actions">
          {!isEditing ? (
            <>
              <button onClick={() => setIsEditing(true)} className="btn btn-primary">
                <Edit2 size={18} />
                Edit Class
              </button>
              <button onClick={handleDelete} className="btn btn-danger">
                <Trash2 size={18} />
                Delete Class
              </button>
            </>
          ) : (
            <>
              <button onClick={handleSave} className="btn btn-success">
                <Save size={18} />
                Save Changes
              </button>
              <button onClick={handleCancel} className="btn btn-secondary">
                <X size={18} />
                Cancel
              </button>
            </>
          )}
        </div>
      </div>

      {/* Class Title */}
      <div className="class-title-section">
        {!isEditing ? (
          <>
            <h1 className="class-main-title">{classData.title}</h1>
            <p className="class-subtitle">{classData.description}</p>
          </>
        ) : (
          <>
            <input
              type="text"
              value={editedClass.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              className="form-input title-input"
              placeholder="Class Title"
            />
            <textarea
              value={editedClass.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              className="form-textarea"
              placeholder="Class Description"
              rows="2"
            />
          </>
        )}
      </div>

      {/* Stats Overview */}
      <div className="stats-overview">
        <div className="stat-box">
          <Users size={24} className="stat-icon" />
          <div>
            <div className="stat-value">{classBookings.length}/{classData.capacity}</div>
            <div className="stat-label">Bookings</div>
          </div>
        </div>
        <div className="stat-box">
          <div className="progress-circle">
            <svg viewBox="0 0 36 36" className="circular-chart">
              <path
                className="circle-bg"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                className="circle"
                strokeDasharray={`${fillPercentage}, 100`}
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <text x="18" y="20.35" className="percentage">{fillPercentage}%</text>
            </svg>
          </div>
          <div>
            <div className="stat-value">{spotsAvailable}</div>
            <div className="stat-label">Spots Left</div>
          </div>
        </div>
        <div className="stat-box">
          <Coins size={24} className="stat-icon token-icon" />
          <div>
            <div className="stat-value">{totalTokensCollected}</div>
            <div className="stat-label">Tokens Collected</div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="class-tabs">
        <button
          className={`class-tab ${activeTab === 'details' ? 'class-tab-active' : ''}`}
          onClick={() => setActiveTab('details')}
        >
          Class Details
        </button>
        <button
          className={`class-tab ${activeTab === 'bookings' ? 'class-tab-active' : ''}`}
          onClick={() => setActiveTab('bookings')}
        >
          Bookings ({classBookings.length})
        </button>
      </div>

      {/* Tab Content */}
      <div className="tab-content">
        {/* Details Tab */}
        {activeTab === 'details' && (
          <div className="card">
            <h2 className="section-title">Class Information</h2>
            
            {!isEditing ? (
              <div className="details-grid">
                <div className="detail-item">
                  <Calendar className="detail-icon" />
                  <div>
                    <div className="detail-label">Date</div>
                    <div className="detail-value">{formatDate(classData.date)}</div>
                  </div>
                </div>

                <div className="detail-item">
                  <Clock className="detail-icon" />
                  <div>
                    <div className="detail-label">Time</div>
                    <div className="detail-value">{formatTime(classData.time)}</div>
                  </div>
                </div>

                <div className="detail-item">
                  <Clock className="detail-icon" />
                  <div>
                    <div className="detail-label">Duration</div>
                    <div className="detail-value">{classData.duration} minutes</div>
                  </div>
                </div>

                <div className="detail-item">
                  <MapPin className="detail-icon" />
                  <div>
                    <div className="detail-label">Location</div>
                    <div className="detail-value">{classData.location}</div>
                  </div>
                </div>

                <div className="detail-item">
                  <Users className="detail-icon" />
                  <div>
                    <div className="detail-label">Capacity</div>
                    <div className="detail-value">{classData.capacity} people</div>
                  </div>
                </div>

                
              </div>
            ) : (
              <div className="edit-form">
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Date *</label>
                    <input
                      type="date"
                      value={editedClass.date}
                      onChange={(e) => handleInputChange('date', e.target.value)}
                      className="form-input"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Time *</label>
                    <input
                      type="time"
                      value={editedClass.time}
                      onChange={(e) => handleInputChange('time', e.target.value)}
                      className="form-input"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Duration (minutes) *</label>
                    <input
                      type="number"
                      value={editedClass.duration}
                      onChange={(e) => handleInputChange('duration', e.target.value)}
                      className="form-input"
                      min="15"
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Location *</label>
                    <input
                      type="text"
                      value={editedClass.location}
                      onChange={(e) => handleInputChange('location', e.target.value)}
                      className="form-input"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Capacity *</label>
                    <input
                      type="number"
                      value={editedClass.capacity}
                      onChange={(e) => handleInputChange('capacity', e.target.value)}
                      className="form-input"
                      min={classBookings.length}
                    />
                    <small className="form-hint">
                      Minimum: {classBookings.length} (current bookings)
                    </small>
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Latitude</label>
                    <input
                      type="number"
                      step="0.0001"
                      value={editedClass.latitude}
                      onChange={(e) => handleInputChange('latitude', parseFloat(e.target.value))}
                      className="form-input"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Longitude</label>
                    <input
                      type="number"
                      step="0.0001"
                      value={editedClass.longitude}
                      onChange={(e) => handleInputChange('longitude', parseFloat(e.target.value))}
                      className="form-input"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Additional Info */}
            <div className="info-section">
              <h3 className="section-subtitle">Additional Information</h3>
              <div className="info-grid">
                <div className="info-item">
                  <span className="info-label">Class ID:</span>
                  <span className="info-value">{classData.id}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Created:</span>
                  <span className="info-value">
                    {new Date(classData.createdAt).toLocaleString()}
                  </span>
                </div>
                <div className="info-item">
                  <span className="info-label">Status:</span>
                  <span className={`badge ${spotsAvailable > 0 ? 'badge-success' : 'badge-danger'}`}>
                    {spotsAvailable > 0 ? 'Open for Booking' : 'Full'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Bookings Tab */}
        {activeTab === 'bookings' && (
          <div className="card">
            <h2 className="section-title">Participant List</h2>
            
            {classBookings.length === 0 ? (
              <div className="empty-state">
                <Users size={48} />
                <p>No bookings yet</p>
                <small>Participants will appear here once they book this class</small>
              </div>
            ) : (
              <>
                <div className="booking-summary">
                  <div>
                    <strong>{classBookings.length}</strong> confirmed bookings
                  </div>
                  <div>
                    <strong>{spotsAvailable}</strong> spots remaining
                  </div>
                </div>

                <div className="bookings-table">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Phone</th>
                        <th>Booked On</th>
                        <th>Tokens</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {bookingsWithUsers.map((booking) => (
                        <tr key={booking.id}>
                          <td>
                            <div className="user-cell">
                              <div className="user-avatar">
                                {booking.user?.name?.charAt(0).toUpperCase()}
                              </div>
                              <strong>{booking.user?.name || 'Unknown'}</strong>
                            </div>
                          </td>
                          <td>
                            <div className="contact-cell">
                              <Mail size={14} />
                              {booking.user?.email || 'N/A'}
                            </div>
                          </td>
                          <td>
                            <div className="contact-cell">
                              <Phone size={14} />
                              {booking.user?.phone || 'N/A'}
                            </div>
                          </td>
                          <td>
                            <small>{new Date(booking.bookedAt).toLocaleString()}</small>
                          </td>
                          <td>
                            <span className="badge badge-warning">
                              <Coins size={12} /> {booking.tokensUsed}
                            </span>
                          </td>
                          <td>
                            <button
                              onClick={() => handleRemoveBooking(booking.id)}
                              className="btn-small btn-danger"
                              title="Remove booking"
                            >
                              <Trash2 size={14} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Export Options */}
                <div className="export-section">
                  <button className="btn btn-secondary">
                    Export to CSV
                  </button>
                  <button className="btn btn-secondary">
                    Send Email to All
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}