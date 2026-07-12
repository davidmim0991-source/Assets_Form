import { motion } from 'framer-motion';

/** Success page shown after a submission completes, with a check animation. */
export default function SuccessScreen() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.85, y: 24 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 100, damping: 14 }}
      className="mx-auto max-w-lg rounded-[2rem] bg-white p-10 text-center shadow-xl shadow-indigo-500/10 sm:p-14"
    >
      <div className="relative mx-auto mb-6 h-24 w-24">
        <motion.div
          initial={{ scale: 0.6, opacity: 0 }}
          animate={{ scale: [1, 1.2, 1], opacity: [0.35, 0.1, 0.35] }}
          transition={{ delay: 0.3, duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute inset-0 rounded-full bg-emerald-300/50"
        />
        <motion.div
          initial={{ scale: 0, rotate: -30 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ delay: 0.1, type: 'spring', stiffness: 220, damping: 12 }}
          className="relative flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-bl from-emerald-400 to-teal-500 shadow-lg shadow-emerald-500/30"
        >
          <svg className="h-12 w-12 text-white" viewBox="0 0 24 24" fill="none">
            <motion.path
              d="M5 13l4 4L19 7"
              stroke="currentColor"
              strokeWidth={3}
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="transparent"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 1 }}
              transition={{ delay: 0.45, duration: 0.6, ease: 'easeOut' }}
            />
          </svg>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.65, duration: 0.4 }}
      >
        <h2 className="mb-4 text-3xl font-extrabold text-slate-800">תודה!</h2>
        <p className="text-lg leading-relaxed text-slate-600">
          החומרים התקבלו בהצלחה.
          <br />
          אפשר להתחיל לבנות את האתר 😊
        </p>
      </motion.div>
    </motion.div>
  );
}
