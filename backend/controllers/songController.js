import { dbService } from '../services/dbService.js';

/**
 * @desc    Get all rap songs for user (supports search, sort, filter)
 * @route   GET /api/songs
 * @access  Private
 */
export const getSongs = async (req, res) => {
  try {
    const userId = req.user._id;
    const songs = await dbService.findSongs(userId, req.query);
    return res.json(songs);
  } catch (error) {
    console.error('Get songs error:', error);
    return res.status(500).json({ message: 'Server error retrieving songs' });
  }
};

/**
 * @desc    Get a single rap song by ID
 * @route   GET /api/songs/:id
 * @access  Private
 */
export const getSongById = async (req, res) => {
  try {
    const userId = req.user._id;
    const song = await dbService.findSongById(req.params.id, userId);

    if (!song) {
      return res.status(404).json({ message: 'Song not found or unauthorized' });
    }

    return res.json(song);
  } catch (error) {
    console.error('Get song by ID error:', error);
    return res.status(500).json({ message: 'Server error retrieving song' });
  }
};

/**
 * @desc    Create a new rap song
 * @route   POST /api/songs
 * @access  Private
 */
export const createSong = async (req, res) => {
  const { title, lyrics, mood, tags } = req.body;

  try {
    const userId = req.user._id;
    
    const newSong = await dbService.createSong({
      userId,
      title: title || 'Untitled Rap Song',
      lyrics: lyrics || '',
      mood: mood || 'Freestyle',
      tags: tags || []
    });

    return res.status(201).json(newSong);
  } catch (error) {
    console.error('Create song error:', error);
    return res.status(500).json({ message: 'Server error creating song' });
  }
};

/**
 * @desc    Update an existing rap song
 * @route   PUT /api/songs/:id
 * @access  Private
 */
export const updateSong = async (req, res) => {
  const { title, lyrics, mood, tags, archived, favorite } = req.body;

  try {
    const userId = req.user._id;
    const song = await dbService.findSongById(req.params.id, userId);

    if (!song) {
      return res.status(404).json({ message: 'Song not found or unauthorized' });
    }

    const updates = {};
    if (title !== undefined) updates.title = title;
    if (lyrics !== undefined) updates.lyrics = lyrics;
    if (mood !== undefined) updates.mood = mood;
    if (tags !== undefined) updates.tags = tags;
    if (archived !== undefined) updates.archived = archived;
    if (favorite !== undefined) updates.favorite = favorite;

    const updatedSong = await dbService.updateSong(req.params.id, userId, updates);
    return res.json(updatedSong);
  } catch (error) {
    console.error('Update song error:', error);
    return res.status(500).json({ message: 'Server error updating song' });
  }
};

/**
 * @desc    Delete a rap song
 * @route   DELETE /api/songs/:id
 * @access  Private
 */
export const deleteSong = async (req, res) => {
  try {
    const userId = req.user._id;
    const song = await dbService.findSongById(req.params.id, userId);

    if (!song) {
      return res.status(404).json({ message: 'Song not found or unauthorized' });
    }

    await dbService.deleteSong(req.params.id, userId);
    return res.json({ message: 'Song deleted successfully' });
  } catch (error) {
    console.error('Delete song error:', error);
    return res.status(500).json({ message: 'Server error deleting song' });
  }
};

/**
 * @desc    Duplicate a rap song
 * @route   POST /api/songs/:id/duplicate
 * @access  Private
 */
export const duplicateSong = async (req, res) => {
  try {
    const userId = req.user._id;
    const song = await dbService.findSongById(req.params.id, userId);

    if (!song) {
      return res.status(404).json({ message: 'Song not found or unauthorized' });
    }

    // Create a new song copy
    const duplicatedSong = await dbService.createSong({
      userId,
      title: `${song.title} (Copy)`,
      lyrics: song.lyrics,
      mood: song.mood,
      tags: [...(song.tags || [])],
      favorite: false,
      archived: false
    });

    return res.status(201).json(duplicatedSong);
  } catch (error) {
    console.error('Duplicate song error:', error);
    return res.status(500).json({ message: 'Server error duplicating song' });
  }
};
