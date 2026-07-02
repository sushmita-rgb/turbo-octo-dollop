import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Check, X, Mail, Users } from 'lucide-react';
import Navbar from '../components/Navbar';

const InvitesPage = () => {
  const [invites, setInvites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState(null);

  const fetchInvites = async () => {
    try {
      const response = await fetch('/api/v1/invites/all');
      if (response.ok) {
        const data = await response.json();
        setInvites(data.data || []);
      }
    } catch (error) {
      console.error('Failed to fetch invites:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvites();
  }, []);

  const handleAccept = async (inviteId) => {
    setActionId(inviteId);
    try {
      const response = await fetch(`/api/v1/invites/accept/${inviteId}`, { method: 'POST' });
      const data = await response.json();
      if (response.ok) {
        setInvites((prev) => prev.filter((i) => i._id !== inviteId));
      } else {
        alert(`Error: ${data.message || 'Could not accept invite'}`);
      }
    } finally {
      setActionId(null);
    }
  };

  const handleReject = async (inviteId) => {
    setActionId(inviteId);
    try {
      const response = await fetch(`/api/v1/invites/reject/${inviteId}`, { method: 'POST' });
      const data = await response.json();
      if (response.ok) {
        setInvites((prev) => prev.filter((i) => i._id !== inviteId));
      } else {
        alert(`Error: ${data.message || 'Could not reject invite'}`);
      }
    } finally {
      setActionId(null);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white relative">
      <Navbar />
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none opacity-50"></div>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-20 relative z-10">
        <div className="mb-10">
          <div className="inline-block px-3 py-1 mb-4 border border-accent/50 text-accent text-[10px] font-mono uppercase tracking-widest bg-accent/5">
            [ Incoming Transmissions ]
          </div>
          <h1 className="text-4xl font-black uppercase tracking-tighter">Team Invites.</h1>
        </div>

        {loading ? (
          <div className="text-primary font-mono text-xs uppercase animate-pulse text-center py-20">Checking Inbox...</div>
        ) : invites.length === 0 ? (
          <div className="text-center space-y-4 py-20">
            <div className="w-16 h-16 border border-white/20 mx-auto flex items-center justify-center bg-white/5">
              <Mail className="w-8 h-8 text-gray-500" />
            </div>
            <h2 className="text-2xl font-black uppercase tracking-tighter text-gray-500">No Pending Invites.</h2>
            <Link to="/teams" className="text-primary text-xs font-mono hover:underline">Browse teams instead &rarr;</Link>
          </div>
        ) : (
          <div className="space-y-4">
            <AnimatePresence>
              {invites.map((invite) => (
                <motion.div
                  key={invite._id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -30 }}
                  className="bg-black/60 border border-white/10 brutal-border p-6 flex items-center justify-between gap-4 flex-wrap"
                >
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="w-12 h-12 rounded-full overflow-hidden bg-white/5 border border-white/10 flex-shrink-0">
                      {invite.sender?.avatar ? <img src={invite.sender.avatar} className="w-full h-full object-cover" /> : null}
                    </div>
                    <div className="min-w-0">
                      <div className="text-sm text-gray-300">
                        <span className="font-bold text-white">{invite.sender?.username}</span> invited you to join
                      </div>
                      <Link to={`/teams/${invite.team?._id}`} className="flex items-center gap-2 mt-1 text-primary hover:underline">
                        <Users className="w-3 h-3" />
                        <span className="text-sm font-bold uppercase tracking-tight">{invite.team?.name}</span>
                      </Link>
                    </div>
                  </div>
                  <div className="flex gap-3 flex-shrink-0">
                    <button
                      onClick={() => handleReject(invite._id)}
                      disabled={actionId === invite._id}
                      className="w-10 h-10 rounded-full border border-red-500/50 flex items-center justify-center text-red-500 hover:bg-red-500/10 transition-colors disabled:opacity-40"
                    >
                      <X className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleAccept(invite._id)}
                      disabled={actionId === invite._id}
                      className="w-10 h-10 rounded-full border border-primary flex items-center justify-center text-primary hover:bg-primary/10 transition-colors disabled:opacity-40"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </main>
    </div>
  );
};

export default InvitesPage;