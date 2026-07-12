import { motion } from 'framer-motion';

/** Success page shown after a submission completes, with a check animation. */
export default function SuccessScreen() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: 'spring', stiffness: 120, damping: 16 }}
      className="mx-auto max-w-lg rounded-[2rem] bg-white p-10 text-center shadow-xl shadow-indigo-500/10 sm:p-14"
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.15, type: 'spring', stiffness: 200, damping: 14 }}
        className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-bl from-emerald-400 to-teal-500 shadow-lg shadow-emerald-500/30"
      >
        <svg className="h-12 w-12 text-white" viewBox="0 0 24 24" fill="none">
          <motion.path
            d="M5 13l4 4L19 7"
            stroke="currentColor"
            strokeWidth={3}
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ delay: 0.4, duration: 0.5, ease: 'easeOut' }}
          />
        </svg>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
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
