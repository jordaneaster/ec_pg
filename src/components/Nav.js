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
              <FaShoppingCart size={18} />
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
        <div className={`program-mobile-menu ${menuOpen ? '' : ''}`}>
          <ul>
            <li><Link href="/music" onClick={() => setMenuOpen(false)}>Music</Link></li>
            <li><Link href="/events" onClick={() => setMenuOpen(false)}>Events</Link></li>
            <li><Link href="/gallery" onClick={() => setMenuOpen(false)}>Gallery</Link></li>
            <li><Link href="/shop" onClick={() => setMenuOpen(false)}>Shop</Link></li>
            <li><Link href="/reservations" onClick={() => setMenuOpen(false)}>Attend</Link></li>
            <li><Link href="/cart" onClick={() => setMenuOpen(false)}>Cart</Link></li>
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
    </nav>
  );
}
