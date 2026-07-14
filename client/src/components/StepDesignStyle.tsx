import { motion } from 'framer-motion';
import { DESIGN_STYLES } from '../data/designStyles';

interface Props {
  selected: string | null;
  onChange: (id: string | null) => void;
}

/** Step — סגנון עיצוב: pick exactly one of 12 design directions. */
export default function StepDesignStyle({ selected, onChange }: Props) {
  const toggle = (id: string) => {
    onChange(selected === id ? null : id);
  };

  return (
    <div>
      <div className="mb-6 text-center">
        <h2 className="mb-2 text-xl font-bold text-slate-800">איזה סגנון עיצוב מתאים לכם? ✨</h2>
        <p className="mx-auto max-w-md text-sm leading-relaxed text-slate-500">
          בחרו סגנון אחד שהכי מדבר אליכם.
          <br />
          אפשר לדלג ולהמשיך — אבל בחירה אחת עוזרת לנו לדייק את הכיוון.
        </p>
      </div>

      <div className="max-h-[28rem] space-y-3 overflow-y-auto pr-1">
        {DESIGN_STYLES.map((style, index) => {
          const active = selected === style.id;
          return (
            <motion.button
              key={style.id}
              type="button"
              onClick={() => toggle(style.id)}
              whileTap={{ scale: 0.99 }}
              aria-pressed={active}
              className={`w-full rounded-2xl border-2 p-4 text-right shadow-sm transition ${
                active
                  ? 'border-indigo-500 bg-indigo-50 ring-4 ring-indigo-100'
                  : 'border-slate-100 bg-white hover:border-indigo-300 hover:shadow-md'
              }`}
            >
              <div className="mb-2 flex items-start justify-between gap-3">
                <span
                  className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 transition ${
                    active ? 'border-indigo-600 bg-indigo-600 text-white' : 'border-slate-300 bg-white'
                  }`}
                >
                  {active && (
                    <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </span>
                <div className="flex-1">
                  <p className="text-sm font-medium text-slate-400">{index + 1}.</p>
                  <p className={`text-base font-bold ${active ? 'text-indigo-900' : 'text-slate-800'}`}>
                    {style.title}
                  </p>
                </div>
              </div>
              <ul className="mb-2 list-inside list-disc space-y-0.5 text-sm text-slate-600">
                {style.traits.map((trait) => (
                  <li key={trait}>{trait}</li>
                ))}
              </ul>
              <p className="text-sm text-slate-500">
                <span className="font-semibold text-slate-600">מתאים ל: </span>
                {style.suitableFor}
              </p>
            </motion.button>
          );
        })}
      </div>

      <p className="mt-4 text-center text-sm font-medium text-slate-500">
        {selected
          ? `נבחר: ${DESIGN_STYLES.find((s) => s.id === selected)?.title}`
          : 'לא נבחר סגנון — אפשר להמשיך בכל מקרה'}
      </p>
    </div>
  );
}
