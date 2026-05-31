import { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { songService } from '../services/api.js';
import Toast from '../components/Common/Toast.jsx';
import { CardSkeleton } from '../components/Common/Skeleton.jsx';
import { 
  Music, 
  Search, 
  PlusCircle, 
  Heart, 
  Archive, 
  Trash2, 
  Copy,
  ChevronDown,
  Filter,
  Calendar,
  Layers,
  Inbox
} from 'lucide-react';

const MySongs = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const isArchivedView = location.pathname === '/songs/archived';
  
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  
  // Search, Filter, Sort States
  const [search, setSearch] = useState('');
  const [selectedMood, setSelectedMood] = useState('All');
  const [sort, setSort] = useState('newest');

  // Select Mode States
  const [isSelectMode, setIsSelectMode] = useState(false);
  const [selectedSongs, setSelectedSongs] = useState([]);


  // Pre-configured moods list
  const moods = ['All', 'Drill', 'Trap', 'Boom Bap', 'Freestyle', 'Conscious', 'Storytelling'];

  // Check URL query parameters on load
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const querySearch = params.get('search');
    if (querySearch) {
      setSearch(querySearch);
    }
  }, [location.search]);

  // Fetch songs from API
  const fetchSongs = async () => {
    setLoading(true);
    try {
      const response = await songService.getAll({
        archived: isArchivedView ? 'true' : 'false',
        search: search || undefined,
        mood: selectedMood === 'All' ? undefined : selectedMood,
        sort: sort
      });
      setSongs(response.data);
    } catch (err) {
      console.error('Error fetching songs:', err);
      setToast({ message: 'Failed to retrieve songs from Vault.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSongs();
  }, [isArchivedView, selectedMood, sort]);

  // Handle manual trigger or debounce search
  const handleSearchKeyPress = (e) => {
    if (e.key === 'Enter') {
      fetchSongs();
    }
  };

  const handleSearchClear = () => {
    setSearch('');
    // Trigger immediate reload
    setTimeout(() => {
      setLoading(true);
      songService.getAll({
        archived: isArchivedView ? 'true' : 'false',
        mood: selectedMood === 'All' ? undefined : selectedMood,
        sort: sort
      }).then(res => {
        setSongs(res.data);
        setLoading(false);
      });
    }, 50);
  };

  // Toggle Favorite Status
  const toggleFavorite = async (id, currentVal, e) => {
    e.stopPropagation(); // prevent card click navigation
    try {
      const updated = await songService.update(id, { favorite: !currentVal });
      setSongs(songs.map(s => s._id === id ? { ...s, favorite: updated.data.favorite } : s));
      setToast({ 
        message: updated.data.favorite ? 'Added to favorites!' : 'Removed from favorites.', 
        type: 'success' 
      });
    } catch (err) {
      setToast({ message: 'Failed to update favorite status.', type: 'error' });
    }
  };

  // Toggle Archived Status
  const toggleArchive = async (id, currentVal, e) => {
    e.stopPropagation();
    try {
      await songService.update(id, { archived: !currentVal });
      setSongs(songs.filter(s => s._id !== id));
      setToast({ 
        message: !currentVal ? 'Track vaulted in archives.' : 'Track restored from archives.', 
        type: 'success' 
      });
    } catch (err) {
      setToast({ message: 'Failed to alter archived status.', type: 'error' });
    }
  };

  // Duplicate Song
  const duplicateSong = async (id, e) => {
    e.stopPropagation();
    try {
      const response = await songService.duplicate(id);
      if (!isArchivedView) {
        setSongs([response.data, ...songs]);
      }
      setToast({ message: 'Track duplicated successfully!', type: 'success' });
    } catch (err) {
      setToast({ message: 'Failed to copy track.', type: 'error' });
    }
  };

  // Delete Song
  const deleteSong = async (id, e) => {
    e.stopPropagation();
    if (window.confirm('Spit caution! Are you sure you want to permanently erase this rap song? This cannot be undone.')) {
      try {
        await songService.delete(id);
        setSongs(songs.filter(s => s._id !== id));
        setToast({ message: 'Track deleted permanently.', type: 'success' });
      } catch (err) {
        setToast({ message: 'Failed to erase track.', type: 'error' });
      }
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const getMoodColor = (mood) => {
    const colors = {
      Drill: 'bg-red-500/10 text-red-400 border-red-500/20 shadow-[0_0_8px_rgba(239,68,68,0.15)]',
      Trap: 'bg-amber-500/10 text-amber-400 border-amber-500/20 shadow-[0_0_8px_rgba(245,158,11,0.15)]',
      'Boom Bap': 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20 shadow-[0_0_8px_rgba(6,182,212,0.15)]',
      Freestyle: 'bg-purple-500/10 text-purple-400 border-purple-500/20 shadow-[0_0_8px_rgba(168,85,247,0.15)]',
      Conscious: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 shadow-[0_0_8px_rgba(16,185,129,0.15)]',
      Storytelling: 'bg-blue-500/10 text-blue-400 border-blue-500/20 shadow-[0_0_8px_rgba(59,130,246,0.15)]'
    };
    return colors[mood] || 'bg-zinc-800 text-zinc-400 border-zinc-700/50';
  };

  const handleCreateNewSong = async () => {
    try {
      const res = await songService.create({
        title: 'Untitled Verse',
        lyrics: '',
        mood: 'Freestyle',
        tags: []
      });
      navigate(`/songs/edit/${res.data._id}`);
    } catch (err) {
      setToast({ message: 'Failed to spawn track.', type: 'error' });
    }
  };

  // Bulk Lyrical Operations (Spit Together)
  const handleMergeTogether = async () => {
    if (selectedSongs.length < 2) {
      setToast({ message: 'Select at least 2 rap tracks to spit together!', type: 'warning' });
      return;
    }

    try {
      const songsToMerge = songs.filter(s => selectedSongs.includes(s._id));
      
      const mergedTitle = `Spit Together: ${songsToMerge.map(s => s.title).join(' & ')}`.slice(0, 80);
      const mergedLyrics = songsToMerge.map(song => {
        return `[Verse: ${song.title}]\n${song.lyrics || 'No rhymes recorded.'}`;
      }).join('\n\n');

      const res = await songService.create({
        title: mergedTitle,
        lyrics: mergedLyrics,
        mood: 'Freestyle',
        tags: ['merged', 'spit-together']
      });

      setToast({ message: 'Tracks merged and spit together successfully!', type: 'success' });
      
      setTimeout(() => {
        navigate(`/songs/edit/${res.data._id}`);
      }, 800);
    } catch (err) {
      console.error('Error merging songs:', err);
      setToast({ message: 'Failed to merge tracks.', type: 'error' });
    }
  };

  const handleBulkArchive = async () => {
    if (selectedSongs.length === 0) return;
    try {
      await Promise.all(selectedSongs.map(id => songService.update(id, { archived: !isArchivedView })));
      setSongs(songs.filter(s => !selectedSongs.includes(s._id)));
      setSelectedSongs([]);
      setIsSelectMode(false);
      setToast({ 
        message: !isArchivedView ? 'Selected tracks vaulted in archives.' : 'Selected tracks restored.', 
        type: 'success' 
      });
    } catch (err) {
      console.error('Error bulk archiving:', err);
      setToast({ message: 'Failed to archive selected tracks.', type: 'error' });
    }
  };

  const handleBulkDelete = async () => {
    if (selectedSongs.length === 0) return;
    if (window.confirm(`Spit caution! Erase these ${selectedSongs.length} rap songs from the Vault permanently? This cannot be undone.`)) {
      try {
        await Promise.all(selectedSongs.map(id => songService.delete(id)));
        setSongs(songs.filter(s => !selectedSongs.includes(s._id)));
        setSelectedSongs([]);
        setIsSelectMode(false);
        setToast({ message: 'Selected tracks erased permanently.', type: 'success' });
      } catch (err) {
        console.error('Error bulk deleting:', err);
        setToast({ message: 'Failed to erase selected tracks.', type: 'error' });
      }
    }
  };


  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {toast && (
        <Toast 
          message={toast.message} 
          type={toast.type} 
          onClose={() => setToast(null)} 
        />
      )}

      {/* ==================== PAGE HEADER ==================== */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-extrabold font-studio tracking-tight bg-gradient-to-r from-white via-zinc-200 to-zinc-400 bg-clip-text text-transparent">
            {isArchivedView ? 'Archived Vaults' : 'My Lyric Vault'}
          </h1>
          <p className="text-sm text-zinc-400 mt-1 font-light">
            {isArchivedView 
              ? 'Secured drafts and old archives. Restorable at any time.' 
              : 'Write and organize your lyrical masterpieces.'}
          </p>
        </div>

        {!isArchivedView && songs.length > 0 && (
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => {
                setIsSelectMode(!isSelectMode);
                setSelectedSongs([]);
              }}
              className={`py-2.5 px-5 border rounded-xl text-xs font-semibold uppercase tracking-wider transition-all duration-300 flex items-center gap-2 ${
                isSelectMode 
                  ? 'bg-purple-600/20 border-purple-500 text-purple-300 shadow-[0_0_10px_rgba(168,85,247,0.2)]'
                  : 'bg-zinc-950/20 border-zinc-800 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200'
              }`}
            >
              <Layers className="w-4 h-4" />
              {isSelectMode ? 'Cancel Selection' : 'Spit Together'}
            </button>

            <button
              onClick={handleCreateNewSong}
              className="py-2.5 px-5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-zinc-100 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all duration-300 shadow-lg shadow-purple-500/20 hover:shadow-purple-500/35 border border-purple-500/10 flex items-center gap-2"
            >
              <PlusCircle className="w-4.5 h-4.5" />
              New Rap Track
            </button>
          </div>
        )}

        {!isArchivedView && songs.length === 0 && (
          <button
            onClick={handleCreateNewSong}
            className="self-start md:self-auto py-2.5 px-5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-zinc-100 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all duration-300 shadow-lg shadow-purple-500/20 hover:shadow-purple-500/35 border border-purple-500/10 flex items-center gap-2"
          >
            <PlusCircle className="w-4.5 h-4.5" />
            New Rap Track
          </button>
        )}
      </div>


      {/* ==================== SEARCH, MOOD PILLS & SORT CONTROLS ==================== */}
      <div className="space-y-4">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          {/* Search Inputs */}
          <div className="relative w-full md:flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={handleSearchKeyPress}
              className="w-full pl-10 pr-10 py-2.5 rounded-xl glass-input text-xs text-zinc-300 placeholder-zinc-500"
              placeholder="Search title, lyrics... (Press Enter to execute)"
            />
            {search && (
              <button 
                onClick={handleSearchClear}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 text-xs font-semibold"
              >
                Clear
              </button>
            )}
          </div>

          {/* Sort Selector */}
          <div className="flex items-center gap-3 w-full md:w-auto justify-end">
            <span className="text-zinc-500 text-xs flex items-center gap-1.5 font-mono">
              <ChevronDown className="w-3.5 h-3.5" />
              Sort:
            </span>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="py-2.5 pl-3 pr-8 rounded-xl bg-zinc-950/40 border border-zinc-800 text-zinc-300 text-xs focus:outline-none focus:border-purple-500/60 cursor-pointer"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="alphabetical">Alphabetical</option>
            </select>
          </div>
        </div>

        {/* Mood Pills Filters */}
        <div className="flex items-center gap-2.5 overflow-x-auto pb-2 scrollbar-thin select-none">
          <span className="text-zinc-500 text-xs flex items-center gap-1 font-mono shrink-0 mr-1.5">
            <Filter className="w-3.5 h-3.5" />
            Mood:
          </span>
          {moods.map((mood) => (
            <button
              key={mood}
              onClick={() => setSelectedMood(mood)}
              className={`px-3.5 py-1.5 rounded-xl text-xs border font-medium transition-all shrink-0 ${
                selectedMood === mood 
                  ? 'bg-purple-600/90 text-zinc-100 border-purple-500 shadow-[0_0_10px_rgba(168,85,247,0.25)]'
                  : 'bg-zinc-950/20 text-zinc-400 border-zinc-800 hover:border-zinc-700 hover:text-zinc-200'
              }`}
            >
              {mood}
            </button>
          ))}
        </div>
      </div>

      {/* ==================== SONG CARD LISTINGS ==================== */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <CardSkeleton /><CardSkeleton /><CardSkeleton />
        </div>
      ) : songs.length === 0 ? (
        <div className="glass-panel rounded-3xl p-16 flex flex-col items-center justify-center text-center max-w-lg mx-auto">
          <div className="w-20 h-20 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-500 mb-6 shadow-inner">
            {isArchivedView ? <Inbox className="w-10 h-10" /> : <Music className="w-10 h-10 animate-pulse" />}
          </div>
          <h2 className="font-studio font-bold text-zinc-200 text-lg tracking-wide">
            {isArchivedView ? 'Archive is empty!' : 'No rap tracks found'}
          </h2>
          <p className="text-xs text-zinc-500 mt-2 leading-relaxed">
            {search || selectedMood !== 'All' 
              ? 'Spit a different filter query. We couldn\'t find any records matching these criteria in your catalog.'
              : isArchivedView 
                ? 'You haven\'t archived any tracks yet. Vault items remain securely active.'
                : 'Your studio notes are empty! Spawn your very first lyric sheet to start.'}
          </p>
          {!isArchivedView && !search && selectedMood === 'All' && (
            <button
              onClick={handleCreateNewSong}
              className="mt-6 px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-zinc-100 rounded-xl text-xs font-semibold uppercase tracking-wider border border-purple-500/10 shadow-lg shadow-purple-500/10"
            >
              Create Track
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {songs.map((song) => {
            const isSelected = selectedSongs.includes(song._id);
            return (
              <div
                key={song._id}
                onClick={() => {
                  if (isSelectMode) {
                    if (isSelected) {
                      setSelectedSongs(selectedSongs.filter(id => id !== song._id));
                    } else {
                      setSelectedSongs([...selectedSongs, song._id]);
                    }
                  } else {
                    navigate(`/songs/edit/${song._id}`);
                  }
                }}
                className={`glass-panel rounded-2xl p-5 hover:border-purple-500/30 cursor-pointer shadow-lg hover:shadow-[0_0_20px_rgba(168,85,247,0.1)] transition-all duration-300 relative group flex flex-col justify-between overflow-hidden h-48 ${
                  isSelected ? 'border-purple-500 bg-purple-500/5 shadow-[0_0_15px_rgba(168,85,247,0.15)] animate-glow-purple' : ''
                }`}
              >
                {/* Neon accent top bar */}
                <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-purple-500/40 to-transparent"></div>

                <div>
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex items-center gap-3 truncate">
                      {isSelectMode && (
                        <div className={`w-4 h-4 rounded-full border flex items-center justify-center flex-shrink-0 transition-all ${
                          isSelected 
                            ? 'border-purple-500 bg-purple-500 text-zinc-100 shadow-[0_0_8px_rgba(168,85,247,0.5)]' 
                            : 'border-zinc-700 bg-zinc-950'
                        }`}>
                          {isSelected && <span className="text-[9px] font-bold">✓</span>}
                        </div>
                      )}
                      <h3 className="font-bold text-base font-studio text-zinc-200 truncate group-hover:text-purple-300 transition-colors">
                        {song.title}
                      </h3>
                    </div>

                  
                    {/* Action block */}
                    {!isSelectMode && (
                      <div className="flex items-center gap-1.5 opacity-40 group-hover:opacity-100 transition-opacity">
                        {!isArchivedView && (
                          <button
                            onClick={(e) => toggleFavorite(song._id, song.favorite, e)}
                            className={`p-1.5 rounded-lg border border-transparent transition-all ${
                              song.favorite 
                                ? 'text-pink-400 bg-pink-500/5 hover:border-pink-500/20' 
                                : 'text-zinc-500 hover:text-pink-400 hover:bg-zinc-800/40'
                            }`}
                            title="Add to Favorites"
                          >
                            <Heart className={`w-3.5 h-3.5 ${song.favorite ? 'fill-pink-500' : ''}`} />
                          </button>
                        )}
                        
                        {!isArchivedView && (
                          <button
                            onClick={(e) => duplicateSong(song._id, e)}
                            className="p-1.5 rounded-lg text-zinc-500 hover:text-cyan-400 hover:bg-zinc-800/40 border border-transparent transition-all"
                            title="Duplicate"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>
                        )}

                        <button
                          onClick={(e) => toggleArchive(song._id, song.archived, e)}
                          className={`p-1.5 rounded-lg border border-transparent transition-all ${
                            song.archived 
                              ? 'text-purple-400 bg-purple-500/5 hover:border-purple-500/20' 
                              : 'text-zinc-500 hover:text-purple-400 hover:bg-zinc-800/40'
                          }`}
                          title={song.archived ? 'Restore to Active' : 'Archive Track'}
                        >
                          <Archive className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={(e) => deleteSong(song._id, e)}
                          className="p-1.5 rounded-lg text-zinc-500 hover:text-red-400 hover:bg-zinc-800/40 border border-transparent transition-all"
                          title="Permanently Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}

                </div>

                <p className="text-xs text-zinc-500 line-clamp-3 mt-3.5 font-light leading-relaxed select-none italic">
                  {song.lyrics ? `"${song.lyrics.slice(0, 140)}..."` : 'Write some lyrics...'}
                </p>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-zinc-800/40 mt-4 text-[10px]">
                <span className={`px-2.5 py-0.5 rounded-full border text-[9px] font-mono font-medium ${getMoodColor(song.mood)}`}>
                  {song.mood}
                </span>
                
                <span className="text-zinc-600 flex items-center gap-1 font-mono">
                  <Calendar className="w-3 h-3" />
                  {formatDate(song.updatedAt)}
                </span>
              </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ==================== BULK ACTIONS FLOATING TOGETHER BAR ==================== */}
      {isSelectMode && selectedSongs.length > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 px-6 py-4 rounded-2xl glass-panel border border-purple-500/20 shadow-[0_0_30px_rgba(168,85,247,0.25)] flex items-center justify-between gap-6 z-50 animate-float w-11/12 max-w-xl">
          <div className="flex items-center gap-2 select-none">
            <span className="w-2.5 h-2.5 rounded-full bg-purple-500 animate-pulse"></span>
            <span className="text-xs font-mono text-zinc-300">
              Selected: <strong className="text-purple-400 font-medium text-sm ml-0.5">{selectedSongs.length}</strong> track{selectedSongs.length > 1 ? 's' : ''}
            </span>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <button
              onClick={handleMergeTogether}
              disabled={selectedSongs.length < 2}
              className="px-3.5 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 disabled:opacity-40 disabled:pointer-events-none text-zinc-100 rounded-xl text-[10px] font-semibold uppercase tracking-wider transition-colors flex items-center gap-1.5"
            >
              <Layers className="w-3.5 h-3.5" />
              Spit Together
            </button>

            <button
              onClick={handleBulkArchive}
              className="px-3 py-2.5 bg-zinc-900 border border-zinc-800 hover:border-purple-500/30 text-purple-400 rounded-xl text-[10px] font-semibold uppercase tracking-wider transition-colors flex items-center gap-1.5 font-mono"
            >
              <Archive className="w-3.5 h-3.5" />
              Archive
            </button>

            <button
              onClick={handleBulkDelete}
              className="px-3 py-2.5 bg-zinc-900 border border-zinc-800 hover:border-red-500/30 text-red-400 rounded-xl text-[10px] font-semibold uppercase tracking-wider transition-colors flex items-center gap-1.5 font-mono"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Delete
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MySongs;
