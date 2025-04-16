import twilio from 'twilio';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { to, body } = req.body;

  if (!to || !body) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  try {
    // Initialize the Twilio client
    const twilioClient = twilio(
      process.env.TWILIO_ACCOUNT_SID,
      process.env.TWILIO_AUTH_TOKEN
    );

    // Send the SMS
    await twilioClient.messages.create({
      to,
      from: process.env.TWILIO_PHONE_NUMBER,
      body,
    });

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error sending SMS:', error);
    return res.status(500).json({ message: 'Failed to send SMS' });
  }
}
