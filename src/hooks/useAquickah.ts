import { useCallback, useEffect, useState } from 'react'
import { SEED_STATE } from '../data/seed'
import type {
  AquickahState,
  GrangeProject,
  HelpRequest,
  RequestType,
  Town,
} from '../types'
import { stageForBackers } from '../types'

const STORAGE_KEY = 'aquickah-state-v1'

function load(): AquickahState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return JSON.parse(raw) as AquickahState
  } catch {
    // fall through to seed
  }
  return structuredClone(SEED_STATE)
}

export function useAquickah() {
  const [state, setState] = useState<AquickahState>(load)

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  }, [state])

  const currentUser = state.users.find((u) => u.id === state.currentUserId)!

  const award = useCallback((userId: string, points: number) => {
    setState((s) => ({
      ...s,
      users: s.users.map((u) =>
        u.id === userId ? { ...u, hearthPoints: u.hearthPoints + points } : u,
      ),
    }))
  }, [])

  const addRequest = useCallback(
    (data: { type: RequestType; title: string; description: string; town: Town; urgent?: string }) => {
      const hearthValue = data.type === 'favor' ? 8 : 5
      const req: HelpRequest = {
        id: `r-${Date.now()}`,
        type: data.type,
        title: data.title,
        description: data.description,
        town: data.town,
        urgent: data.urgent,
        requesterId: state.currentUserId,
        status: 'open',
        hearthValue,
        createdAt: Date.now(),
      }
      setState((s) => ({ ...s, requests: [req, ...s.requests] }))
    },
    [state.currentUserId],
  )

  const claimRequest = useCallback(
    (id: string) => {
      setState((s) => ({
        ...s,
        requests: s.requests.map((r) =>
          r.id === id ? { ...r, status: 'claimed', claimedById: s.currentUserId } : r,
        ),
      }))
    },
    [],
  )

  const completeRequest = useCallback(
    (id: string) => {
      const req = state.requests.find((r) => r.id === id)
      if (!req || !req.claimedById) return
      setState((s) => ({
        ...s,
        requests: s.requests.map((r) => (r.id === id ? { ...r, status: 'done' } : r)),
      }))
      award(req.claimedById, req.hearthValue)
    },
    [state.requests, award],
  )

  const addGrangeProject = useCallback(
    (data: { title: string; description: string; helpWanted: string; isVenture: boolean }) => {
      const project: GrangeProject = {
        id: `g-${Date.now()}`,
        ownerId: state.currentUserId,
        title: data.title,
        description: data.description,
        helpWanted: data.helpWanted,
        isVenture: data.isVenture,
        stage: data.isVenture ? 'seed' : undefined,
        backers: [],
        skillShares: [],
        testimonials: [],
        createdAt: Date.now(),
      }
      setState((s) => ({ ...s, projects: [project, ...s.projects] }))
    },
    [state.currentUserId],
  )

  const backVenture = useCallback(
    (projectId: string) => {
      const project = state.projects.find((p) => p.id === projectId)
      if (!project || project.backers.includes(state.currentUserId)) return
      setState((s) => ({
        ...s,
        projects: s.projects.map((p) => {
          if (p.id !== projectId) return p
          const backers = [...p.backers, s.currentUserId]
          return { ...p, backers, stage: p.isVenture ? stageForBackers(backers.length) : p.stage }
        }),
      }))
      award(state.currentUserId, 6)
      award(project.ownerId, 6)
    },
    [state.projects, state.currentUserId, award],
  )

  const skillShareVenture = useCallback(
    (projectId: string, skill: string) => {
      const project = state.projects.find((p) => p.id === projectId)
      if (!project) return
      setState((s) => ({
        ...s,
        projects: s.projects.map((p) =>
          p.id === projectId
            ? { ...p, skillShares: [...p.skillShares, { userId: s.currentUserId, skill }] }
            : p,
        ),
      }))
      award(state.currentUserId, 8)
      award(project.ownerId, 4)
    },
    [state.projects, state.currentUserId, award],
  )

  const testifyVenture = useCallback(
    (projectId: string, text: string) => {
      const project = state.projects.find((p) => p.id === projectId)
      if (!project) return
      const hasStanding =
        project.backers.includes(state.currentUserId) ||
        project.skillShares.some((s) => s.userId === state.currentUserId)
      if (!hasStanding) return
      setState((s) => ({
        ...s,
        projects: s.projects.map((p) =>
          p.id === projectId
            ? { ...p, testimonials: [...p.testimonials, { userId: s.currentUserId, text }] }
            : p,
        ),
      }))
      award(project.ownerId, 5)
    },
    [state.projects, state.currentUserId, award],
  )

  const toggleLanternOptIn = useCallback(
    (note: string) => {
      setState((s) => ({
        ...s,
        users: s.users.map((u) =>
          u.id === s.currentUserId
            ? { ...u, lanternOptIn: !u.lanternOptIn, lanternNote: note }
            : u,
        ),
      }))
    },
    [],
  )

  const lightLantern = useCallback(
    (toUserId: string, message: string) => {
      setState((s) => ({
        ...s,
        lanternActions: [
          { id: `l-${Date.now()}`, fromUserId: s.currentUserId, toUserId, message, createdAt: Date.now() },
          ...s.lanternActions,
        ],
      }))
      award(state.currentUserId, 12)
      award(toUserId, 12)
    },
    [state.currentUserId, award],
  )

  return {
    state,
    currentUser,
    addRequest,
    claimRequest,
    completeRequest,
    addGrangeProject,
    backVenture,
    skillShareVenture,
    testifyVenture,
    toggleLanternOptIn,
    lightLantern,
  }
}
