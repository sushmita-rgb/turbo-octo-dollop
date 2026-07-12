import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Heart, MessageSquare, Search, Plus, Code2, ExternalLink, ArrowRight, Bookmark } from 'lucide-react';
import Navbar from '../../../components/Navbar';

const ShowcasePage = () => {
  const [showcases, setShowcases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [techStack, setTechStack] = useState('');
  const [sortBy, setSortBy] = useState('');

  const fetchShowcases = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      if (techStack) params.set('techStack', techStack);
      if (sortBy) params.set('sortBy', sortBy);

      const response = await fetch(`/api/v1/showcases?${params.toString()}`);
      if (response.ok) {
        const data = await response.json();
        setShowcases(data.data || []);
      } else {
        setShowcases([]);
      }
    } catch (error) {
      console.error('Failed to fetch project showcases:', error);
      setShowcases([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchShowcases();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchShowcases();
  };

  return (
    <div className="min-h-screen bg-black text-white relative">
      <Navbar />
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none opacity-50"></div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-20 relative z-10">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12">
          <div>
            <div className="inline-block px-3 py-1 mb-4 border border-primary/50 text-primary text-[10px] font-mono uppercase tracking-widest bg-primary/5">
              [ Gallery: Completed Builds ]
            </div>
            <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter">Project Showcase.</h1>
          </div>
          <Link to="/showcase/create">
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="bg-accent text-white px-6 py-4 font-bold uppercase tracking-wider text-sm flex items-center gap-3 border border-accent shadow-[4px_4px_0_#CCFF00] hover:shadow-[6px_6px_0_#CCFF00] transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" /> Publish Project
            </motion.button>
          </Link>
        </div>

        {/* Filters */}
        <form onSubmit={handleSearchSubmit} className="flex flex-wrap gap-3 mb-12">
          <div className="flex-1 min-w-[200px] relative">
            <Search className="w-4 h-4 text-gray-500 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by title or description"
              className="w-full bg-black border border-white/10 pl-11 pr-4 py-3 text-sm text-white focus:outline-none focus:border-primary brutal-border placeholder:text-white/20"
            />
          </div>
          <input
            type="text"
            value={techStack}
            onChange={(e) => setTechStack(e.target.value)}
            placeholder="Tech Stack (e.g. react, node)"
            className="flex-1 min-w-[160px] bg-black border border-white/10 px-4 py-3 text-sm text-white focus:outline-none focus:border-primary brutal-border placeholder:text-white/20"
          />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="bg-black border border-white/10 px-4 py-3 text-sm text-white focus:outline-none focus:border-primary brutal-border appearance-none cursor-pointer"
          >
            <option value="">Sort By (Default)</option>
            <option value="likes">Most Liked</option>
            <option value="comments">Most Commented</option>
          </select>
          <button type="submit" className="bg-white/5 border border-white/10 hover:border-primary text-white px-6 py-3 text-xs font-mono uppercase tracking-widest transition-colors cursor-pointer">
            Filter
          </button>
        </form>

        {loading ? (
          <div className="text-primary font-mono text-xs uppercase animate-pulse text-center py-20">Retrieving Project Grid...</div>
        ) : showcases.length === 0 ? (
          <div className="text-center space-y-4 py-20">
            <div className="w-16 h-16 border border-white/20 mx-auto flex items-center justify-center bg-white/5">
              <Code2 className="w-8 h-8 text-gray-500" />
            </div>
            <h2 className="text-2xl font-black uppercase tracking-tighter text-gray-500">No Projects Published Yet.</h2>
            <p className="text-xs font-mono text-gray-600">Be the first to publish a project from your team!</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-3 gap-6">
            {showcases.map((project, index) => (
              <motion.div
                key={project._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05, duration: 0.4 }}
                className="bg-black/60 border border-white/10 p-6 brutal-border hover:border-primary/50 transition-all group flex flex-col relative"
              >
                {/* Showcase Thumbnail or Banner placeholder */}
                <div className="aspect-video w-full mb-6 bg-secondary border border-white/5 overflow-hidden relative">
                  {project.screenshots && project.screenshots.length > 0 ? (
                    <img 
                      src={project.screenshots[0]} 
                      alt={project.title} 
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-gray-700 font-mono text-[10px]">
                      <Code2 className="w-10 h-10 mb-2 opacity-50" />
                      NO_PREVIEW_AVAILABLE
                    </div>
                  )}
                  {(project.team?.hackathonName || project.isSolo) && (
                    <div className="absolute top-2 left-2 bg-black/80 border border-white/10 px-2 py-0.5 text-[8px] font-mono text-primary uppercase">
                      {project.team?.hackathonName || 'Solo Project'}
                    </div>
                  )}
                </div>

                <div className="flex justify-between items-start mb-2">
                  <Link to={`/showcase/${project._id}`} className="text-xl font-bold text-white group-hover:text-primary transition-colors uppercase tracking-tight line-clamp-1">
                    {project.title}
                  </Link>
                </div>

                <div className="text-[10px] text-gray-400 font-mono mb-4 uppercase">
                  {project.isSolo ? (
                    <span>Solo Project by <span className="text-primary">@{project.creator?.username}</span></span>
                  ) : (
                    <span>By team: <span className="text-accent">{project.team?.name || 'Unknown Team'}</span></span>
                  )}
                </div>

                <p className="text-xs text-gray-500 font-mono mb-6 line-clamp-3 flex-1">{project.description}</p>

                {project.techStack?.length > 0 && (
                  <div className="mb-6 flex flex-wrap gap-1.5">
                    {project.techStack.slice(0, 4).map((tech) => (
                      <span key={tech} className="text-[9px] px-2 py-0.5 bg-white/5 border border-white/10 text-gray-400 font-mono uppercase">
                        {tech}
                      </span>
                    ))}
                    {project.techStack.length > 4 && (
                      <span className="text-[9px] px-2 py-0.5 bg-white/5 border border-white/10 text-gray-500 font-mono">
                        +{project.techStack.length - 4} MORE
                      </span>
                    )}
                  </div>
                )}

                <div className="flex justify-between items-center pt-4 border-t border-white/5 mt-auto">
                  <div className="flex items-center gap-4 text-gray-500 font-mono text-xs">
                    <div className="flex items-center gap-1">
                      <Heart className="w-3.5 h-3.5 text-accent" />
                      {project.likes?.length || 0}
                    </div>
                    <div className="flex items-center gap-1">
                      <MessageSquare className="w-3.5 h-3.5 text-primary" />
                      {project.comments?.length || 0}
                    </div>
                  </div>
                  
                  <Link to={`/showcase/${project._id}`}>
                    <button className="border border-white/10 hover:border-white/30 text-white px-3 py-1.5 text-[10px] font-mono uppercase tracking-widest transition-colors flex items-center gap-1.5 cursor-pointer">
                      Inspect <ArrowRight className="w-3 h-3" />
                    </button>
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default ShowcasePage;
