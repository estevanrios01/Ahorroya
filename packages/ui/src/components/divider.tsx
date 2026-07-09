interface DividerProps {
  className?: string;
  label?: string;
}

export function Divider({ className = '', label }: DividerProps) {
  if (label) {
    return (
      <div className={`flex items-center gap-3 ${className}`}>
        <div className="flex-1 h-px bg-zinc-800" />
        <span className="text-xs text-zinc-500 uppercase tracking-wider font-medium">{label}</span>
        <div className="flex-1 h-px bg-zinc-800" />
      </div>
    );
  }
  return <div className={`h-px bg-zinc-800 ${className}`} />;
}
