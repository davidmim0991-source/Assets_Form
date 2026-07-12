import { Router } from 'express';
import { submissionUpload } from '../middleware/upload.middleware';
import { handleSubmission } from '../controllers/submission.controller';
import { handleGetPalettes } from '../controllers/palettes.controller';

const router = Router();

/**
 * POST /api/submissions
 * multipart/form-data:
 *   - data: JSON string with all form fields
 *   - logo / testimonials / images / videos / documents: file fields
 */
router.post('/submissions', submissionUpload, handleSubmission);

/** GET /api/palettes - color palettes parsed from the palettes Google Doc. */
router.get('/palettes', handleGetPalettes);

export default router;
