export default function Spinner({ className = '' }) {
  return (
    <div className={`flex justify-center py-12 ${className}`}>
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-faint border-t-brand-accent" />
    </div>
  )
}
