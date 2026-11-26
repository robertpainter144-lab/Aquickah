import { useState } from 'react'
import { TIERS, tierFor, type AquickahState } from '../types'
import { TierPill } from '../components/Pills'
import { Field, inputClass } from '../components/Sheet'
import { ScallopTrim } from '../components/Decorative'

export function ProfileScreen({
  state,
  myUserId,
  onSaveProfile,
}: {
  state: AquickahState
  myUserId: string
  onSaveProfile: (offerings: string, needs: string) => Promise<void>
}) {
  const user = state.users.find((u) => u.id === myUserId)!
  const tier = tierFor(user.hearthPoints)
  const nextTier = TIERS.find((t) => t.min > user.hearthPoints)
  const [offerings, setOfferings] = useState(user.offerings)
  const [needs, setNeeds] = useState(user.needs)
  const [saving, setSaving] = useState(false)
  const dirty = offerings !== user.offerings || needs !== user.needs

  async function save() {
    setSaving(true)
    try {
      await onSaveProfile(offerings, needs)
    } finally {
      setSaving(false)
    }
  }

  const given = [
    ...state.requests.filter((r) => r.claimedById === user.id && r.status === 'done'),
  ]
  const posted = state.requests.filter((r) => r.requesterId === user.id)
  const lanternSent = state.lanternActions.filter((l) => l.fromUserId === user.id)
  const lanternReceived = state.lanternActions.filter((l) => l.toUserId === user.id)

  return (
    <div className="pb-24">
      <div className="sticky top-0 z-10 bg-ink/95 px-4 pb-3 pt-[calc(env(safe-area-inset-top)+16px)] backdrop-blur">
        <h1 className="font-display text-2xl font-medium text-paper">Profile</h1>
      </div>
      <ScallopTrim />

      <div className="px-4 pt-4">
        <div className="flex items-center gap-4 rounded-2xl border border-hairline bg-surface p-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-full border-2 border-gold/60 bg-ember/20 font-display text-lg text-ember">
            {user.initials}
          </div>
          <div className="flex-1">
            <div className="font-display text-lg font-medium text-paper">{user.name}</div>
            <div className="text-xs text-muted">{user.town}</div>
          </div>
          <TierPill points={user.hearthPoints} />
        </div>

        <div className="mt-3 rounded-2xl border border-hairline bg-surface p-4">
          <div className="flex items-baseline justify-between">
            <span className="font-display text-2xl font-medium text-gold tabular-nums">{user.hearthPoints}</span>
            <span className="text-xs text-muted">Hearth Points</span>
          </div>
          {nextTier && (
            <>
              <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-ink">
                <div
                  className="h-full rounded-full bg-gold"
                  style={{
                    width: `${Math.min(100, (user.hearthPoints / nextTier.min) * 100)}%`,
                  }}
                />
              </div>
              <p className="mt-1.5 text-xs text-muted">
                {nextTier.min - user.hearthPoints} points to {nextTier.name}
              </p>
            </>
          )}
          {!nextTier && <p className="mt-1.5 text-xs text-muted">{tier.name} — the highest tier. Elder Flames mentor the newest ventures.</p>}
        </div>

        <div className="mt-3 grid grid-cols-3 gap-2 text-center">
          <div className="rounded-xl border border-hairline bg-surface py-3">
            <div className="font-display text-lg text-paper tabular-nums">{given.length}</div>
            <div className="text-[11px] text-muted">Favors given</div>
          </div>
          <div className="rounded-xl border border-hairline bg-surface py-3">
            <div className="font-display text-lg text-paper tabular-nums">{posted.length}</div>
            <div className="text-[11px] text-muted">Requests posted</div>
          </div>
          <div className="rounded-xl border border-hairline bg-surface py-3">
            <div className="font-display text-lg text-paper tabular-nums">{lanternSent.length + lanternReceived.length}</div>
            <div className="text-[11px] text-muted">Lanterns lit</div>
          </div>
        </div>

        <div className="mt-4 rounded-2xl border border-hairline bg-surface p-4">
          <Field label="What I can offer">
            <textarea className={inputClass} rows={2} value={offerings} onChange={(e) => setOfferings(e.target.value)} />
          </Field>
          <Field label="What I could use">
            <textarea className={inputClass} rows={2} value={needs} onChange={(e) => setNeeds(e.target.value)} />
          </Field>
          {dirty && (
            <button
              type="button"
              onClick={save}
              disabled={saving}
              className="w-full rounded-xl bg-ember py-2.5 text-sm font-semibold text-ink disabled:opacity-50"
            >
              {saving ? 'Saving…' : 'Save'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
