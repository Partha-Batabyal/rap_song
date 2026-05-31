import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { songService } from '../services/api.js';
import Toast from '../components/Common/Toast.jsx';
import { Disc, Heart, Archive, Trash2, Copy, ArrowLeft, Download, Maximize2, Minimize2, Save, ChevronDown } from 'lucide-react';

const EditSong = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isNewTrack = !id;

  const [title, setTitle] = useState('');
  const [lyrics, setLyrics] = useState('');
  const [mood, setMood] = useState('Freestyle');
  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState('');
  const [archived, setArchived] = useState(false);
  const [favorite, setFavorite] = useState(false);

  // Status & Utility states
  const [loading, setLoading] = useState(true);
  const [saveStatus, setSaveStatus] = useState('Synced'); // 'Synced', 'Drafting', 'Saving'
  const [toast, setToast] = useState(null);
  const [focusMode, setFocusMode] = useState(false);

  // References for Auto-Save
  const lyricsRef = useRef(lyrics);
  const titleRef = useRef(title);
  const moodRef = useRef(mood);
  const tagsRef = useRef(tags);
  const favoriteRef = useRef(favorite);
  const archivedRef = useRef(archived);
  
  // Sync refs with state values
  useEffect(() => {
    lyricsRef.current = lyrics;
    titleRef.current = title;
    moodRef.current = mood;
    tagsRef.current = tags;
    favoriteRef.current = favorite;
    archivedRef.current = archived;
  }, [lyrics, title, mood, tags, favorite, archived]);

  // Load song details on mount
  useEffect(() => {
    const fetchSongDetails = async () => {
      if (isNewTrack) {
        // Prepare blank song template values
        setTitle('Untitled Rap Verse');
        setLyrics('');
        setMood('Freestyle');
        setTags([]);
        setLoading(false);
        return;
      }

      try {
        const response = await songService.getById(id);
        const song = response.data;
        setTitle(song.title);
        setLyrics(song.lyrics || '');
        setMood(song.mood);
        setTags(song.tags || []);
        setFavorite(song.favorite);
        setArchived(song.archived);
      } catch (err) {
        console.error('Error fetching song details:', err);
        setToast({ message: 'Failed to load track from your Vault.', type: 'error' });
        setTimeout(() => navigate('/songs'), 1500);
      } finally {
        setLoading(false);
      }
    };

    fetchSongDetails();
  }, [id, isNewTrack, navigate]);

  // Save operation function
  const handleSave = async (isAuto = false) => {
    // If it's a new unsaved track, don't auto-save until a manual interaction or save
    if (isNewTrack && isAuto && !lyricsRef.current && titleRef.current === 'Untitled Rap Verse') {
      return;
    }

    setSaveStatus('Saving');
    
    const payload = {
      title: titleRef.current || 'Untitled Verse',
      lyrics: lyricsRef.current || '',
      mood: moodRef.current,
      tags: tagsRef.current,
      favorite: favoriteRef.current,
      archived: archivedRef.current
    };

    try {
      if (isNewTrack) {
        // Create song first to get an ID
        const res = await songService.create(payload);
        setSaveStatus('Synced');
        setToast({ message: 'Verse saved and locked in cloud.', type: 'success' });
        // Redirect to edit url of newly created song so auto-save works on it
        navigate(`/songs/edit/${res.data._id}`, { replace: true });
      } else {
        await songService.update(id, payload);
        setSaveStatus('Synced');
        if (!isAuto) {
          setToast({ message: 'Studio session saved successfully.', type: 'success' });
        }
      }
    } catch (err) {
      console.error('Error saving song:', err);
      setSaveStatus('Drafting');
      if (!isAuto) {
        setToast({ message: 'Failed to save studio session.', type: 'error' });
      }
    }
  };

  // 1. Auto-save every 30 seconds interval
  useEffect(() => {
    if (loading) return;

    const autoSaveInterval = setInterval(() => {
      if (saveStatus === 'Drafting') {
        handleSave(true);
      }
    }, 30000);

    return () => clearInterval(autoSaveInterval);
  }, [loading, saveStatus]);

  // 2. Debounced auto-save (saves 2 seconds after user stops typing)
  useEffect(() => {
    if (loading) return;
    
    // Don't auto-save immediately on load
    if (saveStatus === 'Synced') return;

    const delayDebounce = setTimeout(() => {
      handleSave(true);
    }, 2000);

    return () => clearTimeout(delayDebounce);
  }, [lyrics, title, mood, tags, favorite, archived]);

  // Handle typing interactions
  const handleLyricsChange = (e) => {
    setLyrics(e.target.value);
    setSaveStatus('Drafting');
  };

  const handleTitleChange = (e) => {
    setTitle(e.target.value);
    setSaveStatus('Drafting');
  };

  const handleMoodChange = (e) => {
    setMood(e.target.value);
    setSaveStatus('Drafting');
  };

  // Tag list manipulations
  const addTag = (e) => {
    e.preventDefault();
    const cleanTag = tagInput.trim().toLowerCase();
    if (cleanTag && !tags.includes(cleanTag)) {
      setTags([...tags, cleanTag]);
      setTagInput('');
      setSaveStatus('Drafting');
    }
  };

  const removeTag = (tagToRemove) => {
    setTags(tags.filter(t => t !== tagToRemove));
    setSaveStatus('Drafting');
  };

  // Text metrics calculations
  const getMetrics = () => {
    const chars = lyrics.length;
    const words = lyrics.trim() === '' ? 0 : lyrics.trim().split(/\s+/).filter(w => w.length > 0).length;
    const lines = lyrics === '' ? 0 : lyrics.split('\n').filter(l => l.trim().length > 0).length;
    return { chars, words, lines };
  };

  const metrics = getMetrics();

  // Export song as TXT
  const handleExportAsTxt = () => {
    const fileContent = `===================================\n  RAPVAULT - STUDIO LYRIC SHEET\n===================================\nTitle: ${title}\nMood: ${mood}\nTags: ${tags.join(', ')}\nCreated: ${new Date().toLocaleDateString()}\n\n----------------- LYRICS -----------------\n\n${lyrics}\n\n===================================\nSaved & Locked in RapVault.`;
    
    const element = document.createElement("a");
    const file = new Blob([fileContent], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    const cleanTitle = title.toLowerCase().replace(/[^a-z0-9]+/g, '_');
    element.download = `rapvault_${cleanTitle || 'lyrics'}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    
    setToast({ message: 'Lyrics exported as TXT!', type: 'success' });
  };

  // Copy to Clipboard
  const handleCopyToClipboard = () => {
    if (!lyrics) {
      setToast({ message: 'No lyrics to copy!', type: 'error' });
      return;
    }
    navigator.clipboard.writeText(lyrics);
    setToast({ message: 'Lyrics copied to clipboard!', type: 'success' });
  };

  // Toggle Favorite
  const handleFavoriteToggle = () => {
    setFavorite(!favorite);
    setSaveStatus('Drafting');
  };

  // Toggle Archive
  const handleArchiveToggle = () => {
    setArchived(!archived);
    setSaveStatus('Drafting');
    setToast({ message: !archived ? 'Track queued for archiving.' : 'Track queued for restoring.', type: 'info' });
  };

  // Duplicate Song
  const handleDuplicate = async () => {
    if (isNewTrack) return;
    try {
      const response = await songService.duplicate(id);
      setToast({ message: 'Track duplicated successfully!', type: 'success' });
      setTimeout(() => navigate(`/songs/edit/${response.data._id}`), 500);
    } catch (err) {
      setToast({ message: 'Failed to duplicate track.', type: 'error' });
    }
  };

  // Delete Song
  const handleDelete = async () => {
    if (isNewTrack) {
      navigate('/songs');
      return;
    }

    if (window.confirm('Spit caution! Erase this rap song from the Vault permanently?')) {
      try {
        await songService.delete(id);
        setToast({ message: 'Track erased.', type: 'success' });
        setTimeout(() => navigate('/songs'), 500);
      } catch (err) {
        setToast({ message: 'Failed to erase track.', type: 'error' });
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center">
        <Disc className="w-12 h-12 text-purple-500 animate-spin" />
        <p className="mt-4 text-purple-400 font-studio text-sm tracking-widest uppercase animate-pulse">Syncing Studio deck...</p>
      </div>
    );
  }

  return (
    <div className={`transition-all duration-300 ${focusMode ? 'max-w-4xl mx-auto px-4 md:px-0' : 'max-w-5xl mx-auto'}`}>
      {toast && (
        <Toast 
          message={toast.message} 
          type={toast.type} 
          onClose={() => setToast(null)} 
        />
      )}

      {/* ==================== HEADER ROW (Hidden in Focus Mode) ==================== */}
      {!focusMode && (
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-zinc-800/60 pb-5 mb-6">
          <button 
            onClick={() => navigate('/songs')}
            className="flex items-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-300 font-mono transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Return to Vault
          </button>
          
          <div className="flex items-center gap-2">
            {/* Save Status Light */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-zinc-950/40 border border-zinc-800 text-[10px] font-mono select-none">
              <span className={`w-2 h-2 rounded-full ${
                saveStatus === 'Synced' ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)] animate-pulse' :
                saveStatus === 'Saving' ? 'bg-cyan-500 shadow-[0_0_8px_rgba(6,182,212,0.8)] animate-spin border border-t-transparent' :
                'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.8)]'
              }`}></span>
              <span className="text-zinc-400 uppercase tracking-widest">
                {saveStatus === 'Synced' ? 'Vault Synced' :
                 saveStatus === 'Saving' ? 'Saving...' :
                 'Unsaved Draft'}
              </span>
            </div>

            {/* Favorite toggle */}
            <button
              onClick={handleFavoriteToggle}
              className={`p-2.5 rounded-xl border transition-all ${
                favorite 
                  ? 'border-pink-500/35 bg-pink-500/5 text-pink-500' 
                  : 'border-zinc-800 bg-zinc-950/40 text-zinc-400 hover:text-pink-500 hover:border-pink-500/20'
              }`}
              title="Add to Favorites"
            >
              <Heart className={`w-4 h-4 ${favorite ? 'fill-pink-500' : ''}`} />
            </button>

            {/* Archive toggle */}
            <button
              onClick={handleArchiveToggle}
              className={`p-2.5 rounded-xl border transition-all ${
                archived 
                  ? 'border-purple-500/35 bg-purple-500/5 text-purple-400' 
                  : 'border-zinc-800 bg-zinc-950/40 text-zinc-400 hover:text-purple-400 hover:border-purple-500/20'
              }`}
              title={archived ? 'Restore to Active' : 'Archive Song'}
            >
              <Archive className="w-4 h-4" />
            </button>

            {/* Delete button */}
            <button
              onClick={handleDelete}
              className="p-2.5 rounded-xl border border-zinc-800 bg-zinc-950/40 text-zinc-400 hover:text-red-400 hover:border-red-500/20 transition-all"
              title="Permanently Erase"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ==================== WORKSPACE CONTAINER ==================== */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        
        {/* LYRICS CARD SHEET (Spans 3 Columns in regular, 4 Columns in Focus) */}
        <div className={`lg:col-span-3 flex flex-col gap-4 ${focusMode ? 'lg:col-span-4' : ''}`}>
          
          {/* Distraction-Free Header (Renders only in Focus Mode) */}
          {focusMode && (
            <div className="flex items-center justify-between py-2 border-b border-zinc-800/30 select-none">
              <span className="text-[10px] text-zinc-600 font-mono tracking-widest flex items-center gap-1.5 uppercase">
                <Disc className="w-3.5 h-3.5 text-purple-500 animate-spin" />
                Focus Studio Active
              </span>
              
              <div className="flex items-center gap-3">
                {/* Save status inside focus mode */}
                <span className="text-[9px] text-zinc-500 font-mono flex items-center gap-1.5">
                  <span className={`w-1.5 h-1.5 rounded-full ${
                    saveStatus === 'Synced' ? 'bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.8)]' :
                    saveStatus === 'Saving' ? 'bg-cyan-500 animate-spin border border-t-transparent' :
                    'bg-amber-500 shadow-[0_0_6px_rgba(245,158,11,0.8)]'
                  }`}></span>
                  {saveStatus.toUpperCase()}
                </span>
                
                <button
                  onClick={() => setFocusMode(false)}
                  className="p-1 rounded-lg text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/30"
                  title="Exit Focus Mode"
                >
                  <Minimize2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* Core Lyric writing Sheet */}
          <div className="glass-panel rounded-3xl p-6 md:p-8 flex flex-col relative shadow-2xl overflow-hidden min-h-[500px]">
            {/* Neon top highlight */}
            <div className="absolute top-0 left-0 right-0 h-[2.5px] bg-gradient-to-r from-purple-500 via-pink-500 to-cyan-500"></div>

            {/* Editable Track Title Input */}
            <input
              type="text"
              value={title}
              onChange={handleTitleChange}
              className="bg-transparent border-0 border-b border-transparent focus:border-purple-500/20 text-xl md:text-3xl font-extrabold font-studio text-zinc-100 placeholder-zinc-700 tracking-wide pb-2 focus:outline-none w-full"
              placeholder="Spit track name..."
            />

            {/* Lyrical Space Textarea */}
            <textarea
              value={lyrics}
              onChange={handleLyricsChange}
              className="flex-grow bg-transparent border-0 text-zinc-200 placeholder-zinc-700 text-sm md:text-base leading-relaxed tracking-wider py-8 resize-none focus:outline-none min-h-[380px] font-mono"
              placeholder="[Verse 1]\nSpit your rhymes here...\nLyrics are auto-saved in real-time."
              spellCheck="false"
            />

            {/* Lyric counting Deck bar */}
            <div className="flex items-center justify-between border-t border-zinc-800/40 pt-4 text-[10px] text-zinc-500 font-mono select-none">
              <div className="flex items-center gap-4">
                <span>LINES: <strong className="text-purple-400 font-medium text-xs ml-0.5">{metrics.lines}</strong></span>
                <span>WORDS: <strong className="text-cyan-400 font-medium text-xs ml-0.5">{metrics.words}</strong></span>
                <span>CHARS: <strong className="text-pink-400 font-medium text-xs ml-0.5">{metrics.chars}</strong></span>
              </div>
              
              <div className="flex items-center gap-2">
                <button 
                  onClick={handleCopyToClipboard}
                  className="px-2.5 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800/80 hover:border-zinc-700 text-[10px] text-zinc-400 hover:text-zinc-200 transition-colors uppercase font-mono tracking-wider"
                >
                  Copy
                </button>
                
                <button 
                  onClick={handleExportAsTxt}
                  className="px-2.5 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800/80 hover:border-zinc-700 text-[10px] text-zinc-400 hover:text-zinc-200 transition-colors uppercase font-mono tracking-wider flex items-center gap-1"
                >
                  <Download className="w-3 h-3" />
                  Export
                </button>

                {!focusMode && (
                  <button
                    onClick={() => setFocusMode(true)}
                    className="p-1.5 rounded-lg hover:bg-zinc-800/40 text-zinc-500 hover:text-zinc-300"
                    title="Focus Mode"
                  >
                    <Maximize2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* METADATA SIDEBAR (Hidden in Focus Mode) */}
        {!focusMode && (
          <div className="flex flex-col gap-6 select-none">
            
            {/* CARD 1: TRACK MOOD */}
            <div className="glass-panel rounded-2xl p-5 border border-zinc-800 shadow-md">
              <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-widest mb-3.5 font-mono">
                Track Mood
              </label>
              
              <div className="relative">
                <select
                  value={mood}
                  onChange={handleMoodChange}
                  className="w-full py-2.5 pl-3 pr-8 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-300 text-xs focus:outline-none focus:border-purple-500/60 cursor-pointer appearance-none"
                >
                  <optgroup label="Modern Styles" className="bg-zinc-950 text-zinc-400">
                    <option value="Freestyle" className="text-zinc-200">Freestyle</option>
                    <option value="Drill" className="text-zinc-200">Drill</option>
                    <option value="Trap" className="text-zinc-200">Trap</option>
                  </optgroup>
                  <optgroup label="Classic Styles" className="bg-zinc-950 text-zinc-400">
                    <option value="Boom Bap" className="text-zinc-200">Boom Bap</option>
                    <option value="Conscious" className="text-zinc-200">Conscious</option>
                    <option value="Storytelling" className="text-zinc-200">Storytelling</option>
                  </optgroup>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-zinc-500">
                  <ChevronDown className="w-4 h-4" />
                </div>
              </div>
            </div>

            {/* CARD 2: TAG ENGINE */}
            <div className="glass-panel rounded-2xl p-5 border border-zinc-800 shadow-md">
              <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-widest mb-3 font-mono">
                Track Tags
              </label>
              
              <form onSubmit={addTag} className="flex gap-2 mb-4">
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  className="flex-grow px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-zinc-300 focus:outline-none focus:border-purple-500/40 placeholder-zinc-600"
                  placeholder="hook, intro, hard..."
                />
                <button
                  type="submit"
                  className="px-3 bg-zinc-900 border border-zinc-800 hover:border-purple-500/40 text-purple-400 rounded-xl text-xs font-bold transition-all"
                >
                  +
                </button>
              </form>

              {tags.length === 0 ? (
                <p className="text-[10px] text-zinc-600 font-light italic">No tags associated with track.</p>
              ) : (
                <div className="flex flex-wrap gap-1.5">
                  {tags.map((tag) => (
                    <span 
                      key={tag}
                      className="px-2.5 py-1 rounded-xl bg-zinc-950 border border-zinc-800 text-[10px] text-zinc-400 flex items-center gap-1 font-mono font-medium hover:border-red-500/30 hover:text-red-400 cursor-pointer transition-colors"
                      onClick={() => removeTag(tag)}
                      title="Click to remove tag"
                    >
                      #{tag}
                      <span className="text-[8px] opacity-40">×</span>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* CARD 3: STUDIO QUICK MANUAL SAVE */}
            <div className="glass-panel rounded-2xl p-5 border border-zinc-800 shadow-md">
              <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-widest mb-3 font-mono">
                Vault Sync
              </label>
              
              <p className="text-[10px] text-zinc-500 leading-relaxed font-light mb-4">
                Vault saves and syncs in real-time, but you can trigger a manual sync to ensure instantaneous local database locking.
              </p>

              <button
                onClick={() => handleSave(false)}
                className="w-full py-2.5 bg-purple-600/90 border border-purple-500/20 hover:bg-purple-600 text-zinc-100 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all duration-300 flex items-center justify-center gap-1.5 shadow-md shadow-purple-500/10"
              >
                <Save className="w-3.5 h-3.5" />
                Sync Vault
              </button>

              {/* Duplicate track shortcut (Only if not a new track) */}
              {!isNewTrack && (
                <button
                  onClick={handleDuplicate}
                  className="w-full py-2.5 mt-2 bg-zinc-900 border border-zinc-800/80 hover:border-zinc-700 text-zinc-400 hover:text-zinc-200 rounded-xl text-xs font-semibold uppercase tracking-wider transition-colors flex items-center justify-center gap-1.5"
                >
                  <Copy className="w-3.5 h-3.5" />
                  Duplicate Track
                </button>
              )}
            </div>

          </div>
        )}

      </div>
    </div>
  );
};

export default EditSong;
