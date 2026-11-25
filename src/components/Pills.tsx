import { tierFor, VENTURE_STAGES, type RequestStatus, type VentureStage } from '../types'

export function TierPill({ points }: { points: number }) {
  const tier = tierFor(points)
  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-gold/40 bg-gold/10 px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-gold">
      {tier.name}
    </span>
  )
}

const STATUS_STYLE: Record<RequestStatus, string> = {
  open: 'border-moss/40 bg-moss/10 text-moss',
  claimed: 'border-ember/40 bg-ember/10 text-ember',
  done: 'border-hairline bg-surface-raised text-muted',
}

const STATUS_LABEL: Record<RequestStatus, string> = {
  open: 'Open',
  claimed: 'Claimed',
  done: 'Done',
}

export function StatusPill({ status }: { status: RequestStatus }) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide ${STATUS_STYLE[status]}`}
    >
      {STATUS_LABEL[status]}
    </span>
  )
}

export function StagePill({ stage }: { stage: VentureStage }) {
  const idx = VENTURE_STAGES.findIndex((s) => s.key === stage)
  const def = VENTURE_STAGES[idx]
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-ember/40 bg-ember/10 px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-ember">
      <span className="flex gap-0.5">
        {VENTURE_STAGES.map((s, i) => (
          <span
            key={s.key}
            className={`h-1.5 w-1.5 rounded-full ${i <= idx ? 'bg-ember' : 'bg-ember/20'}`}
          />
        ))}
      </span>
      {def.label}
    </span>
  )
}
