import React, { useState } from 'react';
import { Mail, ArrowLeft, HelpCircle, Check, Copy } from 'lucide-react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';

const Contact = () => {
  const [copied, setCopied] = useState(false);
  const emailAddress = "hackmach@gmail.com";

  const handleCopy = () => {
    navigator.clipboard.writeText(emailAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const supportReasons = [
    {
      q: "Access & Login Recovery?",
      a: "If you have lost your Access Key or cannot authenticate into your developer profile node."
    },
    {
      q: "Reporting Code of Conduct Violations?",
      a: "If another developer is spamming invites, using toxic language, or falsifying their tech stack/identity."
    },
    {
      q: "Team Disputes & Hackathon Coordination?",
      a: "If you need assistance resolving platform issues related to team size limits or invite routing errors."
    },
    {
      q: "Feature Suggestions & Core Feedback?",
      a: "If you want to suggest updates to the matching algorithms or recommend new tech tags."
    }
  ];

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
          <div className="inline-block px-3 py-1 mb-4 border border-primary/50 text-primary text-[10px] font-mono uppercase tracking-widest bg-primary/5">
            [ COMMUNICATIONS PROTOCOL ]
          </div>
          <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter flex items-center gap-4">
            <Mail className="w-10 h-10 text-primary" /> SYSTEM SUPPORT
          </h1>
          <p className="text-gray-400 font-mono text-xs mt-3">
            Establish a secure connection with HackMatch administration.
          </p>
        </div>

        {/* Contact Method Card */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          <div className="md:col-span-1 border border-primary/30 bg-primary/5 p-6 rounded-2xl brutal-border flex flex-col justify-between h-56">
            <div>
              <span className="text-[9px] font-mono text-primary uppercase tracking-widest">[ DIRECT EMAIL ]</span>
              <h3 className="text-lg font-mono font-bold mt-2 mb-1">Send Transmission</h3>
              <p className="text-xs text-gray-400 leading-relaxed font-mono">Our core team usually responds within 24 hours.</p>
            </div>
            
            <div className="space-y-2">
              <a 
                href={`mailto:${emailAddress}`}
                className="w-full text-center bg-primary hover:bg-primary/80 text-black font-mono font-bold uppercase text-xs tracking-wider py-2.5 flex items-center justify-center gap-2 transition-colors brutal-border"
              >
                <Mail className="w-4 h-4" /> Email Us
              </a>
              <button 
                onClick={handleCopy}
                className="w-full text-center bg-white/5 border border-white/10 hover:border-white text-white font-mono font-bold uppercase text-[10px] tracking-wider py-2 flex items-center justify-center gap-2 transition-all"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-green-400" /> Copied!
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" /> Copy Email Address
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Common Support Reasons */}
          <div className="md:col-span-2 border border-white/10 bg-black/40 p-6 rounded-2xl brutal-border">
            <h3 className="text-md font-bold font-mono uppercase tracking-wider text-white mb-6 flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-accent" /> Why Connect With Support?
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {supportReasons.map((reason, index) => (
                <div key={index} className="space-y-2">
                  <h4 className="text-xs font-mono font-bold text-accent uppercase tracking-tight">
                    {reason.q}
                  </h4>
                  <p className="text-[11px] font-mono text-gray-400 leading-relaxed">
                    {reason.a}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Alternate Contact Coordinates */}
        <div className="border border-white/5 bg-white/5 p-6 rounded-2xl brutal-border text-center">
          <p className="text-xs font-mono text-gray-500">
            For source-code issues or to submit pull requests, please visit our official repository coordinates.
          </p>
        </div>

      </main>
    </div>
  );
};

export default Contact;
