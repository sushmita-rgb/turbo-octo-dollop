import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Trophy, Globe, MapPin, Award, Search, ArrowRight, UserCheck, Flame, Compass } from 'lucide-react';
import Navbar from '../components/Navbar';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const Leaderboard = () => {
  const { user } = useAuth();
  const [boardType, setBoardType] = useState('global'); // global, country, college, activity, wins
  const [users, setUsers] = useState([]);
  const [userRank, setUserRank] = useState(null);
  const [countries, setCountries] = useState([]);
  const [colleges, setColleges] = useState([]);
  
  // Filters
  const [selectedCountry, setSelectedCountry] = useState('');
  const [selectedCollege, setSelectedCollege] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  // Pagination
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchLeaderboard = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        type: boardType,
        page,
        limit: 10,
        search: searchQuery
      });

      if (boardType === 'country' && selectedCountry) {
        params.append('country', selectedCountry);
      }
      if (boardType === 'college' && selectedCollege) {
        params.append('college', selectedCollege);
      }

      const response = await axios.get(`/api/v1/leaderboard?${params.toString()}`, {
        withCredentials: true
      });

      if (response.data?.success) {
        const { users, userRank, countries, colleges, pagination } = response.data.data;
        setUsers(users || []);
        setUserRank(userRank);
        setCountries(countries || []);
        setColleges(colleges || []);
        setTotalPages(pagination?.totalPages || 1);
      }
    } catch (error) {
      console.error('Failed to fetch leaderboard:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Reset page on type changes
    setPage(1);
  }, [boardType, selectedCountry, selectedCollege]);

  useEffect(() => {
    fetchLeaderboard();
  }, [boardType, selectedCountry, selectedCollege, searchQuery, page]);

  // Extract Top 3 for the Podium
  const podiumUsers = users.slice(0, 3);
  const tableUsers = users.slice(3);

  const renderValue = (u) => {
    if (boardType === 'activity') return `${u.monthlyActivity || 0} pts`;
    if (boardType === 'wins') return `${u.hackathonWins || 0} Wins`;
    return `${u.reputationScore || 0} RP`;
  };

  const getMetricLabel = () => {
    if (boardType === 'activity') return 'Activity score';
    if (boardType === 'wins') return 'Wins';
    return 'Reputation score';
  };

  return (
    <div className="min-h-screen bg-[#0B0F1A] text-slate-200 font-sans selection:bg-[#97ce23] selection:text-black relative overflow-hidden">
      <Navbar />

      {/* Retro Grid Background */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none opacity-40"></div>

      <main className="max-w-[1400px] mx-auto pt-32 pb-20 px-6 sm:px-10 relative z-10">
        
        {/* Header Block */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-12">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 mb-4 border border-[#97ce23]/30 text-[#97ce23] text-[10px] font-mono uppercase tracking-widest bg-[#97ce23]/5 rounded-full">
              <Trophy size={12} />
              <span>[ global cyber league ]</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter text-white">Leaderboards.</h1>
            <p className="text-slate-500 text-xs font-mono uppercase mt-1">Realtime telemetry of elite matchable developers</p>
          </div>

          {/* Current User Stats Banner */}
          {userRank && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex items-center gap-4 bg-gradient-to-r from-indigo-900/30 via-slate-900/40 to-indigo-950/20 border border-indigo-500/20 px-6 py-4 rounded-3xl"
            >
              <div className="w-10 h-10 rounded-full bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400 font-bold text-lg">
                #{userRank}
              </div>
              <div>
                <p className="text-[10px] font-mono uppercase text-indigo-400 tracking-wider">Your Position</p>
                <h4 className="text-sm font-black uppercase text-white tracking-tight">{user?.username}</h4>
                <p className="text-[10px] text-slate-500 font-mono uppercase">{renderValue(user || {})}</p>
              </div>
            </motion.div>
          )}
        </div>

        {/* Filter Toolbar */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-10 items-center">
          
          {/* Tab Selector */}
          <div className="lg:col-span-8 flex flex-wrap gap-2">
            {[
              { id: 'global', label: 'Global', icon: <Trophy size={14} /> },
              { id: 'country', label: 'By Country', icon: <Globe size={14} /> },
              { id: 'college', label: 'By College', icon: <Compass size={14} /> },
              { id: 'activity', label: 'Monthly Activity', icon: <Flame size={14} /> },
              { id: 'wins', label: 'Hack Wins', icon: <Award size={14} /> }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setBoardType(tab.id)}
                className={`flex items-center gap-2 px-5 py-3 rounded-full text-xs font-mono uppercase tracking-widest border transition-all duration-300 ${
                  boardType === tab.id
                    ? 'bg-[#97ce23] border-[#97ce23] text-black font-black shadow-[0_0_20px_rgba(151,206,35,0.3)]'
                    : 'bg-slate-900/40 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search bar */}
          <div className="lg:col-span-4 relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"><Search size={16} /></span>
            <input 
              type="text" 
              placeholder="Search user profile..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-900/40 border border-slate-800 rounded-full pl-11 pr-5 py-3 text-xs focus:border-[#97ce23] outline-none text-white font-mono placeholder:text-slate-600"
            />
          </div>
        </div>

        {/* Sub-Filters for Country and College */}
        <AnimatePresence>
          {(boardType === 'country' || boardType === 'college') && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex flex-wrap gap-4 mb-10 p-6 bg-slate-900/20 border border-slate-800 rounded-3xl"
            >
              {boardType === 'country' && (
                <div className="flex flex-col gap-2">
                  <label className="text-[9px] font-mono uppercase tracking-widest text-slate-500">Filter Country</label>
                  <select 
                    value={selectedCountry} 
                    onChange={(e) => setSelectedCountry(e.target.value)}
                    className="bg-black border border-slate-800 rounded-xl px-4 py-2 text-xs font-mono text-white outline-none focus:border-[#97ce23]"
                  >
                    <option value="">-- Select Country --</option>
                    {countries.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              )}
              {boardType === 'college' && (
                <div className="flex flex-col gap-2">
                  <label className="text-[9px] font-mono uppercase tracking-widest text-slate-500">Filter College</label>
                  <select 
                    value={selectedCollege} 
                    onChange={(e) => setSelectedCollege(e.target.value)}
                    className="bg-black border border-slate-800 rounded-xl px-4 py-2 text-xs font-mono text-white outline-none focus:border-[#97ce23]"
                  >
                    <option value="">-- Select College --</option>
                    {colleges.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Loader */}
        {loading && users.length === 0 ? (
          <div className="py-24 text-center font-mono text-xs uppercase tracking-widest text-slate-500 animate-pulse">
            Querying rankings ledger...
          </div>
        ) : users.length === 0 ? (
          <div className="py-24 text-center">
            <h3 className="text-xl font-bold uppercase text-slate-600 tracking-wider">No Agents Found</h3>
            <p className="text-xs text-slate-500 mt-2 font-mono">Try adjusting your filters or search query.</p>
          </div>
        ) : (
          <div className="space-y-12">

            {/* PODIUM OF TOP 3 */}
            {page === 1 && searchQuery === '' && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-end max-w-5xl mx-auto pt-6">
                
                {/* 2nd PLACE */}
                {podiumUsers[1] && (
                  <motion.div 
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="flex flex-col items-center bg-gradient-to-t from-slate-400/5 to-slate-400/10 border border-slate-400/20 rounded-[2.5rem] p-8 shadow-2xl relative order-2 md:order-1"
                  >
                    <div className="absolute top-4 left-4 w-8 h-8 rounded-full bg-slate-400/10 border border-slate-400/30 flex items-center justify-center text-slate-400 font-black text-sm">2</div>
                    <div className="w-24 h-24 rounded-full border-4 border-slate-400 p-1 mb-4 overflow-hidden relative shadow-[0_0_30px_rgba(148,163,184,0.15)]">
                      {podiumUsers[1].avatar ? <img src={podiumUsers[1].avatar} className="w-full h-full object-cover rounded-full" /> : <div className="w-full h-full bg-slate-800 rounded-full flex items-center justify-center font-bold text-2xl">{podiumUsers[1].username[0]}</div>}
                    </div>
                    <h3 className="text-lg font-black text-white uppercase tracking-tight">{podiumUsers[1].fullName || podiumUsers[1].username}</h3>
                    <p className="text-[10px] text-slate-500 font-mono uppercase mt-1">@{podiumUsers[1].username}</p>
                    <p className="text-xs text-slate-400 font-mono mt-3 uppercase tracking-widest">{podiumUsers[1].team_role}</p>
                    <div className="mt-6 px-6 py-2 bg-slate-400/20 rounded-full text-slate-300 font-black text-sm font-mono tracking-wider">{renderValue(podiumUsers[1])}</div>
                  </motion.div>
                )}

                {/* 1st PLACE */}
                {podiumUsers[0] && (
                  <motion.div 
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col items-center bg-gradient-to-t from-yellow-500/5 to-yellow-500/15 border-2 border-yellow-500/50 rounded-[3rem] p-10 shadow-[0_0_50px_rgba(234,179,8,0.15)] relative order-1 md:order-2 md:-translate-y-6"
                  >
                    <div className="absolute top-4 left-4 w-10 h-10 rounded-full bg-yellow-500/10 border border-yellow-500/40 flex items-center justify-center text-yellow-400 font-black text-lg">1</div>
                    <div className="w-28 h-28 rounded-full border-4 border-yellow-500 p-1 mb-4 overflow-hidden relative shadow-[0_0_40px_rgba(234,179,8,0.3)]">
                      {podiumUsers[0].avatar ? <img src={podiumUsers[0].avatar} className="w-full h-full object-cover rounded-full" /> : <div className="w-full h-full bg-slate-800 rounded-full flex items-center justify-center font-bold text-3xl">{podiumUsers[0].username[0]}</div>}
                    </div>
                    <h3 className="text-xl font-black text-white uppercase tracking-tight text-center">{podiumUsers[0].fullName || podiumUsers[0].username}</h3>
                    <p className="text-[10px] text-slate-400 font-mono uppercase mt-1">@{podiumUsers[0].username}</p>
                    <p className="text-xs text-[#97ce23] font-mono mt-3 uppercase tracking-widest">{podiumUsers[0].team_role}</p>
                    <div className="mt-6 px-8 py-2.5 bg-yellow-500 text-black rounded-full font-black text-sm font-mono tracking-wider shadow-[0_0_20px_rgba(234,179,8,0.4)]">{renderValue(podiumUsers[0])}</div>
                  </motion.div>
                )}

                {/* 3rd PLACE */}
                {podiumUsers[2] && (
                  <motion.div 
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="flex flex-col items-center bg-gradient-to-t from-amber-700/5 to-amber-700/10 border border-amber-700/20 rounded-[2.5rem] p-8 shadow-2xl relative order-3"
                  >
                    <div className="absolute top-4 left-4 w-8 h-8 rounded-full bg-amber-700/10 border border-amber-700/30 flex items-center justify-center text-amber-500 font-black text-sm">3</div>
                    <div className="w-24 h-24 rounded-full border-4 border-amber-700 p-1 mb-4 overflow-hidden relative shadow-[0_0_30px_rgba(180,83,9,0.15)]">
                      {podiumUsers[2].avatar ? <img src={podiumUsers[2].avatar} className="w-full h-full object-cover rounded-full" /> : <div className="w-full h-full bg-slate-800 rounded-full flex items-center justify-center font-bold text-2xl">{podiumUsers[2].username[0]}</div>}
                    </div>
                    <h3 className="text-lg font-black text-white uppercase tracking-tight">{podiumUsers[2].fullName || podiumUsers[2].username}</h3>
                    <p className="text-[10px] text-slate-500 font-mono uppercase mt-1">@{podiumUsers[2].username}</p>
                    <p className="text-xs text-slate-400 font-mono mt-3 uppercase tracking-widest">{podiumUsers[2].team_role}</p>
                    <div className="mt-6 px-6 py-2 bg-amber-700/20 rounded-full text-amber-500 font-black text-sm font-mono tracking-wider">{renderValue(podiumUsers[2])}</div>
                  </motion.div>
                )}
              </div>
            )}

            {/* TABULAR REMAINING LIST */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-slate-900/40 backdrop-blur-xl border border-slate-800 rounded-[2rem] overflow-hidden"
            >
              <div className="overflow-x-auto">
                <table className="w-full min-w-[700px] border-collapse font-mono text-xs">
                  <thead>
                    <tr className="border-b border-slate-800 bg-slate-950/20 text-slate-500 uppercase tracking-widest text-[9px]">
                      <th className="py-5 px-6 text-left w-20">Rank</th>
                      <th className="py-5 px-6 text-left">Agent Details</th>
                      <th className="py-5 px-6 text-left">College / Location</th>
                      <th className="py-5 px-6 text-right">{getMetricLabel()}</th>
                      <th className="py-5 px-6 text-right w-20">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {/* Render table users */}
                    {(page === 1 && searchQuery === '' ? tableUsers : users).map((u, idx) => {
                      const absoluteRank = (page - 1) * 10 + (page === 1 && searchQuery === '' ? idx + 4 : idx + 1);
                      return (
                        <tr key={u._id} className="border-b border-slate-800/50 hover:bg-slate-800/10 transition-colors group">
                          <td className="py-5 px-6 font-bold text-slate-400">
                            #{absoluteRank}
                          </td>
                          <td className="py-5 px-6">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full overflow-hidden bg-slate-800 border border-slate-700">
                                {u.avatar && <img src={u.avatar} className="w-full h-full object-cover" />}
                              </div>
                              <div>
                                <span className="font-bold text-white group-hover:text-[#97ce23] transition-colors">{u.fullName || u.username}</span>
                                <span className="block text-[9px] text-slate-500 mt-0.5">@{u.username} | {u.team_role || 'Freelancer'}</span>
                              </div>
                            </div>
                          </td>
                          <td className="py-5 px-6">
                            <span className="text-slate-300 block">{u.college || "N/A"}</span>
                            <span className="text-[9px] text-slate-500 flex items-center gap-1 uppercase tracking-widest mt-1">
                              <MapPin size={8} /> {u.location || "Remote"} {u.country ? `, ${u.country}` : ''}
                            </span>
                          </td>
                          <td className="py-5 px-6 text-right font-bold text-[#97ce23] text-sm">
                            {renderValue(u)}
                          </td>
                          <td className="py-5 px-6 text-right">
                            <Link to={`/profile`} className="p-2 bg-slate-800/50 border border-slate-800 rounded-lg hover:border-[#97ce23]/40 text-slate-400 hover:text-white inline-flex items-center justify-center transition-all">
                              <ArrowRight size={12} />
                            </Link>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* PAGINATION BAR */}
              {totalPages > 1 && (
                <div className="flex justify-between items-center px-8 py-5 border-t border-slate-800 bg-slate-950/10">
                  <button 
                    disabled={page === 1}
                    onClick={() => setPage(prev => Math.max(prev - 1, 1))}
                    className="px-4 py-2 border border-slate-800 text-slate-400 hover:text-white disabled:opacity-30 disabled:pointer-events-none rounded-xl text-[10px] uppercase font-mono tracking-widest transition-all"
                  >
                    &larr; Prev
                  </button>
                  <span className="text-[10px] text-slate-500 font-mono">Page {page} of {totalPages}</span>
                  <button 
                    disabled={page === totalPages}
                    onClick={() => setPage(prev => Math.min(prev + 1, totalPages))}
                    className="px-4 py-2 border border-slate-800 text-slate-400 hover:text-white disabled:opacity-30 disabled:pointer-events-none rounded-xl text-[10px] uppercase font-mono tracking-widest transition-all"
                  >
                    Next &rarr;
                  </button>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Leaderboard;
