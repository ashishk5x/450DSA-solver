export default function Loading() {
  return (
    <div className="flex min-h-[60vh] w-full flex-col items-center justify-center space-y-4 px-6">
      {/* Sleek Spinner */}
      <div className="relative h-12 w-12">
        <div className="absolute inset-0 rounded-full border-2 border-border" />
        <div className="absolute inset-0 animate-spin rounded-full border-t-2 border-primary" />
      </div>
      
      {/* Subtle Text */}
      <div className="flex flex-col items-center space-y-1">
        <p className="font-mono text-xs font-medium uppercase tracking-widest text-muted-foreground/70">
          Loading Experience
        </p>
        <div className="h-1 w-24 overflow-hidden rounded-full bg-[#e8e2d9]">
          <div className="h-full w-full origin-left animate-progress bg-primary" />
        </div>
      </div>
    </div>
  )
}
