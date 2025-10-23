import React, { useState } from 'react';
import { LogOut, Calendar, Clock, MapPin, Coins, Search, ShoppingCart } from 'lucide-react';
import { formatDate, formatTime, getUpcomingClasses, TOKEN_PACKAGES, getPricePerToken } from '../utils/helpers';
import { Routes, Route, useNavigate, Navigate } from 'react-router-dom';
import '../styles/Dashboard.css';

export default function ClientDashboard({ currentUser, classes, bookings, tokens, onBookClass, onPurchaseTokens, onLogout }) {
  const [view, setView] = useState('overview');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [bookingMessage, setBookingMessage] = useState({ show: false, text: '', type: '' });

  const navigate = useNavigate();
  const handleBookClass = async (classId) => {
    const result = await onBookClass(classId);
    if (!result) return;

    setBookingMessage({
      show: true,
      text: result.message,
      type: result.success ? 'success' : 'error'
    });
    setTimeout(() => setBookingMessage({ show: false, text: '', type: '' }), 3000);
  };

  const handlePurchaseTokens = (packageInfo) => {
    setSelectedPackage(packageInfo);
    setView('purchase-confirm');
  };

  const confirmPurchase = () => {
    onPurchaseTokens(selectedPackage.price, selectedPackage.tokens);
    setView('overview');
    setSelectedPackage(null);
  };


  return (
    <div className="dashboard-container">
      {/* Header */}
      <header className="dashboard-header">
        <div>
          <h1 className="dashboard-title">My Dashboard</h1>
          <p className="dashboard-subtitle">Welcome back, {currentUser ? currentUser.name : "Loading..."}</p>
        </div>
        <button onClick={onLogout} className="btn btn-danger">
          <LogOut size={18} />
          Logout
        </button>
      </header>

      {/* Token Balance Banner */}
      <div className="token-banner">
        <div className="token-info">
          <Coins size={32} className="token-icon" />
          <div>
            <h3 className="token-label"> Available Tokens</h3>
            <p className="token-value">{tokens.totalTokens}</p>
          </div>
        </div>
        <button onClick={() => setView('buy-tokens')} className="btn btn-success">
          <ShoppingCart size={18} />
          Buy More Tokens
        </button>
      </div>

      {/* Booking Message */}
      {bookingMessage.show && (
        <div className={`alert alert-${bookingMessage.type}`}>
          {bookingMessage.text}
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="dashboard-tabs">
        <button
          className={`tab ${view === 'overview' ? 'tab-active' : ''}`}
          onClick={() => setView('overview')}
        >
          Overview
        </button>
        <button
          className={`tab ${view === 'search-results' ? 'tab-active' : ''}`}
          onClick={() => setView('search-results')}
        >
          <Search size={18} />
          Search Classes
        </button>
        <button
          className={`tab ${view === 'my-bookings' ? 'tab-active' : ''}`}
          onClick={() => setView('my-bookings')}
        >
          My Bookings ({bookings.length})
        </button>
        <button
          className={`tab ${view === 'history' ? 'tab-active' : ''}`}
          onClick={() => setView('history')}
        >
          History
        </button>
      </div>

      {/* Overview View */}
      {view === 'overview' && (
        <div className="dashboard-content">
          <div className="card">
            {classes.length === 0 ? (
              <p className="text-muted">No classes available at the moment. Please check back later.</p>
            ) : (
              <div className="class-grid">
                {classes.map(cls => {
                  const classBookings = bookings.filter(b => b.classId === cls.id);
                  const isBooked = bookings.some(b => b.classId === cls.id);
                  const isFull = classBookings.length >= parseInt(cls.capacity);
                  return (
                    <div key={cls.id} className="class-card">
                      <div className="class-header">
                        <h3 className="class-title">{cls.title}</h3>
                      </div>
                      <p className="class-description">{cls.description}</p>
                      <div className="class-details">
                        <div className="detail-item">
                          <Calendar size={16} />
                          <span>{formatDate(cls.date)}</span>
                        </div>
                        <div className="detail-item">
                          <Clock size={16} />
                          <span>{formatTime(cls.time)}</span>
                        </div>
                        <div className="detail-item">
                          <MapPin size={16} />
                          <span>{cls.location}</span>
                        </div>
                      </div>
                      <div className="class-footer">
                        <div className="class-capacity">
                          <span className="capacity-label">Availability:</span>
                          <span className="capacity-value">{classBookings.length}/{cls.capacity}</span>
                        </div>
                        <div className="class-token-cost">
                          <Coins size={16} />
                          <span>1 token</span>
                        </div>
                      </div>
                      {isBooked ? (
                        <button className="btn btn-success btn-block" disabled>
                          ✓ Already Booked
                        </button>
                      ) : isFull ? (
                        <button className="btn btn-secondary btn-block" disabled>
                          Class Full
                        </button>
                      ) : currentUser.tokens < 1 ? (
                        <button className="btn btn-danger btn-block" disabled>
                          Not Enough Tokens
                        </button>
                      ) : (
                        <button
                          onClick={() => handleBookClass(cls.id)}
                          className="btn btn-primary btn-block"
                        >
                          Book Now (1 token)
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Search Results View */}
      {view === 'search-results' && (
        <div className="dashboard-content">
          <div className="card">
            <h2 className="card-title">All Available Classes On Search</h2>
            <div className="search-board">
              <input
                className="search-input"
                type="text"
                placeholder="Search classes by title, location, or date..."
                onChange={(e) => {
                  const query = e.target.value.toLowerCase();
                  const results = classes.filter(cls =>
                    cls.title.toLowerCase().includes(query) ||
                    cls.location.toLowerCase().includes(query) ||
                    cls.date.includes(query)
                  );
                  setSearchResults(results);

                }}
              />
            </div>

            {searchResults.length === 0 ? (
              <p className="text-muted">Vul de zoekcriteria in</p>
            ) : (
              <div className="class-list">
                {searchResults.map(cls => {
                  const classBookings = bookings.filter(b => b.classId === cls.id);
                  const isBooked = bookings.some(b => b.classId === cls.id);
                  const isFull = classBookings.length >= parseInt(cls.capacity);

                  return (
                    <div key={cls.id} className="class-list-item">
                      <div className="class-list-content">
                        <div>
                          <h3 className="class-title">{cls.title}</h3>
                          <p className="class-description">{cls.description}</p>
                          <div className="class-details">
                            <span><Calendar size={14} /> {formatDate(cls.date)}</span>
                            <span><Clock size={14} /> {formatTime(cls.time)}</span>
                            <span><MapPin size={14} /> {cls.location}</span>
                          </div>
                        </div>
                        <div className="class-list-actions">
                          <div className="mb-2">
                            <small className="text-muted">Spots: {classBookings.length}/{cls.capacity}</small>
                          </div>
                          {isBooked ? (
                            <button className="btn btn-success" disabled>✓ Booked</button>
                          ) : isFull ? (
                            <button className="btn btn-secondary" disabled>Full</button>
                          ) : currentUser.tokens < 1 ? (
                            <button className="btn btn-danger" disabled>No Tokens</button>
                          ) : (
                            <button onClick={() => handleBookClass(cls.id)} className="btn btn-primary">
                              Book (1 token)
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
        </div>
      )}

      {/* My Bookings View */}
      {view === 'my-bookings' && (
        <div className="dashboard-content">
          <div className="card">
            <h2 className="card-title">My Bookings</h2>

            {bookings.length === 0 ? (
              console.log('No bookings found for user:', bookings.id),
              <p className="text-muted">You haven't booked any classes yet. Browse available classes to get started!</p>
            ) : (
              <div className="bookings-list">
                {bookings.map(booking => {
                  const cls = classes.find(c => c.id === booking.classId);
                  if (!cls) return null;

                  return (
                    <div key={bookings.id} className="booking-card">
                      <div className="booking-status">
                        <span className="badge badge-success">Confirmed</span>
                      </div>
                      <h3 className="class-title">{cls.title}</h3>
                      <p className="class-description">{cls.description}</p>
                      <div className="class-details">
                        <span><Calendar size={14} /> {formatDate(cls.date)}</span>
                        <span><Clock size={14} /> {formatTime(cls.time)} ({cls.duration} min)</span>
                        <span><MapPin size={14} /> {cls.location}</span>
                      </div>
                      <div className="booking-footer">
                        <small className="text-muted">
                          Booked on {new Date(booking.bookedAt).toLocaleDateString()}
                        </small>
                        <span className="token-used">
                          <Coins size={14} /> 1 token used
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Buy Tokens View */}
      {view === 'buy-tokens' && (
        <div className="dashboard-content">
          <div className="card">
            <h2 className="card-title">Purchase Tokens</h2>
            <p className="text-muted mb-4">Choose a package that fits your needs. Each class requires 1 token.</p>

            <div className="token-packages">
              {TOKEN_PACKAGES.map((pkg, index) => (
                <div key={index} className="token-package">
                  {pkg.discount > 0 && (
                    <div className="package-badge">Save {pkg.discount}%</div>
                  )}
                  <div className="package-tokens">
                    <Coins size={32} />
                    <h3>{pkg.tokens} Tokens</h3>
                  </div>
                  <div className="package-price">
                    <span className="price-amount">€{pkg.price}</span>
                    <span className="price-per">€{getPricePerToken(pkg.tokens, pkg.price)} per token</span>
                  </div>
                  <button
                    onClick={() => handlePurchaseTokens(pkg)}
                    className="btn btn-primary btn-block"
                  >
                    Purchase Now
                  </button>

                </div>

              ))}
            </div>
          </div>
        </div>)}


      {/* Token Transaction History View */}
      {view === 'history' && (
        <div className="dashboard-content">
          <div className="card">
            <h2 className="card-title">History</h2>
            {tokens.transactions.length === 0 ? (
              <p className="text-muted">No token transactions found.</p>
            ) : (
              <div className="transactions-list">
                {tokens.transactions.map((tx) => (
                  <div key={tx.id} className="transaction-item">
                    <div>
                      <span className={`transaction-amount ${tx.amount > 0 ? 'text-success' : 'text-danger'}`}>
                        {tx.amount > 0 ? '+' : ''}{tx.amount} tokens
                      </span>
                      <br />
                      <small className="text-muted">{new Date(tx.createdAt).toLocaleDateString()}</small>
                    </div>
                    <div className="transaction-reason">{tx.reason}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="dashboard-content">
            <div className="card">
              <h2 className="card-title">History Classes</h2>
              {bookings.length === 0 ? (
                <p className="text-muted">No booked classes found.</p>
              ) : (
                <div className="bookings-list">
                  {bookings.map(booking => {
                    const cls = classes.find(c => c.id === booking.classId && c.date < new Date().toISOString().split('T')[0]);
                    if (!cls) return null;
                    return (
                      <div key={bookings.id} className="booking-card">
                        <div className="booking-status">
                          <span className="badge badge-success">Confirmed</span>
                        </div>
                        <h3 className="class-title">{cls.title}</h3>

                        <p className="class-description">{cls.description}</p>
                        <div className="class-details">
                          <span><Calendar size={14} /> {formatDate(cls.date)}</span>
                          <span><Clock size={14} /> {formatTime(cls.time)} ({cls.duration} min)</span>
                          <span><MapPin size={14} /> {cls.location}</span>
                        </div>
                        <div className="booking-footer">
                          <small className="text-muted">
                            Booked on {new Date(booking.bookedAt).toLocaleDateString()}
                          </small>

                          <span className="token-used">
                            <Coins size={14} /> 1 token used
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

        </div>)}



      {/* Purchase Confirmation */}
      {
        view === 'purchase-confirm' && selectedPackage && (
          <div className="dashboard-content">
            <div className="card">
              <h2 className="card-title">Confirm Purchase</h2>
              <div className="confirm-purchase">
                <div className="purchase-summary">
                  <h3>Order Summary</h3>
                  <div className="summary-row">
                    <span>Tokens:</span>
                    <span>{selectedPackage.tokens}</span>
                  </div>
                  <div className="summary-row">
                    <span>Price per token:</span>
                    <span>€{getPricePerToken(selectedPackage.tokens, selectedPackage.price)}</span>
                  </div>
                  {selectedPackage.discount > 0 && (
                    <div className="summary-row discount">
                      <span>Discount:</span>
                      <span>{selectedPackage.discount}% OFF</span>
                    </div>
                  )}
                  <div className="summary-row total">
                    <span>Total:</span>
                    <span>€{selectedPackage.price}</span>
                  </div>
                </div>
                <div className="alert alert-info">
                  <strong>Note:</strong> This is a demo. In a real application, you would be redirected to a secure payment gateway.
                </div>
                <div className="form-actions">
                  <button onClick={() => setView('buy-tokens')} className="btn btn-secondary">
                    Cancel
                  </button>
                  <button onClick={confirmPurchase} className="btn btn-success">
                    Confirm Purchase
                  </button>
                </div>
              </div>
            </div>
          </div>
        )
      }
    </div >
  );
}