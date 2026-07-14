import { motion } from 'framer-motion';

const STEPS = ['פרטי העסק', 'העלאת חומרים', 'צבעים', 'סוגי דפים', 'מיתוג'];

interface Props {
  currentStep: number; // 0-based
}

export default function ProgressBar({ currentStep }: Props) {
  const progress = ((currentStep + 1) / STEPS.length) * 100;

  return (
    <div className="mb-8">
      <div className="mb-3 flex items-center justify-between">
        {STEPS.map((label, i) => {
          const isActive = i === currentStep;
          const isDone = i < currentStep;
          return (
            <div key={label} className="flex flex-1 flex-col items-center gap-1.5">
              <motion.div
                animate={{
                  scale: isActive ? 1.1 : 1,
                  backgroundColor: isDone || isActive ? '#4f46e5' : '#e2e8f0',
                  color: isDone || isActive ? '#ffffff' : '#64748b',
                }}
                className="flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold shadow-sm"
              >
                {isDone ? (
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  i + 1
                )}
              </motion.div>
              <span
                className={`text-xs font-medium sm:text-sm ${
                  isActive ? 'text-indigo-600' : 'text-slate-400'
                }`}
              >
                {label}
              </span>
            </div>
          );
        })}
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-slate-200">
        <motion.div
          className="h-full rounded-full bg-gradient-to-l from-indigo-600 to-violet-500"
          initial={false}
          animate={{ width: `${progress}%` }}
          transition={{ type: 'spring', stiffness: 120, damping: 20 }}
        />
      </div>
    </div>
  );
}
