import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { songService, authService } from '../services/api.js';
import Toast from '../components/Common/Toast.jsx';
import { StatsSkeleton, ListSkeleton } from '../components/Common/Skeleton.jsx';
import { 
  Music, 
  Layers, 
  MessageSquare, 
  Flame, 
  Search, 
  PlusCircle, 
  ArrowRight,
  Sparkles,
  Calendar,
  Heart
} from 'lucide-react';

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [stats, setStats] = useState(null);
  const [recentSongs, setRecentSongs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [toast, setToast] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Fetch profile to get real-time computed statistics
        const profileRes = await authService.getProfile();
        setStats(profileRes.data.stats);

        // Fetch recent songs
        const songsRes = await songService.getAll({ sort: 'newest' });
        setRecentSongs(songsRes.data.slice(0, 4));
      } catch (err) {
        console.error('Error loading dashboard stats:', err);
        setToast({ message: 'Failed to sync with Vault database.', type: 'error' });
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/songs?search=${encodeURIComponent(searchQuery)}`);
    } else {
      navigate('/songs');
    }
  };

  const handleCreateNewSong = async () => {
    try {
      const res = await songService.create({
        title: 'Untitled Verse',
        lyrics: '',
        mood: 'Freestyle',
        tags: []
      });
      setToast({ message: 'New rap track spawned in Vault!', type: 'success' });
      setTimeout(() => navigate(`/songs/edit/${res.data._id}`), 500);
    } catch (err) {
      setToast({ message: 'Failed to spawn track.', type: 'error' });
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const getMoodColor = (mood) => {
    const colors = {
      Drill: 'bg-red-500/10 text-red-400 border-red-500/20',
      Trap: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
      'Boom Bap': 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
      Freestyle: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
      Conscious: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
      Storytelling: 'bg-blue-500/10 text-blue-400 border-blue-500/20'
    };
    return colors[mood] || 'bg-zinc-800 text-zinc-400 border-zinc-700/50';
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

      {/* ==================== WELCOME & SEARCH BAR ==================== */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-extrabold font-studio tracking-tight bg-gradient-to-r from-white via-zinc-100 to-zinc-400 bg-clip-text text-transparent">
            What's the word, {user?.username}?
          </h1>
          <p className="text-sm text-zinc-400 mt-1 font-light flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-purple-400" />
            Spit fire in the recording booth today. Your vault is synced and secure.
          </p>
        </div>

        <form onSubmit={handleSearchSubmit} className="relative w-full md:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl glass-input text-xs text-zinc-300 placeholder-zinc-500"
            placeholder="Search titles, lyrics, tags..."
          />
        </form>
      </div>

      {/* ==================== STATS ROW ==================== */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatsSkeleton /><StatsSkeleton /><StatsSkeleton /><StatsSkeleton />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* STAT 1: TOTAL SONGS */}
          <div className="glass-panel rounded-2xl p-5 hover:border-purple-500/35 transition-all shadow-[0_0_15px_rgba(0,0,0,0.2)] flex items-center gap-4 group">
            <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 group-hover:scale-105 transition-transform duration-300">
              <Music className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-semibold text-zinc-500 uppercase tracking-widest font-mono">Tracks Written</p>
              <h3 className="text-2xl font-bold font-studio mt-0.5 text-zinc-200">{stats?.totalSongs || 0}</h3>
            </div>
          </div>

          {/* STAT 2: TOTAL LINES */}
          <div className="glass-panel rounded-2xl p-5 hover:border-cyan-500/35 transition-all shadow-[0_0_15px_rgba(0,0,0,0.2)] flex items-center gap-4 group">
            <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 group-hover:scale-105 transition-transform duration-300">
              <Layers className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-semibold text-zinc-500 uppercase tracking-widest font-mono">Rhyme Lines</p>
              <h3 className="text-2xl font-bold font-studio mt-0.5 text-zinc-200">{stats?.totalLines || 0}</h3>
            </div>
          </div>

          {/* STAT 3: TOTAL WORDS */}
          <div className="glass-panel rounded-2xl p-5 hover:border-pink-500/35 transition-all shadow-[0_0_15px_rgba(0,0,0,0.2)] flex items-center gap-4 group">
            <div className="w-12 h-12 rounded-xl bg-pink-500/10 border border-pink-500/20 flex items-center justify-center text-pink-400 group-hover:scale-105 transition-transform duration-300">
              <MessageSquare className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-semibold text-zinc-500 uppercase tracking-widest font-mono">Word Count</p>
              <h3 className="text-2xl font-bold font-studio mt-0.5 text-zinc-200">{stats?.totalWords || 0}</h3>
            </div>
          </div>

          {/* STAT 4: TOP MOOD */}
          <div className="glass-panel rounded-2xl p-5 hover:border-amber-500/35 transition-all shadow-[0_0_15px_rgba(0,0,0,0.2)] flex items-center gap-4 group">
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 group-hover:scale-105 transition-transform duration-300">
              <Flame className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-semibold text-zinc-500 uppercase tracking-widest font-mono">Top Mood</p>
              <h3 className="text-xl font-bold font-studio mt-1 text-zinc-200 truncate max-w-[150px]">{stats?.favoriteMood || 'None'}</h3>
            </div>
          </div>
        </div>
      )}

      {/* ==================== WORKSPACE GRID ==================== */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* RECENT TRACKS LIST (2 Columns) */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold font-studio text-zinc-200 tracking-wide flex items-center gap-2">
              Recent Tracks
            </h2>
            <Link 
              to="/songs" 
              className="text-xs font-semibold text-purple-400 hover:text-purple-300 flex items-center gap-1.5 transition-colors group"
            >
              All Verses 
              <ArrowRight className="w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-x-1" />
            </Link>
          </div>

          {loading ? (
            <div className="glass-panel rounded-2xl p-6">
              <ListSkeleton />
            </div>
          ) : recentSongs.length === 0 ? (
            <div className="glass-panel rounded-2xl p-10 flex flex-col items-center justify-center text-center">
              <div className="w-16 h-16 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-500 mb-4 animate-bounce">
                <Music className="w-8 h-8" />
              </div>
              <h3 className="font-studio font-bold text-zinc-300 text-sm">Your lyric vaults are completely empty!</h3>
              <p className="text-xs text-zinc-500 mt-1 max-w-sm">No songs written yet. Spawning a new lyric sheet will start your writing career.</p>
              <button
                onClick={handleCreateNewSong}
                className="mt-5 px-5 py-2.5 bg-purple-600/35 border border-purple-500/30 hover:bg-purple-600 text-zinc-100 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all duration-300"
              >
                Create Song
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {recentSongs.map((song) => (
                <div 
                  key={song._id}
                  onClick={() => navigate(`/songs/edit/${song._id}`)}
                  className="glass-panel rounded-2xl p-5 hover:border-purple-500/30 cursor-pointer shadow-md transition-all duration-200 relative group overflow-hidden"
                >
                  <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-purple-500/40 to-transparent"></div>
                  
                  <div className="flex justify-between items-start gap-3">
                    <h3 className="font-semibold text-sm text-zinc-200 group-hover:text-purple-300 transition-colors truncate max-w-[150px] font-studio">
                      {song.title}
                    </h3>
                    {song.favorite && (
                      <Heart className="w-4 h-4 text-pink-500 fill-pink-500 animate-pulse flex-shrink-0" />
                    )}
                  </div>
                  
                  <p className="text-xs text-zinc-500 line-clamp-2 mt-2 h-8 font-light italic">
                    {song.lyrics ? `"${song.lyrics.slice(0, 100)}..."` : 'No rhymes spit yet. Click to write lyrics...'}
                  </p>
                  
                  <div className="flex items-center justify-between pt-4 border-t border-zinc-800/40 mt-3 text-[10px]">
                    <span className={`px-2 py-0.5 rounded-full border text-[9px] font-mono font-medium ${getMoodColor(song.mood)}`}>
                      {song.mood}
                    </span>
                    <span className="text-zinc-600 flex items-center gap-1 font-mono">
                      <Calendar className="w-3 h-3" />
                      {formatDate(song.updatedAt)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* PRODUCER BOOTH & QUICK LAUNCH (1 Column) */}
        <div className="flex flex-col gap-4">
          <h2 className="text-lg font-bold font-studio text-zinc-200 tracking-wide">
            Studio Booth
          </h2>
          
          <div className="glass-panel rounded-2xl p-6 flex flex-col items-center justify-between text-center relative overflow-hidden h-full min-h-[300px]">
            {/* Visual audio wave background graphic */}
            <div className="absolute top-0 left-0 right-0 bottom-0 pointer-events-none select-none bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-purple-900/10 via-transparent to-transparent"></div>
            
            <div className="space-y-4 z-10 w-full">
              {/* Studio Beat EQ Deck indicator */}
              <div className="flex items-center justify-center gap-1.5 h-10 w-full border-b border-zinc-800/40 pb-4">
                <span className="w-1.5 bg-purple-500 rounded-full animate-soundwave-1"></span>
                <span className="w-1.5 bg-cyan-500 rounded-full animate-soundwave-2"></span>
                <span className="w-1.5 bg-pink-500 rounded-full animate-soundwave-3"></span>
                <span className="w-1.5 bg-purple-400 rounded-full animate-soundwave-4"></span>
                <span className="w-1.5 bg-cyan-400 rounded-full animate-soundwave-1"></span>
                <span className="w-1.5 bg-pink-400 rounded-full animate-soundwave-2"></span>
                <span className="w-1.5 bg-purple-500 rounded-full animate-soundwave-3"></span>
              </div>
              
              <h3 className="font-studio font-bold text-zinc-300 text-sm">Spit a New Rhyme</h3>
              <p className="text-xs text-zinc-500 max-w-xs mx-auto leading-relaxed">
                Open up a fresh workspace lyric sheet. Lyrics automatically save every 30 seconds. Perfect for drill tempo, boom bap schemes, or conscious tracks.
              </p>
            </div>

            <button
              onClick={handleCreateNewSong}
              className="mt-6 w-full py-3.5 bg-gradient-to-r from-purple-600/90 to-cyan-600/90 hover:from-purple-500 hover:to-cyan-500 text-zinc-100 rounded-xl text-xs font-semibold uppercase tracking-wider border border-purple-500/20 shadow-lg shadow-purple-500/10 transition-all duration-300 flex items-center justify-center gap-2 group z-10"
            >
              <PlusCircle className="w-4 h-4 transition-transform group-hover:rotate-90" />
              Spawn Fresh Sheet
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Dashboard;
