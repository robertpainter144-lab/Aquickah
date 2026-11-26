export type Town =
  | 'Edgartown'
  | 'Oak Bluffs'
  | 'Vineyard Haven'
  | 'West Tisbury'
  | 'Chilmark'
  | 'Aquinnah'
  | 'Menemsha'

export type RequestType = 'ride' | 'delivery' | 'favor'
export type RequestStatus = 'open' | 'claimed' | 'done'

export interface HelpRequest {
  id: string
  type: RequestType
  title: string
  description: string
  town: Town
  requesterId: string
  status: RequestStatus
  claimedById?: string
  hearthValue: number
  urgent?: string
  createdAt: number
}

export type VentureStage = 'seed' | 'sprout' | 'rooted' | 'harvest'

export interface Testimonial {
  userId: string
  text: string
}

export interface GrangeProject {
  id: string
  ownerId: string
  title: string
  description: string
  helpWanted: string
  isVenture: boolean
  stage?: VentureStage
  backers: string[]
  skillShares: { userId: string; skill: string }[]
  testimonials: Testimonial[]
  createdAt: number
}

export interface LanternAction {
  id: string
  fromUserId: string
  toUserId: string
  message: string
  createdAt: number
}

export interface User {
  id: string
  name: string
  town: Town
  initials: string
  hearthPoints: number
  lanternOptIn: boolean
  lanternNote: string
  offerings: string
  needs: string
}

export interface AquickahState {
  users: User[]
  requests: HelpRequest[]
  projects: GrangeProject[]
  lanternActions: LanternAction[]
}

export const TOWNS: Town[] = [
  'Edgartown',
  'Oak Bluffs',
  'Vineyard Haven',
  'West Tisbury',
  'Chilmark',
  'Aquinnah',
  'Menemsha',
]

export const TIERS = [
  { name: 'Spark', min: 0 },
  { name: 'Ember', min: 20 },
  { name: 'Hearthkeeper', min: 50 },
  { name: 'Lantern-bearer', min: 120 },
  { name: 'Elder Flame', min: 250 },
] as const

export function tierFor(points: number) {
  let current: (typeof TIERS)[number] = TIERS[0]
  for (const t of TIERS) {
    if (points >= t.min) current = t
  }
  return current
}

export const VENTURE_STAGES: { key: VentureStage; label: string; badge: string }[] = [
  { key: 'seed', label: 'Seed', badge: 'Seed-sower' },
  { key: 'sprout', label: 'Sprout', badge: 'Sprout-tender' },
  { key: 'rooted', label: 'Rooted', badge: 'Root-setter' },
  { key: 'harvest', label: 'Harvest', badge: 'Harvest-keeper' },
]

export function stageForBackers(backers: number): VentureStage {
  if (backers >= 6) return 'harvest'
  if (backers >= 3) return 'rooted'
  if (backers >= 1) return 'sprout'
  return 'seed'
}
