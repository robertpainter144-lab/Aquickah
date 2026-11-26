import type { AquickahState, RequestType, Town } from './types'

async function call<T>(path: string, body?: unknown): Promise<T> {
  const res = await fetch(path, {
    method: body === undefined ? 'GET' : 'POST',
    headers: body === undefined ? undefined : { 'Content-Type': 'application/json' },
    body: body === undefined ? undefined : JSON.stringify(body),
  })
  if (!res.ok) {
    const detail = await res.text()
    throw new Error(`${path} failed (${res.status}): ${detail}`)
  }
  return res.json() as Promise<T>
}

export function fetchState() {
  return call<AquickahState>('/api/state')
}

export function createUser(name: string, town: Town) {
  return call('/api/users', { name, town })
}

export function createRequest(data: {
  userId: string
  type: RequestType
  title: string
  description: string
  town: Town
  urgent?: string
}) {
  return call('/api/requests', data)
}

export function claimRequest(requestId: string, userId: string) {
  return call(`/api/requests/${requestId}/claim`, { userId })
}

export function completeRequest(requestId: string, userId: string) {
  return call(`/api/requests/${requestId}/complete`, { userId })
}

export function createProject(data: {
  userId: string
  title: string
  description: string
  helpWanted: string
  isVenture: boolean
}) {
  return call('/api/projects', data)
}

export function backProject(projectId: string, userId: string) {
  return call(`/api/projects/${projectId}/back`, { userId })
}

export function skillShareProject(projectId: string, userId: string, skill: string) {
  return call(`/api/projects/${projectId}/skill-share`, { userId, skill })
}

export function testifyProject(projectId: string, userId: string, text: string) {
  return call(`/api/projects/${projectId}/testify`, { userId, text })
}

export function updateProfile(userId: string, offerings: string, needs: string) {
  return call(`/api/users/${userId}/profile`, { offerings, needs })
}

export function toggleLanternOptIn(userId: string, note: string) {
  return call('/api/lantern/toggle', { userId, note })
}

export function lightLantern(fromUserId: string, toUserId: string, message: string) {
  return call('/api/lantern/light', { fromUserId, toUserId, message })
}
