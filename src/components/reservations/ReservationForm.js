import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { FaEnvelope, FaSms } from 'react-icons/fa';
import { generateAndStoreQRCode } from '../../utils/qrGenerator';
import { v4 as uuidv4 } from 'uuid'; // Add UUID for proper ID generation

export default function ReservationForm({ event }) {
  const router = useRouter();
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    numTickets: 1,
    ticketType: event?.ticketTypes?.[0] || 'General Admission',
    specialRequests: '',
    alert: 'email', // Default to email - using 'alert' to match your DB schema
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // Default ticket types if not provided by the event
  const ticketTypes = event?.ticketTypes || ['General Admission', 'VIP', 'Backstage'];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    
    // Clear error when field is edited
    if (errors[name]) {
      setErrors({ ...errors, [name]: null });
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.fullName.trim()) newErrors.fullName = 'Name is required';
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^\+?[0-9\s-()]{10,15}$/.test(formData.phone.replace(/\s|-|\(|\)/g, ''))) {
      newErrors.phone = 'Phone number is invalid';
    }
    
    if (formData.numTickets < 1) {
      newErrors.numTickets = 'At least 1 ticket is required';
    }

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const formErrors = validateForm();
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Generate a proper UUID for Supabase
      const reservationId = uuidv4();
      
      // Generate and store QR code in Supabase
      let qrCodeUrl;
      try {
        qrCodeUrl = await generateAndStoreQRCode(event.id, reservationId, {
          fullName: formData.fullName,
          numTickets: formData.numTickets
        });
        console.log("Generated QR code URL:", qrCodeUrl);
      } catch (err) {
        console.error('QR code generation failed:', err);
        // Continue without QR code
      }
      
      // Calculate expiration time (24 hours from now or event date, whichever is later)
      const now = new Date();
      const eventDate = new Date(event.event_date);
      const expirationDate = new Date(eventDate.getTime() + 2 * 60 * 60 * 1000); // 2 hours after event
      const expirationTime = expirationDate > now 
        ? expirationDate.toISOString() 
        : new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString();
      
      // Prepare reservation data with the correct QR code URL format
      const reservationData = {
        id: reservationId,
        event_id: event.id,
        full_name: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        num_tickets: formData.numTickets,
        ticket_type: formData.ticketType,
        special_requests: formData.specialRequests,
        alert: formData.alert,
        qr_code_url: qrCodeUrl,
        status: 'confirmed',
        expiration_time: expirationTime,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      // Send reservation data to API
      const response = await fetch('/api/reservations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(reservationData),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Reservation error:', errorData);
        throw new Error(errorData.message || 'Failed to create reservation');
      }
      
      setSubmitSuccess(true);
      
      // Redirect to confirmation page
      setTimeout(() => {
        router.push(`/reservations/confirmation?event=${event.id}&reservation=${reservationId}`);
      }, 1500);
    } catch (error) {
      console.error('Error submitting reservation:', error);
      setErrors({ form: 'Failed to submit reservation. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitSuccess) {
    return (
      <div className="reservation-success-message">
        <h2>Reservation Successful!</h2>
        <p>Thank you for your reservation. Redirecting to confirmation page...</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="reservation-form">
      <div className="form-group">
        <label htmlFor="fullName">Full Name *</label>
        <input
          type="text"
          id="fullName"
          name="fullName"
          value={formData.fullName}
          onChange={handleChange}
          className={`form-control ${errors.fullName ? 'error' : ''}`}
        />
        {errors.fullName && <div className="error-message">{errors.fullName}</div>}
      </div>

      <div className="form-group">
        <label htmlFor="email">Email *</label>
        <input
          type="email"
          id="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          className={`form-control ${errors.email ? 'error' : ''}`}
        />
        {errors.email && <div className="error-message">{errors.email}</div>}
      </div>

      <div className="form-group">
        <label htmlFor="phone">Phone Number *</label>
        <input
          type="tel"
          id="phone"
          name="phone"
          value={formData.phone}
          onChange={handleChange}
          className={`form-control ${errors.phone ? 'error' : ''}`}
        />
        {errors.phone && <div className="error-message">{errors.phone}</div>}
      </div>

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="numTickets">Number of Tickets *</label>
          <input
            type="number"
            id="numTickets"
            name="numTickets"
            min="1"
            max={event?.max_tickets || 10}
            value={formData.numTickets}
            onChange={handleChange}
            className={`form-control ${errors.numTickets ? 'error' : ''}`}
          />
          {errors.numTickets && <div className="error-message">{errors.numTickets}</div>}
        </div>

        <div className="form-group">
          <label htmlFor="ticketType">Ticket Type</label>
          <select
            id="ticketType"
            name="ticketType"
            value={formData.ticketType}
            onChange={handleChange}
            className="form-control"
          >
            {ticketTypes.map((type, index) => (
              <option key={index} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="form-group">
        <label htmlFor="specialRequests">Special Requests</label>
        <textarea
          id="specialRequests"
          name="specialRequests"
          value={formData.specialRequests}
          onChange={handleChange}
          className="form-control"
          rows="3"
        ></textarea>
      </div>

      <div className="form-group">
        <label>How would you like to receive your QR code? *</label>
        <div className="contact-method-options">
          <label className={`contact-option ${formData.alert === 'email' ? 'selected' : ''}`}>
            <input
              type="radio"
              name="alert"
              value="email"
              checked={formData.alert === 'email'}
              onChange={handleChange}
            />
            <FaEnvelope className="contact-icon" />
            <span>Email</span>
          </label>
          <label className={`contact-option ${formData.alert === 'sms' ? 'selected' : ''}`}>
            <input
              type="radio"
              name="alert"
              value="sms"
              checked={formData.alert === 'sms'}
              onChange={handleChange}
            />
            <FaSms className="contact-icon" />
            <span>Text Message</span>
          </label>
        </div>
      </div>

      {errors.form && <div className="form-error-message">{errors.form}</div>}

      <button 
        type="submit" 
        className="submit-button" 
        disabled={isSubmitting}
      >
        {isSubmitting ? 'Processing...' : 'Complete Reservation'}
      </button>

      <style jsx>{`
        .reservation-form {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .form-group label {
          font-weight: 500;
          color: var(--color-text-primary);
        }

        .form-control {
          padding: 0.75rem;
          border-radius: 4px;
          border: 1px solid rgba(255, 255, 255, 0.2);
          background-color: rgba(255, 255, 255, 0.05);
          color: var(--color-text-primary);
          font-size: 1rem;
          transition: border-color 0.2s;
        }
        
        /* Improved styling for select dropdown */
        select.form-control {
          appearance: none;
          background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='white'%3e%3cpath d='M7 10l5 5 5-5z'/%3e%3c/svg%3e");
          background-repeat: no-repeat;
          background-position: right 0.75rem center;
          background-size: 16px 12px;
          padding-right: 2.5rem;
        }
        
        /* For the dropdown options */
        select.form-control option {
          background-color: #2D3748;
          color: white;
        }

        .form-control:focus {
          outline: none;
          border-color: var(--color-primary);
          box-shadow: 0 0 0 1px var(--color-primary);
        }

        .form-control.error {
          border-color: #e53e3e;
        }

        .error-message {
          color: #e53e3e;
          font-size: 0.875rem;
          margin-top: 0.25rem;
        }

        .form-error-message {
          padding: 0.75rem;
          background-color: rgba(229, 62, 62, 0.1);
          border-left: 3px solid #e53e3e;
          color: #e53e3e;
          margin-bottom: 1rem;
        }

        .submit-button {
          padding: 0.75rem 1.5rem;
          background-color: var(--color-primary);
          color: white;
          border: none;
          border-radius: 4px;
          font-weight: 600;
          cursor: pointer;
          transition: background-color 0.2s;
          margin-top: 1rem;
        }

        .submit-button:hover:not(:disabled) {
          background-color: var(--color-primary-dark);
        }

        .submit-button:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        .reservation-success-message {
          text-align: center;
          padding: 2rem;
        }

        .reservation-success-message h2 {
          color: #10b981;
          font-size: 1.5rem;
          margin-bottom: 1rem;
        }

        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
        }

        .contact-method-options {
          display: flex;
          gap: 1rem;
          margin-top: 0.5rem;
        }

        .contact-option {
          display: flex;
          align-items: center;
          padding: 0.75rem 1rem;
          background-color: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 4px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .contact-option:hover {
          background-color: rgba(255, 255, 255, 0.1);
        }

        .contact-option.selected {
          border-color: var(--color-primary);
          background-color: rgba(var(--color-primary-rgb), 0.1);
        }

        .contact-option input {
          position: absolute;
          opacity: 0;
        }

        .contact-icon {
          margin-right: 0.5rem;
          color: var(--color-primary);
        }
      `}</style>
    </form>
  );
}
