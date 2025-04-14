import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { QRCodeService } from '../../services/QRCodeService';

export const ReservationSystem = () => {
  const [events, setEvents] = useState([]);
  const [myReservations, setMyReservations] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState('');
  const [loading, setLoading] = useState(true);
  const [reservationMessage, setReservationMessage] = useState('');
  const [currentUser, setCurrentUser] = useState(null);
  
  useEffect(() => {
    // Get current user
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUser(user);
      
      if (user) {
        fetchEvents();
        fetchMyReservations(user.id);
      } else {
        setLoading(false);
      }
    };
    
    getUser();
  }, []);
  
  const fetchEvents = async () => {
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .order('date', { ascending: true });
    
    if (error) console.error('Error fetching events:', error);
    else setEvents(data || []);
    setLoading(false);
  };
  
  const fetchMyReservations = async (userId) => {
    const { data, error } = await supabase
      .from('reservations')
      .select(`
        *,
        event:events(*)
      `)
      .eq('user_id', userId);
    
    if (error) console.error('Error fetching reservations:', error);
    else setMyReservations(data || []);
  };
  
  const handleEventChange = (e) => {
    setSelectedEvent(e.target.value);
  };
  
  const createReservation = async () => {
    if (!selectedEvent || !currentUser) {
      setReservationMessage('Please select an event and ensure you are logged in');
      return;
    }
    
    // Check if user already has a reservation for this event
    const existingReservation = myReservations.find(r => r.event_id === selectedEvent);
    if (existingReservation) {
      setReservationMessage('You already have a reservation for this event');
      return;
    }
    
    // Create a new reservation
    const { data, error } = await supabase
      .from('reservations')
      .insert([{
        event_id: selectedEvent,
        user_id: currentUser.id,
        status: 'pending',
        dynamic_qr_code: 'placeholder', // Will be updated by QR service
        expiration_time: new Date().toISOString() // Will be updated by QR service
      }])
      .select();
    
    if (error) {
      console.error('Error creating reservation:', error);
      setReservationMessage('Failed to create reservation');
      return;
    }
    
    if (data && data.length > 0) {
      // Generate QR code for the reservation
      try {
        await QRCodeService.generateReservationQR(
          data[0].id,
          selectedEvent,
          currentUser.id
        );
        
        setReservationMessage('Reservation created successfully!');
        fetchMyReservations(currentUser.id);
      } catch (qrError) {
        console.error('Error generating QR code:', qrError);
        setReservationMessage('Reservation created but QR code generation failed');
      }
    }
  };
  
  const cancelReservation = async (reservationId) => {
    const { error } = await supabase
      .from('reservations')
      .update({ status: 'cancelled' })
      .eq('id', reservationId);
    
    if (error) {
      console.error('Error cancelling reservation:', error);
      return;
    }
    
    fetchMyReservations(currentUser.id);
  };
  
  if (!currentUser) {
    return <div className="container mx-auto p-4">Please log in to make reservations.</div>;
  }
  
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Event Reservations</h1>
      
      {/* Create Reservation Section */}
      <div className="bg-white shadow-md rounded p-4 mb-6">
        <h2 className="text-xl font-semibold mb-2">Make a Reservation</h2>
        
        {reservationMessage && (
          <div className="mb-4 p-2 bg-blue-100 text-blue-800 rounded">
            {reservationMessage}
          </div>
        )}
        
        <div className="mb-4">
          <label className="block text-gray-700">Select Event</label>
          <select 
            value={selectedEvent} 
            onChange={handleEventChange}
            className="w-full border rounded px-3 py-2"
          >
            <option value="">-- Select an event --</option>
            {events.map(event => (
              <option key={event.id} value={event.id}>
                {event.name} - {new Date(event.date).toLocaleDateString()}
              </option>
            ))}
          </select>
        </div>
        
        <button
          onClick={createReservation}
          className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
        >
          Create Reservation
        </button>
      </div>
      
      {/* My Reservations Section */}
      <div className="bg-white shadow-md rounded p-4">
        <h2 className="text-xl font-semibold mb-4">My Reservations</h2>
        
        {myReservations.length === 0 ? (
          <p>You don't have any reservations yet.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {myReservations.map(reservation => (
              <div key={reservation.id} className="border rounded p-3">
                <h3 className="font-bold">{reservation.event?.name}</h3>
                <p>Status: {reservation.status}</p>
                <p>Date: {reservation.event ? new Date(reservation.event.date).toLocaleDateString() : 'Unknown'}</p>
                
                {reservation.status !== 'cancelled' && (
                  <>
                    {reservation.dynamic_qr_code && (
                      <div className="my-2">
                        <img src={reservation.dynamic_qr_code} alt="QR Code" className="max-w-full h-auto" />
                      </div>
                    )}
                    
                    <button
                      onClick={() => cancelReservation(reservation.id)}
                      className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 text-sm mt-2"
                    >
                      Cancel Reservation
                    </button>
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
