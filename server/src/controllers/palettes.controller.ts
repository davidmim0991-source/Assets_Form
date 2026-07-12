import { NextFunction, Request, Response } from 'express';
import { getPalettes } from '../services/palettes.service';

/** GET /api/palettes - returns the selectable color palettes for the form. */
export async function handleGetPalettes(_req: Request, res: Response, next: NextFunction) {
  try {
    const palettes = await getPalettes();
    res.json({ palettes });
  } catch (err) {
    next(err);
  }
}
