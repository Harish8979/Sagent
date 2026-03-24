export function SeatLegend() {
  const items = [
    { label: 'Available', className: 'bg-white border-emerald-500' },
    { label: 'Your selection', className: 'bg-amber-100 border-amber-300' },
    { label: 'Unavailable', className: 'bg-slate-200 border-slate-300' },
    { label: 'Prime section', className: 'bg-cyan-100 border-cyan-300' },
    { label: 'Classic section', className: 'bg-sky-100 border-sky-300' },
  ];

  return (
    <div className="flex flex-wrap gap-3">
      {items.map((item) => (
        <div key={item.label} className="flex items-center gap-2 text-sm text-slate-300">
          <span className={`h-4 w-4 rounded-md border ${item.className}`} />
          {item.label}
        </div>
      ))}
    </div>
  );
}
