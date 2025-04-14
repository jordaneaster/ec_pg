import React from 'react';

export const QRCodeDisplay = ({ qrCodeData, title, description }) => {
  return (
    <div className="qr-code-display">
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      {description && <p className="text-gray-600 mb-2">{description}</p>}
      
      <div className="qr-image-container border rounded p-2 inline-block bg-white">
        <img src={qrCodeData} alt="QR Code" className="max-w-full" />
      </div>
    </div>
  );
};
