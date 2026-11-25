export type Tab = 'feed' | 'grange' | 'lantern' | 'profile'

const TABS: { key: Tab; label: string; icon: string }[] = [
  { key: 'feed', label: 'Feed', icon: '🌾' },
  { key: 'grange', label: 'Grange', icon: '🔨' },
  { key: 'lantern', label: 'Lantern', icon: '🏮' },
  { key: 'profile', label: 'Profile', icon: '🜂' },
]

export function TabBar({ active, onChange }: { active: Tab; onChange: (t: Tab) => void }) {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-20 border-t border-hairline bg-surface/95 backdrop-blur pb-[env(safe-area-inset-bottom)]">
      <div className="mx-auto flex max-w-md">
        {TABS.map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => onChange(t.key)}
            className={`flex flex-1 flex-col items-center gap-1 py-2.5 text-[11px] font-medium tracking-wide transition-colors ${
              active === t.key ? 'text-ember' : 'text-muted'
            }`}
          >
            <span className="text-lg leading-none" aria-hidden>
              {t.icon}
            </span>
            {t.label}
          </button>
        ))}
      </div>
    </nav>
  )
}
