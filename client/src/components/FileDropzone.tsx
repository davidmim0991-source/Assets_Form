import { useCallback, useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

interface Props {
  label: string;
  hint?: string;
  accept?: string;
  files: File[];
  onChange: (files: File[]) => void;
  icon: React.ReactNode;
}

function formatSize(bytes: number): string {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)}KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
}

const MAX_FILE_MB = 500;

/**
 * Drag & drop upload card with multiple files, image previews and
 * client-side size validation.
 */
export default function FileDropzone({ label, hint, accept, files, onChange, icon }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [sizeError, setSizeError] = useState<string | null>(null);
  const [previews, setPreviews] = useState<Map<File, string>>(new Map());

  // Manage object URLs for image previews and revoke them when files change.
  useEffect(() => {
    const map = new Map<File, string>();
    files.forEach((f) => {
      if (f.type.startsWith('image/')) map.set(f, URL.createObjectURL(f));
    });
    setPreviews(map);
    return () => map.forEach((url) => URL.revokeObjectURL(url));
  }, [files]);

  const addFiles = useCallback(
    (incoming: FileList | File[]) => {
      const list = Array.from(incoming);
      const tooBig = list.filter((f) => f.size > MAX_FILE_MB * 1024 * 1024);
      const ok = list.filter((f) => f.size <= MAX_FILE_MB * 1024 * 1024);
      setSizeError(
        tooBig.length > 0
          ? `הקבצים הבאים גדולים מ־${MAX_FILE_MB}MB ולא נוספו: ${tooBig.map((f) => f.name).join(', ')}`
          : null
      );
      if (ok.length > 0) {
        // Skip duplicates (same name + size).
        const existing = new Set(files.map((f) => `${f.name}|${f.size}`));
        onChange([...files, ...ok.filter((f) => !existing.has(`${f.name}|${f.size}`))]);
      }
    },
    [files, onChange]
  );

  const removeFile = (index: number) => {
    onChange(files.filter((_, i) => i !== index));
  };

  return (
    <div>
      <div
        role="button"
        tabIndex={0}
        onClick={() => inputRef.current?.click()}
        onKeyDown={(e) => e.key === 'Enter' && inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          addFiles(e.dataTransfer.files);
        }}
        className={`cursor-pointer rounded-3xl border-2 border-dashed p-6 text-center transition-all sm:p-8 ${
          dragging
            ? 'scale-[1.01] border-indigo-500 bg-indigo-50/80 shadow-lg shadow-indigo-500/10'
            : 'border-slate-200 bg-white hover:border-indigo-300 hover:bg-indigo-50/40'
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          multiple
          accept={accept}
          className="hidden"
          onChange={(e) => {
            if (e.target.files) addFiles(e.target.files);
            e.target.value = '';
          }}
        />
        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-100 text-indigo-600">
          {icon}
        </div>
        <p className="font-semibold text-slate-700">{label}</p>
        <p className="mt-1 text-sm text-slate-400">
          {hint || 'גררו קבצים לכאן או לחצו לבחירה'}
        </p>
      </div>

      {sizeError && <p className="mt-2 text-sm text-rose-500">{sizeError}</p>}

      <AnimatePresence>
        {files.length > 0 && (
          <motion.ul
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2"
          >
            {files.map((file, i) => (
              <motion.li
                key={`${file.name}-${file.size}`}
                layout
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-white p-2.5 shadow-sm"
              >
                {previews.get(file) ? (
                  <img
                    src={previews.get(file)}
                    alt={file.name}
                    className="h-11 w-11 shrink-0 rounded-xl object-cover"
                  />
                ) : (
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-400">
                    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
                      />
                    </svg>
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-slate-700">{file.name}</p>
                  <p className="text-xs text-slate-400">{formatSize(file.size)}</p>
                </div>
                <button
                  type="button"
                  onClick={() => removeFile(i)}
                  aria-label={`הסרת ${file.name}`}
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-slate-400 transition hover:bg-rose-50 hover:text-rose-500"
                >
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </motion.li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
}
