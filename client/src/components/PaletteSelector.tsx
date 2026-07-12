import { AnimatePresence, motion } from 'framer-motion';
import type { Palette } from '../types';
import { PALETTES } from '../data/palettes';

const MAX_SELECTED = 5;
const RECOMMENDED_MIN = 3;

interface Props {
  selected: Palette[];
  onChange: (palettes: Palette[]) => void;
}

/** Color palette picker — palettes are bundled locally (no API needed). */
export default function PaletteSelector({ selected, onChange }: Props) {
  const isSelected = (p: Palette) => selected.some((s) => s.id === p.id);

  const toggle = (p: Palette) => {
    if (isSelected(p)) {
      onChange(selected.filter((s) => s.id !== p.id));
    } else if (selected.length < MAX_SELECTED) {
      onChange([...selected, p]);
    }
  };

  return (
    <div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {PALETTES.map((palette) => {
          const active = isSelected(palette);
          const disabled = !active && selected.length >= MAX_SELECTED;
          return (
            <motion.button
              key={palette.id}
              type="button"
              onClick={() => toggle(palette)}
              whileTap={{ scale: 0.96 }}
              aria-pressed={active}
              className={`relative overflow-hidden rounded-2xl border-2 shadow-sm transition ${
                active
                  ? 'border-indigo-500 ring-4 ring-indigo-100'
                  : disabled
                    ? 'cursor-not-allowed border-slate-100 opacity-40'
                    : 'border-slate-100 hover:border-indigo-300 hover:shadow-md'
              }`}
            >
              <div className="flex h-16">
                {palette.colors.map((color, i) => (
                  <div key={i} className="flex-1" style={{ backgroundColor: color }} />
                ))}
              </div>
              <AnimatePresence>
                {active && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    className="absolute top-1.5 left-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-indigo-600 text-white shadow"
                  >
                    <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.button>
          );
        })}
      </div>
      <p className="mt-3 text-center text-sm font-medium text-slate-500">
        {selected.length > 0
          ? `נבחרו ${selected.length} מתוך ${MAX_SELECTED}`
          : `לחצו על ${RECOMMENDED_MIN}–${MAX_SELECTED} פלטות שאתם הכי אוהבים`}
      </p>
    </div>
  );
}
