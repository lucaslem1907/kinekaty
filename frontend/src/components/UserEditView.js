import React, { useState } from 'react';
import { ArrowLeft, Save, X, Trash2, Mail, Phone, MapPin, User, Coins, Calendar, Edit2 } from 'lucide-react';
import '../styles/UserEdit.css';

export default function UserEditView({ user, bookings, tokens, onSave, onDelete, onGrantTokens, onBack }) {
  const [isEditing, setIsEditing]   = useState(false);
  const [edited, setEdited]         = useState({ ...user });
  const [activeTab, setActiveTab]   = useState('details');
  const [grantAmount, setGrantAmount] = useState('');
  const [grantNote, setGrantNote]     = useState('');

  const tokenList    = Array.isArray(tokens) ? tokens : [];
  const tokenEntry   = tokenList.find(t => t.id === user.id);
  const tokenBalance = tokenEntry?.tokenBalance ?? 0;

  const userBookings = bookings.filter(b => b.userId === user.id);

  const handleChange = (field, value) => setEdited(prev => ({ ...prev, [field]: value }));

  const handleSave = () => {
    onSave({
      id:     user.id,
      name:   edited.name,
      email:  edited.email,
      phone:  edited.phone   || null,
      street: edited.street  || null,
      number: edited.number  ? parseInt(edited.number, 10) : null,
      city:   edited.city    || null,
    });
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEdited({ ...user });
    setIsEditing(false);
  };

  const handleDelete = () => {
    if (window.confirm(`Are you sure you want to delete "${user.name}"? This cannot be undone.`)) {
      onDelete(user.id);
      onBack();
    }
  };

  const handleExportCSV = () => {
    const headers = ['Class', 'Booked On'];
    const rows = userBookings.map(b => [
      b.classTitle || b.classId,
      new Date(b.bookedAt).toLocaleString(),
    ]);
    let csv = headers.join(',') + '\n';
    rows.forEach(r => { csv += r.map(c => `"${c}"`).join(',') + '\n'; });
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href = url;
    a.download = `${user.name.replace(/[^a-z0-9]/gi, '_')}_bookings.csv`;
    a.style.visibility = 'hidden';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleEmail = () => {
    if (!user.email) return;
    window.location.href = `mailto:${user.email}?subject=Message from Kinekaty`;
  };

  return (
    <div className="user-edit-container">
      {/* Header */}
      <div className="user-edit-header">
        <button onClick={onBack} className="btn btn-secondary">
          <ArrowLeft size={18} /> Back to Dashboard
        </button>
        <div className="header-actions">
          {!isEditing ? (
            <>
              <button onClick={() => setIsEditing(true)} className="btn btn-primary">
                <Edit2 size={18} /> Edit User
              </button>
              <button onClick={handleEmail} className="btn btn-secondary">
                <Mail size={18} /> Send Email
              </button>
              <button onClick={handleDelete} className="btn btn-danger">
                <Trash2 size={18} /> Delete User
              </button>
            </>
          ) : (
            <>
              <button onClick={handleSave} className="btn btn-success">
                <Save size={18} /> Save Changes
              </button>
              <button onClick={handleCancel} className="btn btn-secondary">
                <X size={18} /> Cancel
              </button>
            </>
          )}
        </div>
      </div>

      {/* Title banner */}
      <div className="user-title-section">
        <h1 className="user-main-title">{user.name}</h1>
        <p className="user-subtitle">{user.email} · Client since {new Date(user.createdAt).toLocaleDateString()}</p>
      </div>

      {/* Stats */}
      <div className="user-stats-overview">
        <div className="stat-box">
          <Calendar size={24} className="stat-icon" />
          <div>
            <div className="stat-value">{userBookings.length}</div>
            <div className="stat-label">Total Bookings</div>
          </div>
        </div>
        <div className="stat-box">
          <Coins size={24} className="token-icon" />
          <div>
            <div className="stat-value">{tokenBalance}</div>
            <div className="stat-label">Token Balance</div>
          </div>
        </div>
        <div className="stat-box">
          <User size={24} className="stat-icon" />
          <div>
            <div className="stat-value">{user.city || '—'}</div>
            <div className="stat-label">City</div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="user-tabs">
        <button className={`user-tab ${activeTab === 'details'  ? 'user-tab-active' : ''}`} onClick={() => setActiveTab('details')}>
          Profile Details
        </button>
        <button className={`user-tab ${activeTab === 'bookings' ? 'user-tab-active' : ''}`} onClick={() => setActiveTab('bookings')}>
          Bookings ({userBookings.length})
        </button>
        <button className={`user-tab ${activeTab === 'tokens'   ? 'user-tab-active' : ''}`} onClick={() => setActiveTab('tokens')}>
          Tokens ({tokenBalance})
        </button>
      </div>

      {/* Details tab */}
      {activeTab === 'details' && (
        <div className="card tab-content">
          <h2 className="section-title">Profile Information</h2>

          {!isEditing ? (
            <div className="details-grid">
              <div className="detail-item">
                <User className="detail-icon" size={18} />
                <div>
                  <div className="detail-label">Full Name</div>
                  <div className="detail-value">{user.name}</div>
                </div>
              </div>
              <div className="detail-item">
                <Mail className="detail-icon" size={18} />
                <div>
                  <div className="detail-label">Email</div>
                  <div className="detail-value">{user.email}</div>
                </div>
              </div>
              <div className="detail-item">
                <Phone className="detail-icon" size={18} />
                <div>
                  <div className="detail-label">Phone</div>
                  <div className="detail-value">{user.phone || '—'}</div>
                </div>
              </div>
              <div className="detail-item">
                <MapPin className="detail-icon" size={18} />
                <div>
                  <div className="detail-label">Address</div>
                  <div className="detail-value">
                    {[user.street, user.number, user.city].filter(Boolean).join(' ') || '—'}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="edit-form">
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Full Name *</label>
                  <input className="form-input" value={edited.name || ''} onChange={e => handleChange('name', e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">Email *</label>
                  <input className="form-input" type="email" value={edited.email || ''} onChange={e => handleChange('email', e.target.value)} />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Phone</label>
                  <input className="form-input" value={edited.phone || ''} onChange={e => handleChange('phone', e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">City</label>
                  <input className="form-input" value={edited.city || ''} onChange={e => handleChange('city', e.target.value)} />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Street</label>
                  <input className="form-input" value={edited.street || ''} onChange={e => handleChange('street', e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">House Number</label>
                  <input className="form-input" type="number" value={edited.number || ''} onChange={e => handleChange('number', e.target.value)} />
                </div>
              </div>
            </div>
          )}

          <div className="info-section">
            <h3 className="section-subtitle">Account Info</h3>
            <div className="info-grid">
              <div className="info-item">
                <span className="info-label">User ID</span>
                <span className="info-value">{user.id}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Registered</span>
                <span className="info-value">{new Date(user.createdAt).toLocaleString()}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Role</span>
                <span className="badge badge-secondary">{user.isAdmin ? 'Admin' : 'Client'}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bookings tab */}
      {activeTab === 'bookings' && (
        <div className="card tab-content">
          <h2 className="section-title">Booking History</h2>

          {userBookings.length === 0 ? (
            <div className="empty-state">
              <Calendar size={48} />
              <p>No bookings yet</p>
              <small>This client hasn't booked any classes</small>
            </div>
          ) : (
            <>
              <div className="booking-summary">
                <div><strong>{userBookings.length}</strong> total bookings</div>
                <div><strong>{tokenBalance}</strong> tokens remaining</div>
              </div>

              <div className="bookings-table">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Class</th>
                      <th>Booked On</th>
                    </tr>
                  </thead>
                  <tbody>
                    {userBookings.map(b => (
                      <tr key={b.id}>
                        <td><strong>{b.classTitle || `Class #${b.classId}`}</strong></td>
                        <td><small>{new Date(b.bookedAt).toLocaleString()}</small></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="export-section">
                <button onClick={handleExportCSV} className="btn btn-secondary">
                  Export Bookings to CSV
                </button>
                <button onClick={handleEmail} className="btn btn-secondary">
                  <Mail size={16} /> Email Client
                </button>
              </div>
            </>
          )}
        </div>
      )}
          {activeTab === 'tokens' && (
            <div className="card tab-content">
              <h2 className="section-title">Token Management</h2>
              <div className="user-stats" style={{ marginBottom: '24px' }}>
                <div className="stat-card">
                  <div className="stat-value">{tokenBalance}</div>
                  <div className="stat-label">Current Balance</div>
                </div>
              </div>

              {onGrantTokens && (
                <>
                  <h3 style={{ marginBottom: '12px', fontSize: '16px' }}>Manually add tokens</h3>
                  <p style={{ fontSize: '13px', color: '#718096', marginBottom: '16px' }}>
                    Use this to credit tokens for cash payments or other off-platform transactions.
                  </p>
                  <form
                    onSubmit={async (e) => {
                      e.preventDefault();
                      const amount = parseInt(grantAmount, 10);
                      if (!amount || amount <= 0) return;
                      await onGrantTokens(user.id, amount, grantNote);
                      setGrantAmount('');
                      setGrantNote('');
                    }}
                  >
                    <div className="form-group">
                      <label className="form-label">Number of tokens</label>
                      <input
                        type="number"
                        className="form-control"
                        min="1"
                        value={grantAmount}
                        onChange={e => setGrantAmount(e.target.value)}
                        required
                        style={{ maxWidth: '160px' }}
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Note (optional)</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="e.g. cash payment, promo"
                        value={grantNote}
                        onChange={e => setGrantNote(e.target.value)}
                        style={{ maxWidth: '320px' }}
                      />
                    </div>
                    <button type="submit" className="btn btn-primary">
                      <Coins size={14} /> Add tokens
                    </button>
                  </form>
                </>
              )}
            </div>
          )}
        </div>
      );
    }
