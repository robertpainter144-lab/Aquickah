import { useCallback, useEffect, useRef, useState } from 'react'
import * as api from '../api'
import type { AquickahState, RequestType, Town } from '../types'

const IDENTITY_KEY = 'aquickah-my-user-id'
const POLL_MS = 4000

export function useAquickah() {
  const [state, setState] = useState<AquickahState | null>(null)
  const [myUserId, setMyUserIdState] = useState<string | null>(() => localStorage.getItem(IDENTITY_KEY))
  const [error, setError] = useState<string | null>(null)
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const refresh = useCallback(async () => {
    try {
      const data = await api.fetchState()
      setState(data)
      setError(null)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not reach the Aquickah server')
    }
  }, [])

  useEffect(() => {
    refresh()
    pollRef.current = setInterval(refresh, POLL_MS)
    return () => {
      if (pollRef.current) clearInterval(pollRef.current)
    }
  }, [refresh])

  const setMyUserId = useCallback((id: string) => {
    localStorage.setItem(IDENTITY_KEY, id)
    setMyUserIdState(id)
  }, [])

  const joinAsNew = useCallback(
    async (name: string, town: Town) => {
      const user = await api.createUser(name, town)
      await refresh()
      setMyUserId((user as { id: string }).id)
    },
    [refresh, setMyUserId],
  )

  const currentUser = state && myUserId ? state.users.find((u) => u.id === myUserId) : undefined

  const addRequest = useCallback(
    async (data: { type: RequestType; title: string; description: string; town: Town; urgent?: string }) => {
      if (!myUserId) return
      await api.createRequest({ userId: myUserId, ...data })
      await refresh()
    },
    [myUserId, refresh],
  )

  const doClaimRequest = useCallback(
    async (id: string) => {
      if (!myUserId) return
      await api.claimRequest(id, myUserId)
      await refresh()
    },
    [myUserId, refresh],
  )

  const doCompleteRequest = useCallback(
    async (id: string) => {
      if (!myUserId) return
      await api.completeRequest(id, myUserId)
      await refresh()
    },
    [myUserId, refresh],
  )

  const addGrangeProject = useCallback(
    async (data: { title: string; description: string; helpWanted: string; isVenture: boolean }) => {
      if (!myUserId) return
      await api.createProject({ userId: myUserId, ...data })
      await refresh()
    },
    [myUserId, refresh],
  )

  const doBackVenture = useCallback(
    async (projectId: string) => {
      if (!myUserId) return
      await api.backProject(projectId, myUserId)
      await refresh()
    },
    [myUserId, refresh],
  )

  const doSkillShareVenture = useCallback(
    async (projectId: string, skill: string) => {
      if (!myUserId) return
      await api.skillShareProject(projectId, myUserId, skill)
      await refresh()
    },
    [myUserId, refresh],
  )

  const doTestifyVenture = useCallback(
    async (projectId: string, text: string) => {
      if (!myUserId) return
      await api.testifyProject(projectId, myUserId, text)
      await refresh()
    },
    [myUserId, refresh],
  )

  const doUpdateProfile = useCallback(
    async (offerings: string, needs: string) => {
      if (!myUserId) return
      await api.updateProfile(myUserId, offerings, needs)
      await refresh()
    },
    [myUserId, refresh],
  )

  const doToggleLanternOptIn = useCallback(
    async (note: string) => {
      if (!myUserId) return
      await api.toggleLanternOptIn(myUserId, note)
      await refresh()
    },
    [myUserId, refresh],
  )

  const doLightLantern = useCallback(
    async (toUserId: string, message: string) => {
      if (!myUserId) return
      await api.lightLantern(myUserId, toUserId, message)
      await refresh()
    },
    [myUserId, refresh],
  )

  return {
    state,
    error,
    myUserId,
    currentUser,
    joinAsNew,
    setMyUserId,
    addRequest,
    claimRequest: doClaimRequest,
    completeRequest: doCompleteRequest,
    addGrangeProject,
    updateProfile: doUpdateProfile,
    backVenture: doBackVenture,
    skillShareVenture: doSkillShareVenture,
    testifyVenture: doTestifyVenture,
    toggleLanternOptIn: doToggleLanternOptIn,
    lightLantern: doLightLantern,
  }
}
