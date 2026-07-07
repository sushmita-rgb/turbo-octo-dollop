import React from 'react';
import { Shield, Terminal, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';

const Terms = () => {
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
            [ LEGAL PROTOCOL: SECTION 01 ]
          </div>
          <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter flex items-center gap-4">
            <Shield className="w-10 h-10 text-primary" /> TERMS & CONDITIONS
          </h1>
          <p className="text-gray-400 font-mono text-xs mt-3">
            Last System Update: July 2026
          </p>
        </div>

        {/* Content Sections */}
        <div className="space-y-10 font-mono text-sm leading-relaxed text-gray-300">
          
          <section className="space-y-4 border border-white/5 bg-white/5 p-6 rounded-2xl brutal-border">
            <h2 className="text-white text-lg font-black uppercase tracking-tight flex items-center gap-2">
              <Terminal className="w-4 h-4 text-primary" /> 1. Acceptance of Terms
            </h2>
            <p>
              By accessing the HackMatch terminal and registering a developer identity, you acknowledge, accept, and agree to be bound by these Terms and Conditions. If you do not agree, disconnect your terminal immediately.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-white text-lg font-black uppercase tracking-tight">
              2. Developer Identity & Security
            </h2>
            <p>
              Your developer email, username, and login access keys are your security credentials. You are entirely responsible for maintaining the confidentiality of your session key and account profile data. HackMatch will not be liable for any losses caused by unauthorized access to your identity node.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-white text-lg font-black uppercase tracking-tight">
              3. System Code of Conduct
            </h2>
            <p>
              HackMatch is built to facilitate collaboration. Users must not:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-xs text-gray-400">
              <li>Deploy automated scraping agents, bots, or scripts against the network matching API.</li>
              <li>Spam team invites, matching requests, or send malicious communication to other users.</li>
              <li>Impersonate developers or organizations, or display inaccurate tech stacks, certifications, or projects.</li>
              <li>Distribute toxic, harassing, or illegal content within team profile boards.</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-white text-lg font-black uppercase tracking-tight">
              4. User-Generated Content
            </h2>
            <p>
              Developers retain ownership of all original data, code links, biographies, and team details submitted. However, by uploading content, you grant HackMatch a non-exclusive, worldwide, royalty-free license to parse, index, search, and display your data strictly to execute the matching engine algorithms.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-white text-lg font-black uppercase tracking-tight">
              5. Service Disclaimers
            </h2>
            <p>
              HackMatch matching algorithms are provided "as-is." HackMatch makes no guarantees regarding the ultimate success, coordination, or performance of matched teams at any external hackathons. Disagreement, prize distribution, and project ownership within teams must be settled independently by team members.
            </p>
          </section>

          <section className="space-y-4 border-t border-white/10 pt-8 text-center text-xs text-gray-500">
            For system inquiries or security disclosures, please open an issue on our GitHub repository or contact system administration.
          </section>

        </div>
      </main>
    </div>
  );
};

export default Terms;
