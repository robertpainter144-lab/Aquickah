import { useState } from 'react'
import { Field, inputClass } from '../components/Sheet'
import type { AquickahState, Town } from '../types'
import { TOWNS } from '../types'

export function IdentityScreen({
  state,
  error,
  onPick,
  onJoin,
}: {
  state: AquickahState | null
  error: string | null
  onPick: (id: string) => void
  onJoin: (name: string, town: Town) => Promise<void>
}) {
  const [joining, setJoining] = useState(false)
  const [name, setName] = useState('')
  const [town, setTown] = useState<Town>('West Tisbury')
  const [submitting, setSubmitting] = useState(false)

  async function submit() {
    if (!name.trim()) return
    setSubmitting(true)
    try {
      await onJoin(name.trim(), town)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="flex min-h-svh flex-col justify-center px-6 py-12">
      <div className="mx-auto w-full max-w-sm">
        <div className="mb-8 text-center">
          <div className="text-3xl">🏮</div>
          <h1 className="mt-2 font-display text-2xl font-medium text-paper">Aquickah</h1>
          <p className="mt-1 text-sm text-muted">Which neighbor are you?</p>
        </div>

        {error && !state && (
          <p className="mb-4 rounded-xl border border-cranberry/40 bg-cranberry/10 p-3 text-sm text-cranberry">
            Can't reach the Aquickah server. Make sure it's running, then reload.
          </p>
        )}

        {!state && !error && <p className="text-center text-sm text-muted">Loading neighbors…</p>}

        {state && (
          <div className="flex flex-col gap-2">
            {state.users.map((u) => (
              <button
                key={u.id}
                type="button"
                onClick={() => onPick(u.id)}
                className="flex items-center gap-3 rounded-2xl border border-hairline bg-surface px-4 py-3 text-left hover:border-ember/50"
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-ember/20 font-display text-sm text-ember">
                  {u.initials}
                </span>
                <span>
                  <span className="block text-sm font-semibold text-paper">{u.name}</span>
                  <span className="block text-xs text-muted">{u.town}</span>
                </span>
              </button>
            ))}

            {!joining ? (
              <button
                type="button"
                onClick={() => setJoining(true)}
                className="mt-2 rounded-2xl border border-dashed border-hairline px-4 py-3 text-sm font-medium text-muted"
              >
                I'm new here
              </button>
            ) : (
              <div className="mt-2 rounded-2xl border border-hairline bg-surface p-4">
                <Field label="Your name">
                  <input className={inputClass} value={name} onChange={(e) => setName(e.target.value)} autoFocus />
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
                <button
                  type="button"
                  disabled={submitting}
                  onClick={submit}
                  className="w-full rounded-xl bg-ember py-3 text-sm font-semibold text-ink disabled:opacity-50"
                >
                  {submitting ? 'Joining…' : 'Join the neighborhood'}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
