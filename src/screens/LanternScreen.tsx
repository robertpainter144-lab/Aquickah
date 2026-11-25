import { useState } from 'react'
import { Field, Sheet, inputClass } from '../components/Sheet'
import type { User } from '../types'

function LanternEntry({
  user,
  onLight,
}: {
  user: User
  onLight: (message: string) => void
}) {
  const [open, setOpen] = useState(false)
  const [message, setMessage] = useState('')

  return (
    <div className="rounded-2xl border border-gold/30 bg-gradient-to-b from-ember-soft/40 to-surface p-4">
      <div className="flex items-center gap-2">
        <span className="text-lg" aria-hidden>
          🏮
        </span>
        <span className="font-display text-base font-medium text-paper">{user.name}</span>
        <span className="text-xs text-muted">· {user.town}</span>
      </div>
      <p className="mt-2 text-sm leading-relaxed text-paper/90">{user.lanternNote}</p>

      {!open ? (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="mt-3 rounded-full bg-gold px-4 py-1.5 text-xs font-semibold text-ink"
        >
          Light a Lantern
        </button>
      ) : (
        <div className="mt-3 flex flex-col gap-2">
          <input
            className={inputClass}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="A short, low-pressure note — a dinner invite, a porch visit…"
          />
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => {
                if (!message.trim()) return
                onLight(message.trim())
                setMessage('')
                setOpen(false)
              }}
              className="flex-1 rounded-xl bg-gold py-2 text-xs font-semibold text-ink"
            >
              Send
            </button>
            <button type="button" onClick={() => setOpen(false)} className="rounded-xl border border-hairline px-3 text-xs text-muted">
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export function LanternScreen({
  users,
  currentUser,
  onLight,
  onToggleOptIn,
}: {
  users: User[]
  currentUser: User
  onLight: (toUserId: string, message: string) => void
  onToggleOptIn: (note: string) => void
}) {
  const [note, setNote] = useState(currentUser.lanternNote)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const entries = users.filter((u) => u.lanternOptIn && u.id !== currentUser.id)

  return (
    <div className="pb-24">
      <div className="sticky top-0 z-10 border-b border-hairline bg-ink/95 px-4 pb-3 pt-[calc(env(safe-area-inset-top)+16px)] backdrop-blur">
        <h1 className="font-display text-2xl font-medium text-paper">The Lantern List</h1>
        <p className="mt-0.5 text-xs text-muted">
          Neighbors who'd welcome company this season. No addresses, no pressure — just a note and a door that's open.
        </p>
      </div>

      <div className="flex flex-col gap-3 px-4 pt-4">
        <button
          type="button"
          onClick={() => setSettingsOpen(true)}
          className={`rounded-2xl border px-4 py-3 text-left text-sm font-medium ${
            currentUser.lanternOptIn
              ? 'border-gold/40 bg-gold/10 text-gold'
              : 'border-hairline text-muted'
          }`}
        >
          {currentUser.lanternOptIn
            ? 'Your lantern is lit — tap to edit your note'
            : "Add yourself to the list — it's okay to want company"}
        </button>

        {entries.map((u) => (
          <LanternEntry key={u.id} user={u} onLight={(message) => onLight(u.id, message)} />
        ))}
        {entries.length === 0 && (
          <p className="py-10 text-center text-sm text-muted">No one else has lit a lantern yet.</p>
        )}
      </div>

      <Sheet open={settingsOpen} title="Your lantern" onClose={() => setSettingsOpen(false)}>
        <Field label="A short note for neighbors (optional, but it helps)">
          <textarea className={inputClass} rows={3} value={note} onChange={(e) => setNote(e.target.value)} />
        </Field>
        <button
          type="button"
          onClick={() => {
            onToggleOptIn(note)
            setSettingsOpen(false)
          }}
          className="w-full rounded-xl bg-gold py-3 text-sm font-semibold text-ink"
        >
          {currentUser.lanternOptIn ? 'Take myself off the list' : 'Light my lantern'}
        </button>
      </Sheet>
    </div>
  )
}
