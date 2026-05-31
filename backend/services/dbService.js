import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import User from '../models/User.js';
import Song from '../models/Song.js';
import { getDbStatus } from '../config/db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.join(__dirname, '..', 'data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

// Ensure data folder and db.json exist for fallback mode
const initializeLocalDb = () => {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(DB_FILE)) {
    fs.writeFileSync(DB_FILE, JSON.stringify({ users: [], songs: [] }, null, 2));
  }
};

const readLocalDb = () => {
  initializeLocalDb();
  try {
    const data = fs.readFileSync(DB_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading local JSON database:', error);
    return { users: [], songs: [] };
  }
};

const writeLocalDb = (data) => {
  initializeLocalDb();
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('Error writing to local JSON database:', error);
  }
};

// Unique ID Generator for local files
const generateId = () => {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
};

export const dbService = {
  // ==================== USER OPERATIONS ====================
  
  async createUser(userData) {
    const { fallback } = getDbStatus();
    if (!fallback) {
      const user = new User(userData);
      return await user.save();
    } else {
      const db = readLocalDb();
      // Check if user already exists
      const emailExists = db.users.some(u => u.email.toLowerCase() === userData.email.toLowerCase());
      const usernameExists = db.users.some(u => u.username.toLowerCase() === userData.username.toLowerCase());
      if (emailExists || usernameExists) {
        throw new Error('Email or Username already exists');
      }
      
      const newUser = {
        _id: generateId(),
        username: userData.username,
        email: userData.email,
        password: userData.password,
        profileImage: userData.profileImage || '',
        createdAt: new Date().toISOString()
      };
      db.users.push(newUser);
      writeLocalDb(db);
      return newUser;
    }
  },

  async findUserByEmail(email) {
    const { fallback } = getDbStatus();
    if (!fallback) {
      return await User.findOne({ email: email.toLowerCase() });
    } else {
      const db = readLocalDb();
      return db.users.find(u => u.email.toLowerCase() === email.toLowerCase()) || null;
    }
  },

  async findUserByUsername(username) {
    const { fallback } = getDbStatus();
    if (!fallback) {
      return await User.findOne({ username });
    } else {
      const db = readLocalDb();
      return db.users.find(u => u.username.toLowerCase() === username.toLowerCase()) || null;
    }
  },

  async findUserById(id) {
    const { fallback } = getDbStatus();
    if (!fallback) {
      return await User.findById(id).select('-password');
    } else {
      const db = readLocalDb();
      const user = db.users.find(u => u._id === id);
      if (!user) return null;
      // Exclude password
      const { password, ...userWithoutPassword } = user;
      return userWithoutPassword;
    }
  },

  async findUserByIdWithPassword(id) {
    const { fallback } = getDbStatus();
    if (!fallback) {
      return await User.findById(id);
    } else {
      const db = readLocalDb();
      return db.users.find(u => u._id === id) || null;
    }
  },

  async updateUser(id, updateData) {
    const { fallback } = getDbStatus();
    if (!fallback) {
      return await User.findByIdAndUpdate(id, updateData, { new: true }).select('-password');
    } else {
      const db = readLocalDb();
      const index = db.users.findIndex(u => u._id === id);
      if (index === -1) return null;
      
      db.users[index] = {
        ...db.users[index],
        ...updateData,
        // Ensure email is lowercased if updated
        email: updateData.email ? updateData.email.toLowerCase() : db.users[index].email
      };
      writeLocalDb(db);
      const { password, ...userWithoutPassword } = db.users[index];
      return userWithoutPassword;
    }
  },

  // ==================== SONG OPERATIONS ====================
  
  async createSong(songData) {
    const { fallback } = getDbStatus();
    if (!fallback) {
      const song = new Song(songData);
      return await song.save();
    } else {
      const db = readLocalDb();
      const now = new Date().toISOString();
      const newSong = {
        _id: generateId(),
        userId: songData.userId,
        title: songData.title || 'Untitled Rap Song',
        lyrics: songData.lyrics || '',
        mood: songData.mood || 'Freestyle',
        tags: songData.tags || [],
        archived: songData.archived !== undefined ? songData.archived : false,
        favorite: songData.favorite !== undefined ? songData.favorite : false,
        createdAt: now,
        updatedAt: now
      };
      db.songs.push(newSong);
      writeLocalDb(db);
      return newSong;
    }
  },

  async findSongs(userId, queryParams = {}) {
    const { fallback } = getDbStatus();
    if (!fallback) {
      const filter = { userId };
      
      // Archived filter
      if (queryParams.archived !== undefined) {
        filter.archived = queryParams.archived === 'true';
      }
      
      // Favorite filter
      if (queryParams.favorite !== undefined) {
        filter.favorite = queryParams.favorite === 'true';
      }

      // Mood filter
      if (queryParams.mood) {
        filter.mood = queryParams.mood;
      }

      // Search (title or lyrics)
      if (queryParams.search) {
        filter.$or = [
          { title: { $regex: queryParams.search, $options: 'i' } },
          { lyrics: { $regex: queryParams.search, $options: 'i' } },
          { tags: { $regex: queryParams.search, $options: 'i' } }
        ];
      }

      let query = Song.find(filter);

      // Sorting
      if (queryParams.sort === 'oldest') {
        query = query.sort({ createdAt: 1 });
      } else if (queryParams.sort === 'alphabetical') {
        query = query.sort({ title: 1 });
      } else {
        query = query.sort({ createdAt: -1 }); // Default: newest
      }

      return await query.exec();
    } else {
      const db = readLocalDb();
      let userSongs = db.songs.filter(s => String(s.userId) === String(userId));

      // Archived filter
      if (queryParams.archived !== undefined) {
        const isArchived = queryParams.archived === 'true';
        userSongs = userSongs.filter(s => s.archived === isArchived);
      }
      
      // Favorite filter
      if (queryParams.favorite !== undefined) {
        const isFavorite = queryParams.favorite === 'true';
        userSongs = userSongs.filter(s => s.favorite === isFavorite);
      }

      // Mood filter
      if (queryParams.mood) {
        userSongs = userSongs.filter(s => s.mood === queryParams.mood);
      }

      // Search filter
      if (queryParams.search) {
        const term = queryParams.search.toLowerCase();
        userSongs = userSongs.filter(s => 
          s.title.toLowerCase().includes(term) || 
          s.lyrics.toLowerCase().includes(term) ||
          s.tags.some(tag => tag.toLowerCase().includes(term))
        );
      }

      // Sorting
      if (queryParams.sort === 'oldest') {
        userSongs.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
      } else if (queryParams.sort === 'alphabetical') {
        userSongs.sort((a, b) => a.title.localeCompare(b.title));
      } else {
        // default newest
        userSongs.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      }

      return userSongs;
    }
  },

  async findSongById(id, userId) {
    const { fallback } = getDbStatus();
    if (!fallback) {
      return await Song.findOne({ _id: id, userId });
    } else {
      const db = readLocalDb();
      return db.songs.find(s => s._id === id && String(s.userId) === String(userId)) || null;
    }
  },

  async updateSong(id, userId, updateData) {
    const { fallback } = getDbStatus();
    if (!fallback) {
      return await Song.findOneAndUpdate(
        { _id: id, userId },
        updateData,
        { new: true }
      );
    } else {
      const db = readLocalDb();
      const index = db.songs.findIndex(s => s._id === id && String(s.userId) === String(userId));
      if (index === -1) return null;

      db.songs[index] = {
        ...db.songs[index],
        ...updateData,
        updatedAt: new Date().toISOString()
      };
      writeLocalDb(db);
      return db.songs[index];
    }
  },

  async deleteSong(id, userId) {
    const { fallback } = getDbStatus();
    if (!fallback) {
      return await Song.findOneAndDelete({ _id: id, userId });
    } else {
      const db = readLocalDb();
      const index = db.songs.findIndex(s => s._id === id && String(s.userId) === String(userId));
      if (index === -1) return null;
      
      const [deletedSong] = db.songs.splice(index, 1);
      writeLocalDb(db);
      return deletedSong;
    }
  },

  async getUserStats(userId) {
    const songs = await this.findSongs(userId, {});
    
    // Calculate stats
    const totalSongs = songs.length;
    const archivedSongs = songs.filter(s => s.archived).length;
    const favoriteSongs = songs.filter(s => s.favorite).length;
    
    // Mood counts
    const moodCounts = {};
    let totalLines = 0;
    let totalWords = 0;

    songs.forEach(s => {
      moodCounts[s.mood] = (moodCounts[s.mood] || 0) + 1;
      
      // Count lines and words
      if (s.lyrics) {
        const lines = s.lyrics.split('\n').filter(line => line.trim().length > 0).length;
        const words = s.lyrics.trim().split(/\s+/).filter(w => w.length > 0).length;
        totalLines += lines;
        totalWords += words;
      }
    });

    // Find favorite/most used mood
    let favoriteMood = 'None';
    let maxMoodCount = 0;
    for (const [mood, count] of Object.entries(moodCounts)) {
      if (count > maxMoodCount) {
        maxMoodCount = count;
        favoriteMood = mood;
      }
    }

    return {
      totalSongs,
      archivedSongs,
      favoriteSongs,
      favoriteMood,
      totalLines,
      totalWords,
      moodCounts
    };
  }
};
