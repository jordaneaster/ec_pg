import React from 'react';
import Image from 'next/image';
import { getQrCodePath } from '../../utils/qrGenerator';

const EventQrCode = ({ eventId, size = 150 }) => {
  const qrPath = getQrCodePath(eventId);

  if (!qrPath) {
    return <div className="text-sm text-gray-400">QR code not available</div>;
  }

  return (
    <div className="flex flex-col items-center">
      <div className="bg-white p-2 rounded-md shadow-md">
        <Image 
          src={qrPath}
          alt={`QR Code for Event ${eventId}`}
          width={size}
          height={size}
          className="max-w-full h-auto"
        />
      </div>
      <p className="text-sm mt-2 text-center text-gray-300">
        Scan to view event details
      </p>
    </div>
  );
};

export default EventQrCode;
