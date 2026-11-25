import { useMemo, useState } from 'react'
import { Field, Sheet, inputClass } from '../components/Sheet'
import { StagePill } from '../components/Pills'
import type { GrangeProject, User } from '../types'

function ProjectCard({
  project,
  owner,
  currentUserId,
  onBack,
  onSkillShare,
  onTestify,
}: {
  project: GrangeProject
  owner: User | undefined
  currentUserId: string
  onBack: () => void
  onSkillShare: (skill: string) => void
  onTestify: (text: string) => void
}) {
  const [skill, setSkill] = useState('')
  const [testimony, setTestimony] = useState('')
  const isOwner = project.ownerId === currentUserId
  const hasBacked = project.backers.includes(currentUserId)
  const hasSkillShared = project.skillShares.some((s) => s.userId === currentUserId)
  const canTestify = hasBacked || hasSkillShared

  return (
    <article className="rounded-2xl border border-hairline bg-surface p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="text-xs font-semibold uppercase tracking-wide text-muted">
          {owner?.name ?? 'Neighbor'} · {owner?.town}
        </div>
        {project.isVenture && project.stage && <StagePill stage={project.stage} />}
      </div>
      <h3 className="mt-2 font-display text-base font-medium leading-snug text-paper">{project.title}</h3>
      <p className="mt-1.5 text-sm leading-relaxed text-muted">{project.description}</p>
      <p className="mt-2 text-xs text-ember">Wants: {project.helpWanted}</p>

      {project.isVenture ? (
        <div className="mt-3 flex items-center gap-4 text-xs text-muted">
          <span>{project.backers.length} backer{project.backers.length === 1 ? '' : 's'}</span>
          <span>{project.skillShares.length} skill-share{project.skillShares.length === 1 ? '' : 's'}</span>
          <span>{project.testimonials.length} testimonial{project.testimonials.length === 1 ? '' : 's'}</span>
        </div>
      ) : null}

      {!isOwner && (
        <div className="mt-3 flex flex-wrap gap-2">
          {project.isVenture && (
            <button
              type="button"
              disabled={hasBacked}
              onClick={onBack}
              className="rounded-full border border-ember/50 px-3 py-1.5 text-xs font-semibold text-ember disabled:opacity-40"
            >
              {hasBacked ? 'Backed' : 'Back It'}
            </button>
          )}
          {project.isVenture && (
            <details className="w-full">
              <summary className="cursor-pointer list-none rounded-full border border-hairline px-3 py-1.5 text-xs font-semibold text-muted inline-block">
                Skill-Share
              </summary>
              <div className="mt-2 flex gap-2">
                <input
                  className={inputClass}
                  value={skill}
                  onChange={(e) => setSkill(e.target.value)}
                  placeholder="What can you offer?"
                />
                <button
                  type="button"
                  onClick={() => {
                    if (!skill.trim()) return
                    onSkillShare(skill.trim())
                    setSkill('')
                  }}
                  className="rounded-xl bg-ember px-3 text-xs font-semibold text-ink"
                >
                  Offer
                </button>
              </div>
            </details>
          )}
          {!project.isVenture && (
            <button
              type="button"
              onClick={() => onSkillShare('Pulled up a chair')}
              className="rounded-full border border-hairline px-3 py-1.5 text-xs font-semibold text-muted"
            >
              Pull up a chair
            </button>
          )}
          {project.isVenture && canTestify && (
            <details className="w-full">
              <summary className="cursor-pointer list-none rounded-full border border-hairline px-3 py-1.5 text-xs font-semibold text-muted inline-block">
                Testify
              </summary>
              <div className="mt-2 flex gap-2">
                <input
                  className={inputClass}
                  value={testimony}
                  onChange={(e) => setTestimony(e.target.value)}
                  placeholder="What was it like to use this?"
                />
                <button
                  type="button"
                  onClick={() => {
                    if (!testimony.trim()) return
                    onTestify(testimony.trim())
                    setTestimony('')
                  }}
                  className="rounded-xl bg-ember px-3 text-xs font-semibold text-ink"
                >
                  Send
                </button>
              </div>
            </details>
          )}
        </div>
      )}

      {project.testimonials.length > 0 && (
        <ul className="mt-3 space-y-1 border-t border-hairline pt-2">
          {project.testimonials.map((t, i) => (
            <li key={i} className="text-xs italic text-muted">
              “{t.text}”
            </li>
          ))}
        </ul>
      )}
    </article>
  )
}

export function GrangeScreen({
  projects,
  users,
  currentUserId,
  onBack,
  onSkillShare,
  onTestify,
  onAdd,
}: {
  projects: GrangeProject[]
  users: User[]
  currentUserId: string
  onBack: (id: string) => void
  onSkillShare: (id: string, skill: string) => void
  onTestify: (id: string, text: string) => void
  onAdd: (data: { title: string; description: string; helpWanted: string; isVenture: boolean }) => void
}) {
  const [open, setOpen] = useState(false)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [helpWanted, setHelpWanted] = useState('')
  const [isVenture, setIsVenture] = useState(false)

  const userById = useMemo(() => new Map(users.map((u) => [u.id, u])), [users])
  const ventureCount = projects.filter((p) => p.isVenture).length

  function submit() {
    if (!title.trim() || !description.trim()) return
    onAdd({ title: title.trim(), description: description.trim(), helpWanted: helpWanted.trim(), isVenture })
    setTitle('')
    setDescription('')
    setHelpWanted('')
    setIsVenture(false)
    setOpen(false)
  }

  return (
    <div className="pb-24">
      <div className="sticky top-0 z-10 border-b border-hairline bg-ink/95 px-4 pb-3 pt-[calc(env(safe-area-inset-top)+16px)] backdrop-blur">
        <h1 className="font-display text-2xl font-medium text-paper">The Grange</h1>
        <p className="mt-0.5 text-xs text-muted">
          Projects, big and small — and{' '}
          <span className="font-semibold text-ember">{ventureCount} island ventures</span> sprouted this season.
        </p>
      </div>

      <div className="flex flex-col gap-3 px-4 pt-4">
        {projects.map((p) => (
          <ProjectCard
            key={p.id}
            project={p}
            owner={userById.get(p.ownerId)}
            currentUserId={currentUserId}
            onBack={() => onBack(p.id)}
            onSkillShare={(skill) => onSkillShare(p.id, skill)}
            onTestify={(text) => onTestify(p.id, text)}
          />
        ))}
      </div>

      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Post a project"
        className="fixed bottom-24 right-5 flex h-14 w-14 items-center justify-center rounded-full bg-ember text-2xl text-ink shadow-lg"
      >
        +
      </button>

      <Sheet open={open} title="Bring something to the Grange" onClose={() => setOpen(false)}>
        <Field label="What are you working on">
          <input className={inputClass} value={title} onChange={(e) => setTitle(e.target.value)} />
        </Field>
        <Field label="Tell neighbors about it">
          <textarea className={inputClass} rows={3} value={description} onChange={(e) => setDescription(e.target.value)} />
        </Field>
        <Field label="What kind of help or company would you want">
          <input className={inputClass} value={helpWanted} onChange={(e) => setHelpWanted(e.target.value)} />
        </Field>
        <label className="mb-4 flex items-center gap-2 text-sm text-paper">
          <input type="checkbox" checked={isVenture} onChange={(e) => setIsVenture(e.target.checked)} className="h-4 w-4 accent-ember" />
          This is a budding business, not just a hobby
        </label>
        <button type="button" onClick={submit} className="w-full rounded-xl bg-ember py-3 text-sm font-semibold text-ink">
          Post to the Grange
        </button>
      </Sheet>
    </div>
  )
}
