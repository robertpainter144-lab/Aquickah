export function ScallopTrim() {
  return <div className="scallop-trim" aria-hidden />
}

export function LighthouseGlow() {
  return (
    <div
      aria-hidden
      className="lighthouse-glow pointer-events-none absolute -top-10 right-4 h-28 w-28 rounded-full bg-gold/40 blur-2xl"
    />
  )
}

/** A small mophead hydrangea bloom — the Vineyard's signature flower, built from overlapping petal circles. */
export function Hydrangea({ className = 'h-10 w-10' }: { className?: string }) {
  const petals = [
    { cx: 20, cy: 10, fill: 'var(--color-hydrangea)' },
    { cx: 30, cy: 17, fill: 'var(--color-ember)' },
    { cx: 28, cy: 29, fill: 'var(--color-hydrangea)' },
    { cx: 16, cy: 31, fill: 'var(--color-gold)' },
    { cx: 9, cy: 20, fill: 'var(--color-hydrangea)' },
    { cx: 20, cy: 20, fill: 'var(--color-trim)' },
  ]
  return (
    <svg viewBox="0 0 40 40" className={className} aria-hidden>
      {petals.map((p, i) => (
        <circle key={i} cx={p.cx} cy={p.cy} r={7} fill={p.fill} opacity={0.88} />
      ))}
    </svg>
  )
}
