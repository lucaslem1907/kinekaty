import React, { useState } from 'react';
import { UserPlus, MapPin } from 'lucide-react';
import '../styles/Auth.css';

export default function RegisterView({ onRegister, onSwitchToLogin }) {
  const [step, setStep] = useState(1);
  const [isAdmin, setIsAdmin] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    address: '',
    city: '',
    zipCode: '',
    isAdmin: isAdmin
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleInputChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleNextStep = (e) => {
    e.preventDefault();
    if (step < 2) {
      setStep(step + 1);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch('https://kinekaty.onrender.com/auth/register', {
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
  // paid service, so using free geolocation API (Nominatim)
  const handleGetLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;

          try {
            // Reverse geocoding request
            const response = await fetch(
              `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`
            );
            const data = await response.json();

            // Extract address components
            const { road, house_number, postcode, city, town, village } = data.address;

            setFormData({
              ...formData,
              latitude,
              longitude,
              street: road || "",
              number: house_number || "",
              postalCode: postcode || "",
              city: city || town || village || ""
            });
          } catch (err) {
            console.error("Failed to get address:", err);
            alert("Unable to fetch address. Using coordinates only.");
          }
        },
        (error) => {
          alert('Unable to get your location. Using default location (Brussels).');
        }
      );
    } else {
      alert('Geolocation is not supported by your browser.');
    }
  };

  if (success) {
    return (
      <div className="auth-container">
        <div className="auth-card">
          <div className="alert alert-success">
            <strong>Success!</strong> Account created. Redirecting to login...
          </div>
        </div>
      </div>
    );
  }


  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <UserPlus className="auth-icon" size={48} />
          <h1 className="auth-title">Create Account</h1>
          <p className="auth-subtitle">Step {step} of 2</p>
        </div>

        {/* Step 1: Basic Information */}
        {step === 1 && (
          <form onSubmit={handleNextStep} className="auth-form">
            <div className="form-group">
              <label className="form-label">Full Name *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className="form-input"
                placeholder="John Doe"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Email Address *</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className="form-input"
                placeholder="john@example.com"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Phone Number *</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                className="form-input"
                placeholder="+32 123 456 789"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Password *</label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                className="form-input"
                placeholder="••••••••"
                minLength="6"
                required
              />
            </div>


            <button type="submit" className="btn btn-primary btn-block">
              Next: Location Details →
            </button>
          </form>
        )}

        {/* Step 2: Location Information */}
        {step === 2 && (
          <form onSubmit={handleSubmit} className="auth-form">
            <div className="location-header">
              <MapPin size={24} />
              <h3>Adres gegevens</h3>
            </div>

            <div className="form-group">
              <label className="form-label">Straatnaam</label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
                className="form-input"
                placeholder="123 Main Street"
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Stad</label>
                <input
                  type="text"
                  value={formData.city}
                  onChange={(e) => handleInputChange('city', e.target.value)}
                  className="form-input"
                  placeholder="Brussels"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Postcode</label>
                <input
                  type="number"
                  value={formData.zipCode}
                  onChange={(e) => handleInputChange('zipCode', e.target.value)}
                  className="form-input"
                  placeholder="1000"
                />
              </div>
            </div>
            <div className='form-row'>
            <div className="form-group">
              <label className="form-label">Huisnummer</label>
              <input
                type="number"
                value={formData.houseNumber}
                onChange={(e) => handleInputChange('houseNumber', e.target.value)}
                className="form-input"
                placeholder="1000"
              />
            </div>
          </div>

    
           {/* <button 
              type="button" 
              onClick={handleGetLocation} 
              className="btn btn-secondary btn-block mb-3"
            >
              <MapPin size={18} />
              Use My Current Location
            </button>

            <div className="location-info">
              <small>
                Current coordinates: {formData.latitude}, {formData.longitude}
              </small>
            </div>*/}

        <div className="form-actions">
          <button
            type="button"
            onClick={() => setStep(1)}
            className="btn btn-secondary"
          >
            ← Back
          </button>
          <button type="submit" className="btn btn-primary">
            Complete Registration
          </button>
        </div>
      </form>
        )}

      <div className="auth-footer">
        <button onClick={onSwitchToLogin} className="link-button">
          Already have an account? <strong>Login here</strong>
        </button>
      </div>
    </div>
    </div >
  );
}
