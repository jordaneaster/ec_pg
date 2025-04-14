import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { QRCodeService } from '../../services/QRCodeService';

export const EventManagement = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newEvent, setNewEvent] = useState({
    name: '',
    description: '',
    date: '',
    location: '',
    capacity: 0
  });
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showQRModal, setShowQRModal] = useState(false);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .order('date', { ascending: true });
    
    if (error) console.error('Error fetching events:', error);
    else setEvents(data || []);
    setLoading(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewEvent({ ...newEvent, [name]: value });
  };

  const createEvent = async (e) => {
    e.preventDefault();
    
    // Insert new event
    const { data, error } = await supabase
      .from('events')
      .insert([newEvent])
      .select();
    
    if (error) {
      console.error('Error creating event:', error);
      return;
    }
    
    if (data && data.length > 0) {
      // Generate static QR code for the event
      try {
        const qrCodeURL = await QRCodeService.generateEventQR(data[0].id);
        console.log('QR Code generated:', qrCodeURL);
        
        // Refresh events list
        fetchEvents();
        
        // Reset form
        setNewEvent({
          name: '',
          description: '',
          date: '',
          location: '',
          capacity: 0
        });
      } catch (qrError) {
        console.error('Error generating QR code:', qrError);
      }
    }
  };

  const viewEventQR = (event) => {
    setSelectedEvent(event);
    setShowQRModal(true);
  };

  const regenerateQRCode = async (eventId) => {
    try {
      const qrCodeURL = await QRCodeService.generateEventQR(eventId);
      
      // Update the selected event with new QR code
      setSelectedEvent(prev => ({
        ...prev,
        static_qr_code: qrCodeURL
      }));
      
      // Refresh events list
      fetchEvents();
    } catch (error) {
      console.error('Error regenerating QR code:', error);
    }
  };

  const downloadQRCode = (qrCodeURL, eventName) => {
    const link = document.createElement('a');
    link.href = qrCodeURL;
    link.download = `${eventName.replace(/\s+/g, '-').toLowerCase()}-qr-code.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Event Management</h1>
      
      {/* Create Event Form */}
      <div className="bg-white shadow-md rounded p-4 mb-6">
        <h2 className="text-xl font-semibold mb-2">Create New Event</h2>
        <form onSubmit={createEvent}>
          <div className="mb-4">
            <label className="block text-gray-700">Event Name</label>
            <input
              type="text"
              name="name"
              value={newEvent.name}
              onChange={handleInputChange}
              className="w-full border rounded px-3 py-2"
              required
            />
          </div>
          
          <button
            type="submit"
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Create Event
          </button>
        </form>
      </div>
      
      {/* Events List */}
      <div className="bg-white shadow-md rounded p-4">
        <h2 className="text-xl font-semibold mb-4">Events List</h2>
        
        {loading ? (
          <p>Loading events...</p>
        ) : events.length === 0 ? (
          <p>No events found.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {events.map(event => (
              <div key={event.id} className="border rounded p-3">
                <h3 className="font-bold">{event.name}</h3>
                <p>{event.description}</p>
                <p>Date: {new Date(event.date).toLocaleDateString()}</p>
                <p>Location: {event.location}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Existing Events Table */}
      <div className="mt-8">
        <h2 className="text-xl font-bold mb-4">Existing Events</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-200">
            <thead>
              <tr>
                <th className="py-2 px-4 border-b">Name</th>
                <th className="py-2 px-4 border-b">Date</th>
                <th className="py-2 px-4 border-b">Location</th>
                <th className="py-2 px-4 border-b">Actions</th>
              </tr>
            </thead>
            <tbody>
              {events.map((event) => (
                <tr key={event.id}>
                  <td className="py-2 px-4 border-b">{event.name}</td>
                  <td className="py-2 px-4 border-b">{event.date}</td>
                  <td className="py-2 px-4 border-b">{event.location}</td>
                  <td className="py-2 px-4 border-b">
                    <button
                      onClick={() => viewEventQR(event)}
                      className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-2 rounded mr-2"
                    >
                      View QR
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* QR Code Modal */}
      {showQRModal && selectedEvent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-md w-full">
            <h2 className="text-xl font-bold mb-2">{selectedEvent.name} QR Code</h2>
            <div className="flex flex-col items-center justify-center my-4">
              {selectedEvent.static_qr_code ? (
                <img 
                  src={selectedEvent.static_qr_code} 
                  alt="Event QR Code" 
                  className="w-64 h-64 mb-4"
                />
              ) : (
                <p className="text-gray-500 mb-4">No QR code available</p>
              )}
              <div className="flex space-x-2">
                <button
                  onClick={() => regenerateQRCode(selectedEvent.id)}
                  className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
                >
                  Regenerate
                </button>
                {selectedEvent.static_qr_code && (
                  <button
                    onClick={() => downloadQRCode(selectedEvent.static_qr_code, selectedEvent.name)}
                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                  >
                    Download
                  </button>
                )}
                <button
                  onClick={() => setShowQRModal(false)}
                  className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
