/**
 * Send QR code to user via preferred method
 * @param {string} method - 'email' or 'text'
 * @param {string} destination - Email address or phone number
 * @param {string} qrCodeUrl - URL to the generated QR code
 * @param {Object} eventData - Data about the event
 * @param {Object} reservationData - Data about the reservation
 * @returns {Promise<boolean>} - Success status
 */
export async function sendQrCodeNotification(method, destination, qrCodeUrl, eventData, reservationData) {
  try {
    if (method === 'email') {
      await sendEmailNotification(destination, qrCodeUrl, eventData, reservationData);
    } else if (method === 'sms') {
      await sendTextNotification(destination, qrCodeUrl, eventData, reservationData);
    } else {
      console.error('Invalid notification method:', method);
      return false;
    }
    return true;
  } catch (error) {
    console.error(`Error sending ${method} notification:`, error);
    return false;
  }
}

/**
 * Send QR code via email
 * @param {string} email - Recipient email address
 * @param {string} qrCodeUrl - URL to the generated QR code
 * @param {Object} eventData - Data about the event
 * @param {Object} reservationData - Data about the reservation
 */
async function sendEmailNotification(email, qrCodeUrl, eventData, reservationData) {
  // Format event date
  const eventDate = new Date(eventData.event_date);
  const formattedDate = eventDate.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
  
  const formattedTime = eventDate.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });

  // Email content
  const emailContent = {
    to: email,
    subject: `Your Reservation for ${eventData.title}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #8a2be2; text-align: center;">Your Reservation is Confirmed!</h1>
        
        <p>Hello ${reservationData.fullName},</p>
        
        <p>Thank you for your reservation for ${eventData.title}. We're looking forward to seeing you!</p>
        
        <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <h2 style="margin-top: 0; color: #8a2be2;">Event Details</h2>
          <p><strong>Event:</strong> ${eventData.title}</p>
          <p><strong>Date:</strong> ${formattedDate}</p>
          <p><strong>Time:</strong> ${formattedTime}</p>
          <p><strong>Location:</strong> ${eventData.location}</p>
        </div>
        
        <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <h2 style="margin-top: 0; color: #8a2be2;">Reservation Details</h2>
          <p><strong>Confirmation #:</strong> ${reservationData.reservationId}</p>
          <p><strong>Tickets:</strong> ${reservationData.numTickets} x ${reservationData.ticketType}</p>
        </div>
        
        <div style="text-align: center; margin: 30px 0;">
          <p style="font-weight: bold; margin-bottom: 15px;">Your QR Code Ticket</p>
          <img src="${qrCodeUrl}" alt="QR Code Ticket" style="max-width: 250px; border: 1px solid #ddd; padding: 10px; border-radius: 5px;" />
          <p style="font-size: 14px; color: #666; margin-top: 10px;">
            Please present this QR code upon arrival at the event.
          </p>
        </div>
        
        <p>If you have any questions or need to make changes to your reservation, please contact us.</p>
        
        <p>Thank you!</p>
        <p>The PGE Team</p>
      </div>
    `,
  };

  // Use your email service here
  // Example with API route:
  const response = await fetch('/api/send-email', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(emailContent),
  });

  if (!response.ok) {
    throw new Error('Failed to send email notification');
  }
}

/**
 * Send QR code via text message
 * @param {string} phoneNumber - Recipient phone number
 * @param {string} qrCodeUrl - URL to the generated QR code
 * @param {Object} eventData - Data about the event
 * @param {Object} reservationData - Data about the reservation
 */
async function sendTextNotification(phoneNumber, qrCodeUrl, eventData, reservationData) {
  // Format event date
  const eventDate = new Date(eventData.event_date);
  const formattedDate = eventDate.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
  
  const formattedTime = eventDate.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });

  // Text message content
  const messageContent = {
    to: phoneNumber,
    body: `Your reservation for ${eventData.title} on ${formattedDate} at ${formattedTime} is confirmed! ${reservationData.numTickets} ${reservationData.ticketType} ticket(s). View your QR code ticket: ${qrCodeUrl}`,
  };

  // Use your SMS service here
  // Example with API route:
  const response = await fetch('/api/send-sms', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(messageContent),
  });

  if (!response.ok) {
    throw new Error('Failed to send text notification');
  }
}
