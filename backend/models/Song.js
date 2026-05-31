import mongoose from 'mongoose';

const songSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true,
    default: 'Untitled Rap Song',
    trim: true
  },
  lyrics: {
    type: String,
    default: ''
  },
  mood: {
    type: String,
    enum: ['Drill', 'Trap', 'Boom Bap', 'Freestyle', 'Conscious', 'Storytelling'],
    default: 'Freestyle'
  },
  tags: [{
    type: String,
    trim: true
  }],
  archived: {
    type: Boolean,
    default: false
  },
  favorite: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

const Song = mongoose.model('Song', songSchema);
export default Song;
