import { useEffect } from 'react'

export default function Modal({ title, onClose, children, size = 'md' }) {
  useEffect(() => {
    const fn = (e) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', fn)
    return () => window.removeEventListener('keydown', fn)
  }, [onClose])

  const maxW = size === 'lg' ? 'sm:max-w-xl' : 'sm:max-w-md'

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end sm:justify-center sm:items-center sm:p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className={`relative w-full ${maxW} rounded-t-2xl sm:rounded-2xl shadow-2xl max-h-[90vh] flex flex-col
        bg-white dark:bg-zinc-900 border-0 dark:border dark:border-zinc-700`}
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 dark:border-zinc-800 shrink-0">
          <h3 className="font-semibold text-slate-800 dark:text-zinc-100 text-base">{title}</h3>
          <button
            onClick={onClose}
            className="h-8 w-8 flex items-center justify-center rounded-full text-slate-400 dark:text-zinc-500 hover:bg-slate-100 dark:hover:bg-zinc-800 hover:text-slate-700 dark:hover:text-zinc-300 text-xl leading-none transition-colors"
          >
            ×
          </button>
        </div>
        <div className="overflow-y-auto p-4">{children}</div>
      </div>
    </div>
  )
}
