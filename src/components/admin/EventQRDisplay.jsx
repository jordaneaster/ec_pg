import React from 'react';
import { QRCodeService } from '../../services/QRCodeService';

const EventQRDisplay = ({ event, onClose }) => {
  const [qrCode, setQrCode] = React.useState(event?.static_qr_code || null);
  const [loading, setLoading] = React.useState(false);

  const regenerateQRCode = async () => {
    if (!event?.id) return;
    
    setLoading(true);
    try {
      const qrCodeURL = await QRCodeService.generateEventQR(event.id);
      setQrCode(qrCodeURL);
    } catch (error) {
      console.error('Error regenerating QR code:', error);
    } finally {
      setLoading(false);
    }
  };

  const downloadQRCode = () => {
    if (!qrCode) return;
    
    const link = document.createElement('a');
    link.href = qrCode;
    link.download = `event-${event.id}-qr-code.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const printQRCode = () => {
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>Event QR Code: ${event?.name}</title>
          <style>
            body { font-family: Arial, sans-serif; text-align: center; }
            .container { margin: 40px auto; max-width: 600px; }
            img { width: 300px; height: 300px; }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>${event?.name}</h1>
            <p>${event?.date} | ${event?.location}</p>
            <img src="${qrCode}" alt="Event QR Code" />
            <p>Scan this QR code to check in for the event</p>
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => printWindow.print(), 500);
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg">
      <h2 className="text-xl font-bold mb-4">{event.name} QR Code</h2>
      
      <div className="flex flex-col items-center mb-4">
        {qrCode ? (
          <img src={qrCode} alt="Event QR Code" className="w-64 h-64 mb-4" />
        ) : (
          <div className="w-64 h-64 border-2 border-dashed border-gray-300 flex items-center justify-center mb-4">
            <p className="text-gray-500">No QR code available</p>
          </div>
        )}
      </div>
      
      <div className="flex flex-wrap gap-2 justify-center">
        <button
          onClick={regenerateQRCode}
          disabled={loading}
          className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded disabled:opacity-50"
        >
          {loading ? 'Generating...' : 'Regenerate QR Code'}
        </button>
        
        {qrCode && (
          <>
            <button
              onClick={downloadQRCode}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
            >
              Download
            </button>
            
            <button
              onClick={printQRCode}
              className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded"
            >
              Print
            </button>
          </>
        )}
        
        <button
          onClick={onClose}
          className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded"
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default EventQRDisplay;
