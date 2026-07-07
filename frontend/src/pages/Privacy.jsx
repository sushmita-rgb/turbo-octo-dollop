import React from 'react';
import { ShieldAlert, Terminal, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';

const Privacy = () => {
  return (
    <div className="min-h-screen bg-black text-white relative">
      <Navbar />
      
      {/* Cyber Grid Background */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none opacity-60"></div>

      <main className="max-w-4xl mx-auto px-6 pt-32 pb-20 relative z-10">
        {/* Back Link */}
        <Link to="/" className="inline-flex items-center gap-2 text-gray-500 hover:text-primary transition-colors mb-8 font-mono text-xs uppercase">
          <ArrowLeft className="w-4 h-4" /> [ RETURN TO HOME ]
        </Link>

        {/* Page Title */}
        <div className="mb-12 border-b border-white/10 pb-8">
          <div className="inline-block px-3 py-1 mb-4 border border-accent/50 text-accent text-[10px] font-mono uppercase tracking-widest bg-accent/5">
            [ LEGAL PROTOCOL: SECTION 02 ]
          </div>
          <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter flex items-center gap-4">
            <ShieldAlert className="w-10 h-10 text-accent" /> PRIVACY POLICY
          </h1>
          <p className="text-gray-400 font-mono text-xs mt-3">
            Last System Update: July 2026
          </p>
        </div>

        {/* Content Sections */}
        <div className="space-y-10 font-mono text-sm leading-relaxed text-gray-300">
          
          <section className="space-y-4 border border-white/5 bg-white/5 p-6 rounded-2xl brutal-border">
            <h2 className="text-white text-lg font-black uppercase tracking-tight flex items-center gap-2">
              <Terminal className="w-4 h-4 text-accent" /> 1. Information Collected
            </h2>
            <p>
              HackMatch collects your identity profile inputs (username, email address, hashed passwords), platform configuration variables (developer roles, experience level, city/location, availability toggles), tech stack arrays, external profile links (GitHub, LinkedIn), and sent/received team invitations.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-white text-lg font-black uppercase tracking-tight">
              2. Data Processing & Matching Engine
            </h2>
            <p>
              Your tech stack lists, availability status, and role preferences are processed by our matching algorithms to score compatibility metrics and output candidate lists to other squad organizers.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-white text-lg font-black uppercase tracking-tight">
              3. Data Visibility & Access Control
            </h2>
            <p>
              Registered developers on the platform can view your profile data (full name, avatar, bio, tech stack, and social media handles) to coordinate team formation. We do not sell, rent, or lease your profile coordinates to advertising companies or third-party brokers.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-white text-lg font-black uppercase tracking-tight">
              4. Cookies and Credentials
            </h2>
            <p>
              We use lightweight web authentication tokens (cookies and JWT payloads) to keep your terminal session active. These tokens are saved locally in your browser cache and secure database records.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-white text-lg font-black uppercase tracking-tight">
              5. Profile Erasure (Right to Disconnect)
            </h2>
            <p>
              You retain full control over your hacker node. You may modify or scrub your profile details from the platform settings. If you wish to delete your account record permanently from our database, please contact support or delete your profile via your configuration panel.
            </p>
          </section>

          <section className="space-y-4 border-t border-white/10 pt-8 text-center text-xs text-gray-500">
            For data inquiries or protection concerns, reach out directly to the HackMatch privacy operations branch.
          </section>

        </div>
      </main>
    </div>
  );
};

export default Privacy;
