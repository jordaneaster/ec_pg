import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '../contexts/AuthContext';
import { FaBars, FaTimes, FaUser, FaShoppingCart } from 'react-icons/fa';

export default function Nav() {
  const [menuOpen, setMenuOpen] = useState(false);
  const auth = useAuth();
  const user = auth?.user;
  const signOut = auth?.signOut;

  return (
    <nav className="program-navbar">
      <div className="container">
        <div className="program-nav">
          <Link href="/" className="program-logo">
            <div className="flex items-center">
              <Image 
                src="/program10.png" 
                alt="The Program" 
                width={40} 
                height={40} 
                className="mr-3"
              />
              <span className="font-serif text-xl tracking-wide">THE PROGRAM</span>
            </div>
          </Link>
          
          {/* Mobile menu button */}
          <button 
            className="program-mobile-toggle"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
          >
            {menuOpen ? <FaTimes size={20} /> : <FaBars size={20} />}
          </button>
          
          {/* Desktop Navigation */}
          <div className="program-desktop-menu">
            <ul>
              <li><Link href="/music">Music</Link></li>
              <li><Link href="/events">Events</Link></li>
              <li><Link href="/gallery">Gallery</Link></li>
              <li><Link href="/shop">Shop</Link></li>
              <li><Link href="/reservations">Attend</Link></li>
            </ul>
          </div>
          
          {/* User menu for desktop */}
          <div className="program-user-menu">
            <Link href="/cart" aria-label="Shopping Cart" className="program-icon-link">
              <FaShoppingCart size={15} /> {/* Reduced size from 18 to 15 */}
            </Link>
            
            {user ? (
              <div className="program-dropdown">
                <button className="program-dropdown-toggle">
                  <FaUser size={18} />
                  <span className="ml-2 font-serif">Account</span>
                </button>
                <div className="program-dropdown-menu">
                  <Link href="/account">Profile</Link>
                  <Link href="/orders">Orders</Link>
                  <button onClick={() => signOut && signOut()}>
                    Sign Out
                  </button>
                </div>
              </div>
            ) : (
              <Link href="/login" className="font-serif">Members</Link>
            )}
          </div>
        </div>
        
        {/* Mobile Navigation */}
        <div className={`program-mobile-menu ${menuOpen ? 'active' : ''}`}>
          <div 
            className="mobile-menu-backdrop" 
            onClick={() => setMenuOpen(false)}
          ></div>
          <div className="mobile-menu-content">
            <button 
              className="close-menu-btn" 
              onClick={() => setMenuOpen(false)}
              aria-label="Close menu"
            >
              <FaTimes size={20} />
            </button>
            <ul>
              <li><Link href="/" onClick={() => setMenuOpen(false)}>Home</Link></li>
              <li><Link href="/music" onClick={() => setMenuOpen(false)}>Music</Link></li>
              <li><Link href="/events" onClick={() => setMenuOpen(false)}>Events</Link></li>
              <li><Link href="/gallery" onClick={() => setMenuOpen(false)}>Gallery</Link></li>
              <li><Link href="/shop" onClick={() => setMenuOpen(false)}>Shop</Link></li>
              {/* Uncomment and adjust mobile auth links as needed */}
              {user ? (
                <>
                  <li><Link href="/account" onClick={() => setMenuOpen(false)}>Profile</Link></li>
                  <li><Link href="/orders" onClick={() => setMenuOpen(false)}>Orders</Link></li>
                  <li>
                    <button 
                      onClick={() => {
                        signOut && signOut();
                        setMenuOpen(false);
                      }}
                    >
                      Sign Out
                    </button>
                  </li>
                </>
              ) : (
                <li><Link href="/login" onClick={() => setMenuOpen(false)}>Members</Link></li>
              )}
            </ul>
          </div>
        </div>
      </div>

      <style jsx>{`
        .program-mobile-menu {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100vh;
          z-index: 1000;
          visibility: hidden;
          opacity: 0;
          transition: visibility 0s linear 0.3s, opacity 0.3s ease;
        }

        .program-mobile-menu.active {
          visibility: visible;
          opacity: 1;
          transition-delay: 0s;
        }

        .mobile-menu-backdrop {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(0, 0, 0, 0.3); /* Clearer transparent background */
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
          transition: opacity 0.3s ease;
        }

        .mobile-menu-content {
          position: absolute;
          top: 0;
          right: 0;
          width: 80%;
          height: 100%;
          padding: 2rem 1.5rem;
          background: rgba(25, 25, 25, 0.7); /* Semi-transparent background */
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
          transform: translateX(100%);
          transition: transform 0.3s ease;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
          align-items: flex-start;
        }

        .program-mobile-menu.active .mobile-menu-content {
          transform: translateX(0);
        }

        .close-menu-btn {
          align-self: flex-end;
          background: none;
          border: none;
          color: white;
          cursor: pointer;
          margin-bottom: 1rem;
        }

        .program-mobile-menu ul {
          list-style: none;
          padding: 0;
          margin: 0;
          width: 100%;
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .program-mobile-menu li {
          margin: 0;
        }

        .program-mobile-menu a, 
        .program-mobile-menu button {
          color: white;
          font-size: 1.2rem;
          display: block;
          text-decoration: none;
          padding: 0.5rem 0;
          font-family: serif;
          background: none;
          border: none;
          text-align: left;
          width: 100%;
          transition: color 0.2s;
        }

        .program-mobile-menu a:hover,
        .program-mobile-menu button:hover {
          color: #ccc;
        }

        @media (max-width: 768px) {
          .mobile-menu-content {
            width: 85%;
          }
        }
      `}</style>
    </nav>
  );
}
