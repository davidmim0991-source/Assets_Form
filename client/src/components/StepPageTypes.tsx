import { motion } from 'framer-motion';
import { PAGE_TYPES } from '../data/pageTypes';

interface Props {
  selected: string[];
  onChange: (pageTypes: string[]) => void;
}

/** Step 4 - סוגי דפים: which website pages the client wants. */
export default function StepPageTypes({ selected, onChange }: Props) {
  const toggle = (id: string) => {
    if (selected.includes(id)) {
      onChange(selected.filter((s) => s !== id));
    } else {
      onChange([...selected, id]);
    }
  };

  return (
    <div>
      <div className="mb-6 text-center">
        <h2 className="mb-2 text-xl font-bold text-slate-800">אילו דפים צריך באתר? 📄</h2>
        <p className="mx-auto max-w-md text-sm leading-relaxed text-slate-500">
          סמנו את סוגי הדפים שתרצו שנבנה עבורכם.
          <br />
          אפשר לבחור כמה שרוצים — אין חובה לסמן הכל.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {PAGE_TYPES.map((page) => {
          const active = selected.includes(page.id);
          return (
            <motion.button
              key={page.id}
              type="button"
              onClick={() => toggle(page.id)}
              whileTap={{ scale: 0.98 }}
              aria-pressed={active}
              className={`flex items-center gap-3 rounded-2xl border-2 px-4 py-3.5 text-right shadow-sm transition ${
                active
                  ? 'border-indigo-500 bg-indigo-50 ring-4 ring-indigo-100'
                  : 'border-slate-100 bg-white hover:border-indigo-300 hover:shadow-md'
              }`}
            >
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
              <span className={`font-semibold ${active ? 'text-indigo-900' : 'text-slate-700'}`}>
                {page.label}
              </span>
            </motion.button>
          );
        })}
      </div>

      <p className="mt-4 text-center text-sm font-medium text-slate-500">
        {selected.length > 0 ? `נבחרו ${selected.length} סוגי דפים` : 'לא נבחרו דפים — אפשר להמשיך בכל מקרה'}
      </p>
    </div>
  );
}
