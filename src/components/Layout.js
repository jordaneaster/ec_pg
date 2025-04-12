import React from 'react';
import Head from 'next/head';
import Nav from './Nav';
import Footer from './Footer';

export default function Layout({ children, title = 'NIGHTLIFE - Music & Nightclub' }) {
  return (
    <>
      <Head>
        <title>{title}</title>
        <meta name="description" content="Experience the best nightlife, music, and entertainment" />
        <link rel="icon" href="/favicon.ico" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </Head>
      <div className="site-wrapper">
        <Nav />
        <main className="main-content">{children}</main>
        <Footer />
      </div>
    </>
  );
}
