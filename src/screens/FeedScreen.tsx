import { useMemo, useState } from 'react'
import { Field, Sheet, inputClass } from '../components/Sheet'
import { StatusPill } from '../components/Pills'
import type { HelpRequest, RequestType, Town, User } from '../types'
import { TOWNS } from '../types'

const TYPE_META: Record<RequestType, { label: string; icon: string }> = {
  ride: { label: 'Wagon Call', icon: '🐎' },
  delivery: { label: 'Hearth Delivery', icon: '🥖' },
  favor: { label: 'Barnraising', icon: '🤝' },
}

function timeAgo(ts: number) {
  const mins = Math.round((Date.now() - ts) / 60000)
  if (mins < 60) return `${mins}m ago`
  const hours = Math.round(mins / 60)
  if (hours < 24) return `${hours}h ago`
  return `${Math.round(hours / 24)}d ago`
}

function RequestCard({
  request,
  requester,
  claimer,
  isMine,
  onClaim,
  onComplete,
}: {
  request: HelpRequest
  requester: User | undefined
  claimer: User | undefined
  isMine: boolean
  onClaim: () => void
  onComplete: () => void
}) {
  const meta = TYPE_META[request.type]
  return (
    <article className="rounded-2xl border border-hairline bg-surface p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-ember">
          <span aria-hidden>{meta.icon}</span>
          {meta.label}
        </div>
        <StatusPill status={request.status} />
      </div>
      <h3 className="mt-2 font-display text-base font-medium leading-snug text-paper">
        {request.title}
      </h3>
      <p className="mt-1.5 text-sm leading-relaxed text-muted">{request.description}</p>
      <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted">
        <span>{request.town}</span>
        <span className="text-hairline">·</span>
        <span>{requester?.name ?? 'Neighbor'}</span>
        <span className="text-hairline">·</span>
        <span>{timeAgo(request.createdAt)}</span>
        {request.urgent && (
          <>
            <span className="text-hairline">·</span>
            <span className="text-ember">{request.urgent}</span>
          </>
        )}
      </div>
      <div className="mt-3 flex items-center justify-between">
        <span className="text-xs font-semibold text-gold">+{request.hearthValue} Hearth Points</span>
        {request.status === 'open' && !isMine && (
          <button
            type="button"
            onClick={onClaim}
            className="rounded-full bg-ember px-4 py-1.5 text-xs font-semibold text-ink"
          >
            Claim
          </button>
        )}
        {request.status === 'claimed' && claimer && (
          <span className="text-xs text-muted">
            {isMine ? `${claimer.name} is on it` : `Claimed by ${claimer.name}`}
          </span>
        )}
        {request.status === 'claimed' && isMine && (
          <button
            type="button"
            onClick={onComplete}
            className="rounded-full border border-moss/50 px-4 py-1.5 text-xs font-semibold text-moss"
          >
            Mark done
          </button>
        )}
      </div>
    </article>
  )
}

export function FeedScreen({
  requests,
  users,
  currentUserId,
  onClaim,
  onComplete,
  onAdd,
}: {
  requests: HelpRequest[]
  users: User[]
  currentUserId: string
  onClaim: (id: string) => void
  onComplete: (id: string) => void
  onAdd: (data: { type: RequestType; title: string; description: string; town: Town; urgent?: string }) => void
}) {
  const [filter, setFilter] = useState<RequestType | 'all'>('all')
  const [open, setOpen] = useState(false)
  const [type, setType] = useState<RequestType>('favor')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [town, setTown] = useState<Town>('West Tisbury')
  const [urgent, setUrgent] = useState('')

  const userById = useMemo(() => new Map(users.map((u) => [u.id, u])), [users])

  const filtered = requests
    .filter((r) => filter === 'all' || r.type === filter)
    .sort((a, b) => b.createdAt - a.createdAt)

  function submit() {
    if (!title.trim() || !description.trim()) return
    onAdd({ type, title: title.trim(), description: description.trim(), town, urgent: urgent.trim() || undefined })
    setTitle('')
    setDescription('')
    setUrgent('')
    setOpen(false)
  }

  return (
    <div className="pb-24">
      <div className="sticky top-0 z-10 border-b border-hairline bg-ink/95 px-4 pb-3 pt-[calc(env(safe-area-inset-top)+16px)] backdrop-blur">
        <div className="flex items-center justify-between">
          <h1 className="font-display text-2xl font-medium text-paper">Aquickah</h1>
          <span className="text-xl" aria-hidden>
            🏮
          </span>
        </div>
        <p className="mt-0.5 text-xs text-ember">Winter Session — the Lantern List is lit through Jan 15</p>
        <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
          {(['all', 'ride', 'delivery', 'favor'] as const).map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setFilter(f)}
              className={`shrink-0 rounded-full border px-3 py-1 text-xs font-semibold capitalize ${
                filter === f
                  ? 'border-ember bg-ember/15 text-ember'
                  : 'border-hairline text-muted'
              }`}
            >
              {f === 'all' ? 'All' : TYPE_META[f].label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-3 px-4 pt-4">
        {filtered.map((r) => (
          <RequestCard
            key={r.id}
            request={r}
            requester={userById.get(r.requesterId)}
            claimer={r.claimedById ? userById.get(r.claimedById) : undefined}
            isMine={r.requesterId === currentUserId}
            onClaim={() => onClaim(r.id)}
            onComplete={() => onComplete(r.id)}
          />
        ))}
        {filtered.length === 0 && (
          <p className="py-10 text-center text-sm text-muted">Nothing here yet — be the first to ask.</p>
        )}
      </div>

      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Post a request"
        className="fixed bottom-24 right-5 flex h-14 w-14 items-center justify-center rounded-full bg-ember text-2xl text-ink shadow-lg"
      >
        +
      </button>

      <Sheet open={open} title="Ask the neighborhood" onClose={() => setOpen(false)}>
        <Field label="Type">
          <div className="flex gap-2">
            {(['ride', 'delivery', 'favor'] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setType(t)}
                className={`flex-1 rounded-xl border px-2 py-2 text-xs font-semibold ${
                  type === t ? 'border-ember bg-ember/15 text-ember' : 'border-hairline text-muted'
                }`}
              >
                {TYPE_META[t].icon} {TYPE_META[t].label}
              </button>
            ))}
          </div>
        </Field>
        <Field label="Title">
          <input className={inputClass} value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Ride from the ferry, hands full" />
        </Field>
        <Field label="What's going on">
          <textarea
            className={inputClass}
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Give enough detail that a neighbor can say yes with confidence."
          />
        </Field>
        <Field label="Town">
          <select className={inputClass} value={town} onChange={(e) => setTown(e.target.value as Town)}>
            {TOWNS.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Urgency (optional)">
          <input className={inputClass} value={urgent} onChange={(e) => setUrgent(e.target.value)} placeholder="Before the storm, today, this week…" />
        </Field>
        <button type="button" onClick={submit} className="mt-1 w-full rounded-xl bg-ember py-3 text-sm font-semibold text-ink">
          Post to the Feed
        </button>
      </Sheet>
    </div>
  )
}
