import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import { Code2, ArrowRight, Upload, X, Plus } from 'lucide-react';
import Navbar from '../components/Navbar';

const CreateTeamPage = () => {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [previews, setPreviews] = useState({ teamAvatar: null, bannerImage: null });
  const [skillInput, setSkillInput] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    requiredSkills: [],
    maxMembers: 4,
    hackathonName: '',
    projectIdea: '',
    teamAvatar: null,
    bannerImage: null,
  });

  const updateForm = (field, value) => setFormData((prev) => ({ ...prev, [field]: value }));

  const handleFileChange = (e, field) => {
    const file = e.target.files[0];
    if (file) {
      updateForm(field, file);
      const reader = new FileReader();
      reader.onloadend = () => setPreviews((prev) => ({ ...prev, [field]: reader.result }));
      reader.readAsDataURL(file);
    }
  };

  const addSkill = () => {
    const value = skillInput.trim().toLowerCase();
    if (value && !formData.requiredSkills.includes(value)) {
      updateForm('requiredSkills', [...formData.requiredSkills, value]);
    }
    setSkillInput('');
  };

  const handleSkillKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addSkill();
    }
  };

  const removeSkill = (skill) => {
    updateForm('requiredSkills', formData.requiredSkills.filter((s) => s !== skill));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      alert('Team name is required.');
      return;
    }
    setSubmitting(true);
    try {
      const data = new FormData();
      data.append('name', formData.name);
      data.append('description', formData.description);
      data.append('requiredSkills', JSON.stringify(formData.requiredSkills));
      data.append('maxMembers', formData.maxMembers);
      data.append('hackathonName', formData.hackathonName);
      data.append('projectIdea', formData.projectIdea);
      if (formData.teamAvatar) data.append('teamAvatar', formData.teamAvatar);
      if (formData.bannerImage) data.append('bannerImage', formData.bannerImage);

      const response = await fetch('/api/v1/teams/create', { method: 'POST', body: data });
      const result = await response.json();
      if (response.ok) {
        navigate(`/teams/${result.data._id}`);
      } else {
        alert(`Error: ${result.message || 'Could not create team'}`);
      }
    } catch (error) {
      console.error('Team creation failed:', error);
      alert('An error occurred while creating the team.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white relative">
      <Navbar />
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none opacity-50"></div>

      <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-20 relative z-10">
        <div className="mb-8">
          <div className="inline-block px-3 py-1 mb-4 border border-accent/50 text-accent text-[10px] font-mono uppercase tracking-widest bg-accent/5">
            [ Team Leader Protocol ]
          </div>
          <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter mb-2">Assemble a Team.</h1>
          <p className="text-gray-400 font-mono text-xs">You become the leader automatically once this is submitted.</p>
        </div>

        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          onSubmit={handleSubmit}
          className="bg-black/80 backdrop-blur-xl border border-white/10 p-8 shadow-2xl brutal-border space-y-6"
        >
          <div className="grid grid-cols-2 gap-6">
            <label className="relative border border-dashed border-white/20 hover:border-primary transition-colors h-28 flex flex-col items-center justify-center cursor-pointer bg-white/5 overflow-hidden group">
              {previews.teamAvatar ? (
                <img src={previews.teamAvatar} alt="Team avatar" className="w-full h-full object-cover" />
              ) : (
                <>
                  <Upload className="w-5 h-5 text-gray-500 mb-2 group-hover:text-primary transition-colors" />
                  <span className="text-[10px] font-mono text-gray-500 group-hover:text-primary transition-colors">Team Avatar</span>
                </>
              )}
              <input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileChange(e, 'teamAvatar')} />
            </label>
            <label className="relative border border-dashed border-white/20 hover:border-primary transition-colors h-28 flex flex-col items-center justify-center cursor-pointer bg-white/5 overflow-hidden group">
              {previews.bannerImage ? (
                <img src={previews.bannerImage} alt="Banner" className="w-full h-full object-cover" />
              ) : (
                <>
                  <Upload className="w-5 h-5 text-gray-500 mb-2 group-hover:text-primary transition-colors" />
                  <span className="text-[10px] font-mono text-gray-500 group-hover:text-primary transition-colors">Banner Image</span>
                </>
              )}
              <input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileChange(e, 'bannerImage')} />
            </label>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-mono text-gray-500 uppercase tracking-widest">Team Name*</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => updateForm('name', e.target.value)}
              placeholder="Neural Ninjas"
              className="w-full bg-black border border-white/10 px-4 py-3 text-sm text-white focus:outline-none focus:border-primary brutal-border placeholder:text-white/20"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-mono text-gray-500 uppercase tracking-widest">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => updateForm('description', e.target.value)}
              rows={3}
              placeholder="What are you building?"
              className="w-full bg-black border border-white/10 px-4 py-3 text-sm text-white focus:outline-none focus:border-primary brutal-border placeholder:text-white/20 resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-1">
              <label className="text-xs font-mono text-gray-500 uppercase tracking-widest">Hackathon</label>
              <input
                type="text"
                value={formData.hackathonName}
                onChange={(e) => updateForm('hackathonName', e.target.value)}
                placeholder="Smart India Hackathon 2026"
                className="w-full bg-black border border-white/10 px-4 py-3 text-sm text-white focus:outline-none focus:border-primary brutal-border placeholder:text-white/20"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-mono text-gray-500 uppercase tracking-widest">Max Members (1-20)</label>
              <input
                type="number"
                min={1}
                max={20}
                value={formData.maxMembers}
                onChange={(e) => updateForm('maxMembers', Number(e.target.value))}
                className="w-full bg-black border border-white/10 px-4 py-3 text-sm text-white focus:outline-none focus:border-primary brutal-border"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-mono text-gray-500 uppercase tracking-widest">Project Idea</label>
            <textarea
              value={formData.projectIdea}
              onChange={(e) => updateForm('projectIdea', e.target.value)}
              rows={2}
              placeholder="One-line pitch"
              className="w-full bg-black border border-white/10 px-4 py-3 text-sm text-white focus:outline-none focus:border-primary brutal-border placeholder:text-white/20 resize-none"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-mono text-gray-500 uppercase tracking-widest">Required Skills</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
                onKeyDown={handleSkillKeyDown}
                placeholder="e.g. react, python (press Enter)"
                className="flex-1 bg-black border border-white/10 px-4 py-3 text-sm text-white focus:outline-none focus:border-primary brutal-border placeholder:text-white/20"
              />
              <button type="button" onClick={addSkill} className="px-4 border border-white/10 hover:border-primary text-white transition-colors">
                <Plus className="w-4 h-4" />
              </button>
            </div>
            {formData.requiredSkills.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-2">
                {formData.requiredSkills.map((skill) => (
                  <span key={skill} className="flex items-center gap-2 text-[10px] px-2 py-1 bg-primary/10 border border-primary text-primary font-mono uppercase">
                    {skill}
                    <button type="button" onClick={() => removeSkill(skill)}>
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          <motion.button
            type="submit"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            disabled={submitting}
            className="w-full bg-primary text-black py-4 font-bold uppercase tracking-wider text-sm flex items-center justify-center gap-3 border border-primary shadow-[4px_4px_0_#FF00E5] hover:shadow-[6px_6px_0_#FF00E5] transition-all mt-2 disabled:opacity-50"
          >
            {submitting ? 'Deploying...' : 'Create Team'} <ArrowRight className="w-4 h-4" />
          </motion.button>
        </motion.form>

        <div className="mt-6 text-center">
          <Link to="/teams" className="text-xs font-mono text-gray-500 hover:text-primary transition-colors">
            &larr; Back to team discovery
          </Link>
        </div>
      </main>
    </div>
  );
};

export default CreateTeamPage;