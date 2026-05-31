import express from 'express';
import { getSongs, getSongById, createSong, updateSong, deleteSong, duplicateSong } from '../controllers/songController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// All song routes are protected by JWT authentication
router.use(protect);

router.route('/')
  .get(getSongs)
  .post(createSong);

router.route('/:id')
  .get(getSongById)
  .put(updateSong)
  .delete(deleteSong);

router.post('/:id/duplicate', duplicateSong);

export default router;
