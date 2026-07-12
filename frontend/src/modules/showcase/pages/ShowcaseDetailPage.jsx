import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, MessageSquare, Bookmark, Share2, ExternalLink, Users, Send, ArrowLeft, Code2 } from 'lucide-react';
import Navbar from '../../../components/Navbar';
import { useAuth } from '../../auth/context/AuthContext';

const ShowcaseDetailPage = () => {
  const { id } = useParams();
  const { user } = useAuth();
  
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  
  const [saved, setSaved] = useState(false);
  
  const [commentText, setCommentText] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);
  
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [copied, setCopied] = useState(false);

  const fetchProjectDetails = async () => {
    try {
      const response = await fetch(`/api/v1/showcases/${id}`);
      if (response.ok) {
        const data = await response.json();
        const proj = data.data;
        setProject(proj);
        
        // set interactive state
        if (user) {
          setLiked(proj.likes?.includes(user._id));
          setSaved(proj.saves?.includes(user._id));
        }
        setLikeCount(proj.likes?.length || 0);
      }
    } catch (error) {
      console.error('Failed to fetch project details:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjectDetails();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, user]);

  const handleLike = async () => {
    if (!user) {
      alert('Please log in to like this project.');
      return;
    }
    try {
      const response = await fetch(`/api/v1/showcases/${id}/like`, { method: 'POST' });
      if (response.ok) {
        const data = await response.json();
        setLiked(data.data.liked);
        setLikeCount(data.data.count);
      }
    } catch (error) {
      console.error('Like failed:', error);
    }
  };

  const handleSave = async () => {
    if (!user) {
      alert('Please log in to bookmark this project.');
      return;
    }
    try {
      const response = await fetch(`/api/v1/showcases/${id}/save`, { method: 'POST' });
      if (response.ok) {
        const data = await response.json();
        setSaved(data.data.saved);
      }
    } catch (error) {
      console.error('Save failed:', error);
    }
  };

  const handleShare = async () => {
    try {
      // copy url to clipboard
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      
      // record share count
      await fetch(`/api/v1/showcases/${id}/share`, { method: 'POST' });
    } catch (error) {
      console.error('Share operation failed:', error);
    }
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      alert('Please log in to post comments.');
      return;
    }
    if (!commentText.trim()) return;

    setSubmittingComment(true);
    try {
      const response = await fetch(`/api/v1/showcases/${id}/comment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: commentText })
      });
      if (response.ok) {
        const data = await response.json();
        setProject(prev => ({ ...prev, comments: data.data }));
        setCommentText('');
      } else {
        alert('Could not submit comment.');
      }
    } catch (error) {
      console.error('Comment failed:', error);
    } finally {
      setSubmittingComment(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center font-mono text-xs uppercase animate-pulse">
        Accessing Project Showcase Databanks...
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center font-mono space-y-4">
        <div className="text-red-500 text-xl font-bold uppercase tracking-widest">[ Project Not Found ]</div>
        <Link to="/showcase" className="text-xs text-primary hover:underline">
          &lt; Return to Showcase Grid
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white relative">
      <Navbar />
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none opacity-50"></div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-20 relative z-10">
        <Link to="/showcase" className="inline-flex items-center gap-2 text-xs font-mono text-gray-400 hover:text-white mb-8 transition-colors">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Grid
        </Link>

        {/* Hero Section Header */}
        <div className="grid md:grid-cols-3 gap-8 mb-12">
          <div className="md:col-span-2 space-y-4">
            <div className="flex flex-wrap items-center gap-3">
              <span className="px-3 py-1 border border-accent/50 text-accent text-[10px] font-mono uppercase tracking-widest bg-accent/5">
                {project.isSolo ? 'SOLO HACKATHON BUILD' : (project.team?.hackathonName || 'HACKATHON BUILD')}
              </span>
              <span className="text-[10px] text-gray-500 font-mono">
                PUBLISHED {new Date(project.createdAt).toLocaleDateString()}
              </span>
            </div>

            <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter text-white">
              {project.title}
            </h1>

            <div className="text-xs font-mono text-gray-400 uppercase">
              {project.isSolo ? (
                <span>Solo Project by: <span className="text-primary">@{project.creator?.username}</span></span>
              ) : (
                <span>Assembled by Team: <span className="text-primary">{project.team?.name || 'Unknown Team'}</span></span>
              )}
            </div>
          </div>

          {/* Interactive controls */}
          <div className="flex flex-wrap md:flex-col gap-3 justify-end md:justify-start pt-4 md:pt-0">
            <div className="flex gap-3 w-full">
              {/* Like Button */}
              <button
                onClick={handleLike}
                className={`flex-1 py-3 px-4 border text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  liked 
                    ? 'bg-accent/10 border-accent text-accent' 
                    : 'bg-black border-white/10 hover:border-accent/50 text-gray-400'
                }`}
              >
                <Heart className={`w-4 h-4 ${liked ? 'fill-accent' : ''}`} />
                Like ({likeCount})
              </button>

              {/* Save Button */}
              <button
                onClick={handleSave}
                className={`flex-1 py-3 px-4 border text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  saved 
                    ? 'bg-primary/10 border-primary text-primary' 
                    : 'bg-black border-white/10 hover:border-primary/50 text-gray-400'
                }`}
              >
                <Bookmark className={`w-4 h-4 ${saved ? 'fill-primary' : ''}`} />
                {saved ? 'Saved' : 'Save'}
              </button>
            </div>

            {/* Share Button */}
            <button
              onClick={handleShare}
              className="w-full bg-white/5 hover:bg-white/10 border border-white/10 text-white py-3 px-4 text-xs font-mono uppercase tracking-widest transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <Share2 className="w-4 h-4" />
              {copied ? 'Link Copied!' : 'Copy Project Link'}
            </button>
          </div>
        </div>

        {/* Gallery & Quick Info Details */}
        <div className="grid lg:grid-cols-3 gap-8 items-start mb-12">
          {/* Gallery - Large left */}
          <div className="lg:col-span-2 space-y-4">
            <div className="aspect-video w-full bg-secondary border border-white/10 overflow-hidden relative">
              {project.screenshots && project.screenshots.length > 0 ? (
                <img 
                  src={project.screenshots[activeImageIndex]} 
                  alt={`Screenshot ${activeImageIndex + 1}`}
                  className="w-full h-full object-contain"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-gray-700 font-mono text-xs">
                  <Code2 className="w-16 h-16 mb-4 opacity-50" />
                  NO_PREVIEWS_UPLOADED
                </div>
              )}
            </div>

            {/* Thumbnails */}
            {project.screenshots && project.screenshots.length > 1 && (
              <div className="grid grid-cols-5 gap-2">
                {project.screenshots.map((url, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImageIndex(idx)}
                    className={`aspect-video border bg-secondary overflow-hidden transition-all cursor-pointer ${
                      activeImageIndex === idx ? 'border-primary' : 'border-white/10 hover:border-white/30'
                    }`}
                  >
                    <img src={url} alt={`Thumb ${idx + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Details - Small right */}
          <div className="space-y-6 bg-secondary/50 border border-white/10 p-6 brutal-border">
            <h3 className="text-lg font-bold uppercase tracking-tight border-b border-white/5 pb-3">Project Assets</h3>
            
            {/* Action Links */}
            <div className="space-y-3">
              {project.demoLink ? (
                <a 
                  href={project.demoLink} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="flex items-center justify-between p-3 bg-black border border-white/10 hover:border-primary/50 text-xs font-mono uppercase tracking-wider transition-colors group"
                >
                  <span className="flex items-center gap-2 text-gray-300 group-hover:text-primary">
                    <ExternalLink className="w-4 h-4" /> Live Demo
                  </span>
                  <span className="text-gray-600 font-bold">&gt;&gt;</span>
                </a>
              ) : (
                <div className="p-3 bg-black/20 border border-white/5 text-xs font-mono uppercase text-gray-600 flex items-center gap-2">
                  <ExternalLink className="w-4 h-4 opacity-30" /> No Live Demo
                </div>
              )}

              {project.githubLink ? (
                <a 
                  href={project.githubLink} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="flex items-center justify-between p-3 bg-black border border-white/10 hover:border-accent/50 text-xs font-mono uppercase tracking-wider transition-colors group"
                >
                  <span className="flex items-center gap-2 text-gray-300 group-hover:text-accent">
                    <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor">
                      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                    </svg> Source Code
                  </span>
                  <span className="text-gray-600 font-bold">&gt;&gt;</span>
                </a>
              ) : (
                <div className="p-3 bg-black/20 border border-white/5 text-xs font-mono uppercase text-gray-600 flex items-center gap-2">
                  <svg viewBox="0 0 24 24" className="w-4 h-4 opacity-30" fill="currentColor">
                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                  </svg> Private Repository
                </div>
              )}
            </div>

            {/* Tech Stack */}
            <div>
              <div className="text-[10px] font-mono text-gray-500 uppercase mb-2">Tech Stack:</div>
              <div className="flex flex-wrap gap-1.5">
                {project.techStack?.map((tech) => (
                  <span key={tech} className="text-[9px] px-2.5 py-1 bg-white/5 border border-white/10 text-gray-300 font-mono uppercase">
                    {tech}
                  </span>
                ))}
              </div>
            </div>

            {/* Team Members */}
            <div>
              <div className="text-[10px] font-mono text-gray-500 uppercase mb-3">Project Builders:</div>
              <div className="space-y-3">
                {project.teamMembers?.map((member) => (
                  <div key={member._id} className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full overflow-hidden bg-primary/20 border border-white/10 flex items-center justify-center text-xs font-bold text-primary flex-shrink-0">
                      {member.avatar ? (
                        <img src={member.avatar} alt={member.username} className="w-full h-full object-cover" />
                      ) : (
                        member.username.charAt(0).toUpperCase()
                      )}
                    </div>
                    <div className="font-mono text-xs">
                      <div className="text-white hover:text-primary transition-colors">{member.username}</div>
                      <div className="text-[9px] text-gray-600 uppercase">{member.team_role || 'Contributor'}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Detailed Description */}
        <div className="grid lg:grid-cols-3 gap-8 mb-12">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-black border border-white/10 p-8 brutal-border">
              <h2 className="text-xl font-bold uppercase tracking-wider mb-6 border-b border-white/5 pb-4">Project Overview</h2>
              <p className="text-sm text-gray-400 font-mono whitespace-pre-wrap leading-relaxed">
                {project.description}
              </p>
            </div>

            {/* Comments Section */}
            <div className="bg-black border border-white/10 p-8 brutal-border space-y-8">
              <h2 className="text-xl font-bold uppercase tracking-wider border-b border-white/5 pb-4 flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-primary" /> Comments ({project.comments?.length || 0})
              </h2>

              {/* Comment Input */}
              {user ? (
                <form onSubmit={handleCommentSubmit} className="flex gap-3 items-start">
                  <div className="w-8 h-8 rounded-full overflow-hidden bg-primary/20 border border-white/10 flex items-center justify-center text-xs font-bold text-primary flex-shrink-0">
                    {user.avatar ? (
                      <img src={user.avatar} alt={user.username} className="w-full h-full object-cover" />
                    ) : (
                      user.username.charAt(0).toUpperCase()
                    )}
                  </div>
                  <div className="flex-1 space-y-2">
                    <textarea
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      placeholder="Transmission text..."
                      rows={3}
                      className="w-full bg-black border border-white/10 p-3 text-sm text-white focus:outline-none focus:border-primary brutal-border placeholder:text-white/10"
                    />
                    <button
                      type="submit"
                      disabled={submittingComment || !commentText.trim()}
                      className="bg-primary text-black px-4 py-2 text-xs font-bold uppercase tracking-widest flex items-center gap-2 border border-primary hover:bg-black hover:text-primary transition-all disabled:opacity-50 cursor-pointer"
                    >
                      Transmit <Send className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </form>
              ) : (
                <div className="text-center py-4 bg-white/5 border border-white/5 text-xs font-mono text-gray-500 uppercase">
                  Please <Link to="/login" className="text-primary hover:underline">log in</Link> to post comments.
                </div>
              )}

              {/* Comments List */}
              <div className="space-y-6">
                {project.comments && project.comments.length > 0 ? (
                  project.comments.map((comment) => (
                    <div key={comment._id} className="flex gap-3 items-start">
                      <div className="w-8 h-8 rounded-full overflow-hidden bg-primary/20 border border-white/10 flex items-center justify-center text-xs font-bold text-primary flex-shrink-0">
                        {comment.user?.avatar ? (
                          <img src={comment.user.avatar} alt={comment.user.username} className="w-full h-full object-cover" />
                        ) : (
                          comment.user?.username?.charAt(0).toUpperCase() || 'U'
                        )}
                      </div>
                      <div className="flex-1 bg-secondary/30 border border-white/5 p-4 brutal-border">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-xs font-bold text-primary font-mono">{comment.user?.username || 'Deleted User'}</span>
                          <span className="text-[9px] text-gray-600 font-mono">
                            {new Date(comment.createdAt).toLocaleString()}
                          </span>
                        </div>
                        <p className="text-xs text-gray-300 font-mono leading-relaxed">{comment.text}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-6 text-xs font-mono text-gray-600 uppercase">
                    No comments transmitted yet.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ShowcaseDetailPage;
