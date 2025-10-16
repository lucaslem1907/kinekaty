// src/components/CalendarView.js
import React, { useState } from 'react';
import { ArrowLeft, Calendar, Clock } from 'lucide-react';
import '../styles/Calendar.css';

export default function CalendarView({ classes, bookings, onBack }) {
  const [viewMode, setViewMode] = useState('week');

  const getWeekDates = () => {
    const today = new Date();
    const week = [];
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());
    
    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);
      week.push(date);
    }
    return week;
  };

  const weekDates = getWeekDates();
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  return (
    <div className="dashboard-container">
      <div className="card">
        <div className="card-header">
          <div>
            <h1 className="card-title">Calendar View</h1>
            <p className="text-muted">Manage your schedule</p>
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              onClick={() => setViewMode('week')}
              className={`btn ${viewMode === 'week' ? 'btn-primary' : 'btn-secondary'}`}
            >
              Week View
            </button>
            <button
              onClick={() => setViewMode('month')}
              className={`btn ${viewMode === 'month' ? 'btn-primary' : 'btn-secondary'}`}
            >
              Month View
            </button>
            <button onClick={onBack} className="btn btn-secondary">
              <ArrowLeft size={18} />
              Back
            </button>
          </div>
        </div>

        {/* Weekly View */}
        {viewMode === 'week' && (
          <div className="calendar-week">
            {weekDates.map((date, idx) => {
              const dateStr = date.toISOString().split('T')[0];
              const dayClasses = classes.filter(cls => cls.date.split('T')[0] === dateStr);
              const isToday = date.toDateString() === new Date().toDateString();
              
              return (
                <div key={idx} className={`calendar-day ${isToday ? 'calendar-day-today' : ''}`}>
                  <div className="calendar-day-header">
                    <div className="day-name">{dayNames[date.getDay()]}</div>
                    <div className="day-date">{date.getDate()}</div>
                    <div className="day-month">{date.toLocaleDateString('en-US', { month: 'short' })}</div>
                  </div>
                  <div className="calendar-day-content">
                    {dayClasses.length === 0 ? (
                      <div className="no-classes">No classes</div>
                    ) : (
                      dayClasses.map(cls => {
                        const classBookings = bookings.filter(b => b.classId === cls.id);
                        return (
                          <div key={cls.id} className="calendar-event">
                            <div className="event-time">
                              <Clock size={12} /> {cls.time}
                            </div>
                            <div className="event-title">{cls.title}</div>
                            <div className="event-location">{cls.location}</div>
                            <div className="event-capacity">
                              {classBookings.length}/{cls.capacity} booked
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Monthly View */}
        {viewMode === 'month' && (
          <div className="calendar-month">
            <h3 style={{ marginBottom: '20px', color: '#2d3748' }}>
              All Scheduled Classes
            </h3>
            {classes.length === 0 ? (
              <p className="text-muted">No classes scheduled.</p>
            ) : (
              <div className="class-timeline">
                {classes
                  .sort((a, b) => new Date(`${a.date}T${a.time}`) - new Date(`${b.date}T${b.time}`))
                  .map(cls => {
                    const classBookings = bookings.filter(b => b.classId === cls.id);
                    const classDate = new Date(cls.date);
                    const isPast = classDate < new Date();
                    
                    return (
                      <div key={cls.id} className={`timeline-item ${isPast ? 'timeline-item-past' : ''}`}>
                        <div className="timeline-marker"></div>
                        <div className="timeline-content">
                          <div className="timeline-date">
                            <Calendar size={16} />
                            {classDate.toLocaleDateString('en-US', { 
                              weekday: 'long', 
                              year: 'numeric', 
                              month: 'long', 
                              day: 'numeric' 
                            })}
                          </div>
                          <h4 className="timeline-title">{cls.title}</h4>
                          <p className="timeline-description">{cls.description}</p>
                          <div className="timeline-details">
                            <span>
                              <Clock size={14} /> {cls.time} ({cls.duration} min)
                            </span>
                            <span>📍 {cls.location}</span>
                            <span className="badge badge-primary">
                              {classBookings.length}/{cls.capacity} spots
                            </span>
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