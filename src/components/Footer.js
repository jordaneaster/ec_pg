import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { 
  FaFacebook, 
  FaTwitter, 
  FaInstagram, 
  FaYoutube, 
  FaSpotify, 
  FaMapMarkerAlt, 
  FaEnvelope, 
  FaPhone,
  FaArrowRight
} from 'react-icons/fa';

export default function Footer() {
  return (
    <footer className="program-footer">
      {/* Elegant divider */}
      <div className="program-footer-divider">
        <div className="program-footer-ornament"></div>
      </div>
      
      {/* Main Footer Content */}
      <div className="program-footer-content">
        <div className="container mx-auto px-4 py-16 relative z-10 max-w-6xl">
          <div className="program-footer-grid">
                  <div className="program-footer-column">
                    <div className="mb-6 flex flex-col items-center md:items-start">
                    <Image 
                      src="/program10.png" 
                      alt="The Program" 
                      width={80} 
                      height={80} 
                      className="mb-4"
                    />
                    <h2 className="text-2xl font-serif mb-2">THE PROGRAM</h2>
                    <p className="text-sm italic text-gray-300 mb-4 font-serif">
                      "Nothing is bigger than the program"
                    </p>
                    </div>
                    <p className="text-gray-400 mb-6 font-serif leading-relaxed text-center md:text-left">
                    Join us for exclusive parties, concerts and events that define the cultural experience.
                    </p>
                    <div className="program-social-icons">
                    <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" aria-label="Facebook">
                      <FaFacebook />
                    </a>
                    <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" aria-label="Twitter">
                      <FaTwitter />
                    </a>
                    <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
                      <FaInstagram />
                    </a>
                    <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" aria-label="YouTube">
                      <FaYoutube />
                    </a>
                    <a href="https://spotify.com" target="_blank" rel="noopener noreferrer" aria-label="Spotify">
                      <FaSpotify />
                    </a>
                    </div>
                  </div>
                  
                  {/* Quick Links Card */}
            <div className="program-footer-column">
              <h3 className="program-footer-heading">Program Directory</h3>
              <ul className="program-footer-links">
                <li><Link href="/music">Music</Link></li>
                <li><Link href="/events">Events</Link></li>
                <li><Link href="/gallery">Gallery</Link></li>
                <li><Link href="/shop">Shop</Link></li>
                <li><Link href="/reservations">Attend</Link></li>
              </ul>
            </div>
            
            {/* Contact Card */}
            <div className="program-footer-column">
              <h3 className="program-footer-heading">Contact</h3>
              <address className="program-footer-contact">
                <p><FaMapMarkerAlt className="contact-icon" /> 123 Ceremony Avenue, Miami, FL 33101</p>
                <p><FaEnvelope className="contact-icon" /> contact@theprogram.com</p>
                <p><FaPhone className="contact-icon" /> (555) 123-4567</p>
              </address>
            </div>
            
            {/* Newsletter Card */}
            <div className="program-footer-column">
              <h3 className="program-footer-heading">Notifications</h3>
              <p className="text-gray-400 mb-4 font-serif">
                Receive invitations to our upcoming ceremonies.
              </p>
              <form className="program-newsletter-form">
                <div className="program-form-group">
                  <input 
                    type="email" 
                    placeholder="Your email address" 
                    className="program-newsletter-input"
                    required
                  />
                  <button type="submit" className="program-newsletter-button">
                    <FaArrowRight />
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
      
      {/* Footer Bottom / Copyright */}
      <div className="program-footer-bottom">
        <div className="container mx-auto px-4 py-6 max-w-6xl">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-500 mb-4 md:mb-0 font-serif text-sm">
              &copy; {new Date().getFullYear()} THE PROGRAM. All rights reserved.
            </p>
            <div className="flex space-x-6">
              <Link href="/privacy" className="text-gray-500 hover:text-white text-sm font-serif">
                Privacy Policy
              </Link>
              <Link href="/terms" className="text-gray-500 hover:text-white text-sm font-serif">
                Terms of Service
              </Link>
            </div>
          </div>
        </div>
      </div>
      
      {/* Simple decorative line at bottom */}
      <div className="h-1 bg-gradient-to-r from-transparent via-gray-700 to-transparent opacity-30"></div>
    </footer>
  );
}
