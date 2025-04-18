import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Image from 'next/image';
import Link from 'next/link';
import { supabase } from '../../../lib/supabaseClient';
import { useAuth } from '../../../contexts/AuthContext';
import AccountContainer from '../../../components/account/AccountContainer';
import {
    FaArrowLeft, FaCalendarAlt, FaMapMarkerAlt, FaQrcode, FaUser,
    FaTicketAlt, FaClock, FaInfoCircle, FaPrint, FaDownload,
    FaSpinner
} from 'react-icons/fa';

export default function ReservationDetailsPage() {
    const [reservation, setReservation] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const router = useRouter();
    const { id } = router.query;
    const { user } = useAuth();

    useEffect(() => {
        if (!id || !user) return;

        const fetchReservationDetails = async () => {
            setLoading(true);
            try {
                // First, check if the current user owns this reservation
                const { data: userReservation, error: userError } = await supabase
                    .from('reservations')
                    .select('user_id')
                    .eq('id', id)
                    .single();

                if (userError) throw userError;

                // Security check to ensure user can only see their own reservations
                if (userReservation.user_id !== user.id) {
                    setError('You do not have permission to view this reservation.');
                    setLoading(false);
                    return;
                }

                // Fetch the full reservation with event details
                const { data, error } = await supabase
                    .from('reservations')
                    .select(`
            *,
            event_id:events ( id, title, description, event_date, location, image_url )
          `)
                    .eq('id', id)
                    .single();

                if (error) throw error;

                setReservation(data);
                setLoading(false);
            } catch (err) {
                console.error('Error fetching reservation:', err);
                setError('Failed to load reservation details. Please try again.');
                setLoading(false);
            }
        };

        fetchReservationDetails();
    }, [id, user]);

    if (loading) {
        return (
            <AccountContainer>
                <div className="flex flex-col items-center justify-center min-h-[400px]">
                    <div className="spinner-container mb-4">
                        <div className="absolute w-12 h-12 border-4 border-indigo-500/30 rounded-full"></div>
                        <div className="absolute w-12 h-12 border-t-4 border-indigo-500 rounded-full animate-spin"></div>
                    </div>
                    <p className="text-gray-400">Loading reservation details...</p>
                </div>
            </AccountContainer>
        );
    }

    if (error) {
        return (
            <AccountContainer>
                <div className="bg-red-900/20 border border-red-700 rounded-lg p-4 text-center">
                    <FaInfoCircle className="text-red-400 text-xl mb-2 mx-auto" />
                    <p className="text-red-300">{error}</p>
                    <Link href="/account">
                        <button className="mt-4 btn-secondary">
                            Return to Account
                        </button>
                    </Link>
                </div>
            </AccountContainer>
        );
    }

    if (!reservation) {
        return (
            <AccountContainer>
                <div className="bg-gray-800 rounded-lg p-6 text-center">
                    <p className="text-gray-400">Reservation not found.</p>
                    <Link href="/account">
                        <button className="mt-4 btn-secondary">
                            Return to Account
                        </button>
                    </Link>
                </div>
            </AccountContainer>
        );
    }

    const hasEventDetails = typeof reservation.event_id === 'object' && reservation.event_id !== null;
    const eventData = hasEventDetails ? reservation.event_id : null;

    const isExpired = reservation.expiration_time && new Date(reservation.expiration_time) < new Date();
    const isPast = eventData?.event_date ? new Date(eventData.event_date) < new Date() : isExpired;

    const formattedCreationDate = new Date(reservation.created_at)
        .toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true });

    const eventTitle = eventData?.title || `Event #${reservation.event_id}`;
    const eventLocation = eventData?.location || 'Location details unavailable';
    const eventDate = eventData?.event_date
        ? new Date(eventData.event_date).toLocaleString('en-US', {
            year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true
        })
        : 'Date information unavailable';

    let statusText = reservation.status.charAt(0).toUpperCase() + reservation.status.slice(1);
    let statusColor = 'bg-blue-500/20 text-blue-300 ring-1 ring-inset ring-blue-500/30';

    if (isExpired) {
        statusText = 'Expired';
        statusColor = 'bg-gray-600/30 text-gray-400 ring-1 ring-inset ring-gray-600/40';
    } else if (isPast) {
        statusText = 'Past Event';
        statusColor = 'bg-purple-500/20 text-purple-300 ring-1 ring-inset ring-purple-500/30';
    } else if (reservation.status === 'confirmed') {
        statusText = 'Confirmed';
        statusColor = 'bg-green-500/20 text-green-300 ring-1 ring-inset ring-green-500/30';
    }

    return (
        <AccountContainer>
            <div className="flex justify-between items-start mb-6">
                <Link
                    href="/account"
                    className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition"
                >
                    <FaArrowLeft className="w-3.5 h-3.5" />
                    <span>Back to Reservations</span>
                </Link>

                <div className={`px-3 py-1 rounded-full text-xs font-semibold ${statusColor}`}>
                    {statusText}
                </div>
            </div>

            <div className="bg-gray-800 rounded-xl overflow-hidden">
                {/* Header */}
                <div className="p-6 border-b border-gray-700">
                    <div className="flex flex-col md:flex-row justify-between gap-4">
                        <div className="flex-1 min-w-0">
                            <h1 className="text-2xl font-bold text-white mb-2 truncate">
                                {eventTitle}
                            </h1>
                            <div className="flex flex-col gap-2 text-gray-400">
                                <p className="flex items-center gap-2">
                                    <FaCalendarAlt className="w-4 h-4 text-gray-500" />
                                    {eventDate}
                                </p>
                                <p className="flex items-center gap-2">
                                    <FaMapMarkerAlt className="w-4 h-4 text-gray-500" />
                                    {eventLocation}
                                </p>
                            </div>
                        </div>

                        {eventData?.image_url && (
                            <div className="event-image-container">
                                <Image
                                    src={eventData.image_url}
                                    alt={eventTitle}
                                    fill
                                    className="event-image"
                                    sizes="(max-width: 768px) 120px, 150px"
                                />
                            </div>
                        )}
                    </div>
                </div>

                {/* QR Code Section - with custom CSS classes */}
                {reservation.qr_code_url && !isExpired && (
                    <div className="bg-gray-900/50 p-6 border-b border-gray-700">
                        <div className="reservation-qr-container">
                            <div className="mb-4 text-center">
                                <h2 className="text-lg font-semibold text-white mb-1">Reservation QR Code</h2>
                                <p className="text-sm text-gray-400">Present this QR code at the venue entrance</p>
                            </div>

                            <div className="qr-code-wrapper">
                                <img
                                    src={reservation.qr_code_url}
                                    alt="Reservation QR Code"
                                    className="qr-code-image"
                                />
                            </div>

                            {/* Updated action buttons with better styling */}
                            <div className="qr-action-buttons">
                                <button 
                                    onClick={() => window.print()} 
                                    className="qr-action-button"
                                >
                                    <FaPrint />
                                    <span>Print</span>
                                </button>

                                <a
                                    href={reservation.qr_code_url}
                                    download={`reservation-${id}.png`}
                                    className="qr-action-button"
                                >
                                    <FaDownload />
                                    <span>Download</span>
                                </a>
                            </div>
                        </div>
                    </div>
                )}

                {/* Reservation Details */}
                <div className="p-6">
                    <h2 className="text-lg font-semibold text-white mb-4">Reservation Details</h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <ul className="space-y-3">
                                <li className="flex justify-between">
                                    <span className="text-gray-400">Reservation ID:</span>
                                    <span className="text-gray-200 font-mono">{id.substring(0, 13)}</span>
                                </li>
                                <li className="flex justify-between">
                                    <span className="text-gray-400">Status:</span>
                                    <span className="font-medium text-gray-200">{statusText}</span>
                                </li>
                                <li className="flex justify-between">
                                    <span className="text-gray-400">Reserved On:</span>
                                    <span className="text-gray-200">{formattedCreationDate}</span>
                                </li>
                                {reservation.expiration_time && (
                                    <li className="flex justify-between">
                                        <span className="text-gray-400">Expires:</span>
                                        <span className="text-gray-200">
                                            {new Date(reservation.expiration_time).toLocaleString()}
                                        </span>
                                    </li>
                                )}
                            </ul>
                        </div>

                        <div>
                            <ul className="space-y-3">
                                <li className="flex justify-between">
                                    <span className="text-gray-400">Number of Tickets:</span>
                                    <span className="text-gray-200 font-medium">{reservation.num_tickets}</span>
                                </li>
                                {reservation.ticket_type && (
                                    <li className="flex justify-between">
                                        <span className="text-gray-400">Ticket Type:</span>
                                        <span className="text-gray-200">{reservation.ticket_type}</span>
                                    </li>
                                )}
                                {reservation.price_per_ticket && (
                                    <li className="flex justify-between">
                                        <span className="text-gray-400">Price Per Ticket:</span>
                                        <span className="text-gray-200">${parseFloat(reservation.price_per_ticket).toFixed(2)}</span>
                                    </li>
                                )}
                                {reservation.total_price && (
                                    <li className="flex justify-between">
                                        <span className="text-gray-400">Total Price:</span>
                                        <span className="text-gray-200 font-medium">${parseFloat(reservation.total_price).toFixed(2)}</span>
                                    </li>
                                )}
                            </ul>
                        </div>
                    </div>

                    {eventData?.description && (
                        <div className="mt-6">
                            <h3 className="text-md font-medium text-white mb-2">Event Description</h3>
                            <p className="text-gray-400 text-sm">{eventData.description}</p>
                        </div>
                    )}

                    {!reservation.qr_code_url && !isExpired && (
                        <div className="mt-6 bg-yellow-900/20 border border-yellow-700/50 rounded-lg p-4">
                            <div className="flex items-start gap-3">
                                <FaInfoCircle className="text-yellow-500 w-5 h-5 flex-shrink-0 mt-0.5" />
                                <p className="text-yellow-300 text-sm">
                                    No QR code is available for this reservation. Please contact support if you believe this is an error.
                                </p>
                            </div>
                        </div>
                    )}

                    {isExpired && (
                        <div className="mt-6 bg-red-900/20 border border-red-700/50 rounded-lg p-4">
                            <div className="flex items-start gap-3">
                                <FaInfoCircle className="text-red-400 w-5 h-5 flex-shrink-0 mt-0.5" />
                                <p className="text-red-300 text-sm">
                                    This reservation has expired and is no longer valid for entry.
                                </p>
                            </div>
                        </div>
                    )}

                    {isPast && !isExpired && (
                        <div className="mt-6 bg-purple-900/20 border border-purple-700/50 rounded-lg p-4">
                            <div className="flex items-start gap-3">
                                <FaInfoCircle className="text-purple-400 w-5 h-5 flex-shrink-0 mt-0.5" />
                                <p className="text-purple-300 text-sm">
                                    This event has already taken place.
                                </p>
                            </div>
                        </div>
                    )}

                    {!isPast && !isExpired && (
                        <div className="mt-6 bg-green-900/20 border border-green-700/50 rounded-lg p-4">
                            <div className="flex items-start gap-3">
                                <FaTicketAlt className="text-green-400 w-5 h-5 flex-shrink-0 mt-0.5" />
                                <p className="text-green-300 text-sm">
                                    This reservation is active. You can present the QR code at the venue for entry.
                                </p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer Actions */}
                <div className="reservation-footer">
                    <div className="text-sm text-gray-400">
                        <p>Need help? Contact <a href="mailto:support@example.com" className="text-indigo-400 hover:text-indigo-300">support@example.com</a></p>
                    </div>

                    <div className="footer-action-buttons">
                        <Link href="/account" className="footer-action-button footer-back-button">
                            Back to Account
                        </Link>

                        <button
                            onClick={() => window.print()}
                            className="footer-action-button footer-print-button inline-flex items-center"
                        >
                            <FaPrint className="w-4 h-4" />
                            <span>Print Details</span>
                        </button>
                    </div>
                </div>
            </div>
        </AccountContainer>
    );
}
