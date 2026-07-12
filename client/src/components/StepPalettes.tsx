import type { Palette } from '../types';
import PaletteSelector from './PaletteSelector';

interface Props {
  selected: Palette[];
  onChange: (palettes: Palette[]) => void;
}

/** Step 3 - צבעים: a dedicated page for picking favorite color palettes. */
export default function StepPalettes({ selected, onChange }: Props) {
  return (
    <div>
      <div className="mb-6 text-center">
        <h2 className="mb-2 text-xl font-bold text-slate-800">איזה צבעים מדברים אליכם? 🎨</h2>
        <p className="mx-auto max-w-md text-sm leading-relaxed text-slate-500">
          בחרו 3–5 פלטות צבעים שהכי מתאימות לתחושה שאתם רוצים שהאתר ישדר.
          <br />
          אין תשובה נכונה - פשוט לכו עם הבטן. אפשר גם לדלג.
        </p>
      </div>
      <PaletteSelector selected={selected} onChange={onChange} />
    </div>
  );
}
