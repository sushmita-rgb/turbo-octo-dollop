import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import { Code2, ArrowRight, Upload, X, Plus } from 'lucide-react';
import Navbar from '../../../components/Navbar';

const CreateShowcasePage = () => {
  const navigate = useNavigate();
  const [loadingTeams, setLoadingTeams] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [myTeams, setMyTeams] = useState([]);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [techInput, setTechInput] = useState('');
  const [projectType, setProjectType] = useState('team'); // 'team' or 'solo'
  
  const [formData, setFormData] = useState({
    team: '',
    title: '',
    description: '',
    demoLink: '',
    githubLink: '',
    techStack: [],
    screenshots: []
  });

  const [previews, setPreviews] = useState([]);

  useEffect(() => {
    const fetchMyTeams = async () => {
      try {
        const response = await fetch('/api/v1/showcases/my-teams');
        if (response.ok) {
          const data = await response.json();
          const teams = data.data || [];
          setMyTeams(teams);
          if (teams.length > 0) {
            setFormData(prev => ({ ...prev, team: teams[0]._id }));
            setSelectedTeam(teams[0]);
            setProjectType('team');
          } else {
            setProjectType('solo');
          }
        }
      } catch (error) {
        console.error('Failed to load user teams:', error);
        setProjectType('solo');
      } finally {
        setLoadingTeams(false);
      }
    };
    fetchMyTeams();
  }, []);

  const handleTeamChange = (e) => {
    const teamId = e.target.value;
    setFormData(prev => ({ ...prev, team: teamId }));
    const found = myTeams.find(t => t._id === teamId);
    setSelectedTeam(found || null);
  };

  const updateForm = (field, value) => setFormData((prev) => ({ ...prev, [field]: value }));

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length + formData.screenshots.length > 5) {
      alert("You can upload a maximum of 5 screenshots.");
      return;
    }

    const updatedFiles = [...formData.screenshots, ...files];
    updateForm('screenshots', updatedFiles);

    // Create image previews
    const newPreviews = [];
    let loadedCount = 0;

    files.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        newPreviews.push(reader.result);
        loadedCount++;
        if (loadedCount === files.length) {
          setPreviews(prev => [...prev, ...newPreviews]);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const removeScreenshot = (index) => {
    const updatedFiles = formData.screenshots.filter((_, i) => i !== index);
    const updatedPreviews = previews.filter((_, i) => i !== index);
    updateForm('screenshots', updatedFiles);
    setPreviews(updatedPreviews);
  };

  const addTechTag = () => {
    const val = techInput.trim().toLowerCase();
    if (val && !formData.techStack.includes(val)) {
      updateForm('techStack', [...formData.techStack, val]);
    }
    setTechInput('');
  };

  const handleTechKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addTechTag();
    }
  };

  const removeTechTag = (tag) => {
    updateForm('techStack', formData.techStack.filter((t) => t !== tag));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (projectType === 'team' && !formData.team) {
      alert('Please select a team.');
      return;
    }
    if (!formData.title.trim()) {
      alert('Project title is required.');
      return;
    }
    if (!formData.description.trim()) {
      alert('Project description is required.');
      return;
    }

    setSubmitting(true);
    try {
      const data = new FormData();
      data.append('team', projectType === 'team' ? formData.team : '');
      data.append('isSolo', projectType === 'solo');
      data.append('title', formData.title);
      data.append('description', formData.description);
      data.append('demoLink', formData.demoLink);
      data.append('githubLink', formData.githubLink);
      data.append('techStack', JSON.stringify(formData.techStack));
      
      formData.screenshots.forEach((file) => {
        data.append('screenshots', file);
      });

      const response = await fetch('/api/v1/showcases', {
        method: 'POST',
        body: data
      });

      const result = await response.json();
      if (response.ok) {
        navigate(`/showcase/${result.data._id}`);
      } else {
        alert(`Error: ${result.message || 'Could not publish project showcase'}`);
      }
    } catch (error) {
      console.error('Project publication failed:', error);
      alert('An error occurred while publishing your project.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loadingTeams) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center font-mono text-xs uppercase animate-pulse">
        Establishing Secure Auth Session & Fetching Team Protocols...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white relative">
      <Navbar />
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none opacity-50"></div>

      <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-20 relative z-10">
        <div className="mb-8">
          <div className="inline-block px-3 py-1 mb-4 border border-accent/50 text-accent text-[10px] font-mono uppercase tracking-widest bg-accent/5">
            [ Project Upload Protocol ]
          </div>
          <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter mb-2">Publish Project.</h1>
          <p className="text-gray-400 font-mono text-xs">Share your team's completed masterpiece with the HackMatch community.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Project Type Toggle */}
          <div className="space-y-2">
            <label className="block text-xs font-mono uppercase tracking-widest text-gray-400">Project Type *</label>
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setProjectType('team')}
                disabled={myTeams.length === 0}
                className={`py-3 text-xs font-bold uppercase tracking-wider border brutal-border cursor-pointer transition-all ${
                  projectType === 'team'
                    ? 'bg-primary text-black border-primary font-bold shadow-[2px_2px_0_#FF00E5]'
                    : 'bg-secondary text-gray-400 border-white/10 hover:border-white/30 disabled:opacity-30 disabled:hover:border-white/10'
                }`}
              >
                Team Project
              </button>
              <button
                type="button"
                onClick={() => setProjectType('solo')}
                className={`py-3 text-xs font-bold uppercase tracking-wider border brutal-border cursor-pointer transition-all ${
                  projectType === 'solo'
                    ? 'bg-primary text-black border-primary font-bold shadow-[2px_2px_0_#FF00E5]'
                    : 'bg-secondary text-gray-400 border-white/10 hover:border-white/30'
                }`}
              >
                Solo Project
              </button>
            </div>
            {myTeams.length === 0 && (
              <p className="text-[10px] font-mono text-yellow-500 uppercase mt-1">
                * You are not in any active teams. Defaulting to Solo Project.
              </p>
            )}
          </div>

          {/* Team Selection */}
          {projectType === 'team' && (
            <div className="space-y-2">
              <label className="block text-xs font-mono uppercase tracking-widest text-gray-400">Select Project Team *</label>
              <select
                value={formData.team}
                onChange={handleTeamChange}
                className="w-full bg-black border border-white/10 px-4 py-3 text-sm text-white focus:outline-none focus:border-primary brutal-border cursor-pointer"
              >
                {myTeams.map((team) => (
                  <option key={team._id} value={team._id}>
                    {team.name} ({team.hackathonName || 'No Hackathon Specified'})
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Team Members List (Static Display based on Team selection) */}
          {projectType === 'team' && selectedTeam && (
            <div className="p-4 bg-secondary border border-white/5 space-y-2">
              <div className="text-[10px] font-mono text-gray-500 uppercase">Team Members Linked to Showcase:</div>
              <div className="flex flex-wrap gap-3">
                {selectedTeam.members?.map((member) => (
                  <div key={member._id} className="flex items-center gap-1.5 bg-black/40 border border-white/5 px-2.5 py-1 text-xs font-mono">
                    <div className="w-4 h-4 rounded-full overflow-hidden bg-primary/20 flex items-center justify-center text-[8px] text-primary">
                      {member.avatar ? (
                        <img src={member.avatar} alt={member.username} className="w-full h-full object-cover" />
                      ) : (
                        member.username.charAt(0).toUpperCase()
                      )}
                    </div>
                    <span className="text-gray-300">{member.username}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Title */}
            <div className="space-y-2">
              <label className="block text-xs font-mono uppercase tracking-widest text-gray-400">Project Title *</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => updateForm('title', e.target.value)}
                placeholder="e.g. De-CentraHack"
                maxLength={100}
                required
                className="w-full bg-black border border-white/10 px-4 py-3 text-sm text-white focus:outline-none focus:border-primary brutal-border placeholder:text-white/10"
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <label className="block text-xs font-mono uppercase tracking-widest text-gray-400">Project Description *</label>
              <textarea
                value={formData.description}
                onChange={(e) => updateForm('description', e.target.value)}
                placeholder="Explain the project goal, problem solved, architecture, and user flow..."
                rows={6}
                maxLength={2000}
                required
                className="w-full bg-black border border-white/10 p-4 text-sm text-white focus:outline-none focus:border-primary brutal-border placeholder:text-white/10"
              />
            </div>

            {/* Links Grid */}
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="block text-xs font-mono uppercase tracking-widest text-gray-400">Demo Link (Live URL)</label>
                <input
                  type="url"
                  value={formData.demoLink}
                  onChange={(e) => updateForm('demoLink', e.target.value)}
                  placeholder="https://myproject.vercel.app"
                  className="w-full bg-black border border-white/10 px-4 py-3 text-sm text-white focus:outline-none focus:border-primary brutal-border placeholder:text-white/10"
                />
              </div>
              <div className="space-y-2">
                <label className="block text-xs font-mono uppercase tracking-widest text-gray-400">GitHub Repository URL</label>
                <input
                  type="url"
                  value={formData.githubLink}
                  onChange={(e) => updateForm('githubLink', e.target.value)}
                  placeholder="https://github.com/myteam/myproject"
                  className="w-full bg-black border border-white/10 px-4 py-3 text-sm text-white focus:outline-none focus:border-primary brutal-border placeholder:text-white/10"
                />
              </div>
            </div>

            {/* Tech Stack */}
            <div className="space-y-2">
              <label className="block text-xs font-mono uppercase tracking-widest text-gray-400">Tech Stack (comma or enter to add)</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={techInput}
                  onChange={(e) => setTechInput(e.target.value)}
                  onKeyDown={handleTechKeyDown}
                  placeholder="e.g. react"
                  className="flex-1 bg-black border border-white/10 px-4 py-3 text-sm text-white focus:outline-none focus:border-primary brutal-border placeholder:text-white/10"
                />
                <button
                  type="button"
                  onClick={addTechTag}
                  className="bg-white/5 border border-white/10 hover:border-primary px-6 text-xs font-mono uppercase tracking-widest transition-colors cursor-pointer"
                >
                  Add
                </button>
              </div>
              
              {formData.techStack.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-2">
                  {formData.techStack.map((tech) => (
                    <span key={tech} className="flex items-center gap-1.5 text-xs px-2.5 py-1 bg-primary/10 border border-primary/30 text-primary font-mono uppercase">
                      {tech}
                      <button type="button" onClick={() => removeTechTag(tech)}>
                        <X className="w-3.5 h-3.5 hover:text-red-500 transition-colors cursor-pointer" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Screenshots Multi Upload */}
            <div className="space-y-2">
              <label className="block text-xs font-mono uppercase tracking-widest text-gray-400">Upload Screenshots (Max 5)</label>
              
              <div className="border-2 border-dashed border-white/10 hover:border-primary/50 transition-colors p-8 text-center brutal-border relative">
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleFileChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  disabled={formData.screenshots.length >= 5}
                />
                <Upload className="w-8 h-8 text-gray-500 mx-auto mb-2" />
                <span className="block text-xs font-mono text-gray-400">Drag files here or click to browse</span>
                <span className="block text-[10px] font-mono text-gray-600 mt-1">PNG, JPG, WEBP formats supported</span>
              </div>

              {previews.length > 0 && (
                <div className="grid grid-cols-5 gap-2 pt-2">
                  {previews.map((preview, index) => (
                    <div key={index} className="aspect-square border border-white/10 relative group bg-secondary">
                      <img src={preview} alt={`preview-${index}`} className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => removeScreenshot(index)}
                        className="absolute top-1 right-1 bg-black/80 hover:bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Submit Button */}
            <motion.button
              type="submit"
              disabled={submitting}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full bg-primary text-black font-bold py-4 uppercase tracking-wider text-sm flex items-center justify-center gap-3 border border-primary shadow-[4px_4px_0_#FF00E5] hover:shadow-[6px_6px_0_#FF00E5] transition-all disabled:opacity-50 cursor-pointer"
            >
              {submitting ? 'Transmitting Data...' : 'Deploy Project'}
              <ArrowRight className="w-4 h-4" />
            </motion.button>
          </form>
      </main>
    </div>
  );
};

export default CreateShowcasePage;
