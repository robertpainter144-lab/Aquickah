import { useState } from 'react'
import { TabBar, type Tab } from './components/TabBar'
import { useAquickah } from './hooks/useAquickah'
import { FeedScreen } from './screens/FeedScreen'
import { GrangeScreen } from './screens/GrangeScreen'
import { IdentityScreen } from './screens/IdentityScreen'
import { LanternScreen } from './screens/LanternScreen'
import { ProfileScreen } from './screens/ProfileScreen'

export default function App() {
  const [tab, setTab] = useState<Tab>('feed')
  const {
    state,
    error,
    myUserId,
    currentUser,
    joinAsNew,
    setMyUserId,
    addRequest,
    claimRequest,
    completeRequest,
    addGrangeProject,
    updateProfile,
    backVenture,
    skillShareVenture,
    testifyVenture,
    toggleLanternOptIn,
    lightLantern,
  } = useAquickah()

  if (!myUserId || !state || !currentUser) {
    return (
      <div className="mx-auto min-h-svh max-w-md bg-ink">
        <IdentityScreen state={state} error={error} onPick={setMyUserId} onJoin={joinAsNew} />
      </div>
    )
  }

  return (
    <div className="mx-auto min-h-svh max-w-md bg-ink">
      {tab === 'feed' && (
        <FeedScreen
          requests={state.requests}
          users={state.users}
          currentUserId={myUserId}
          onClaim={claimRequest}
          onComplete={completeRequest}
          onAdd={addRequest}
        />
      )}
      {tab === 'grange' && (
        <GrangeScreen
          projects={state.projects}
          users={state.users}
          currentUserId={myUserId}
          onBack={backVenture}
          onSkillShare={skillShareVenture}
          onTestify={testifyVenture}
          onAdd={addGrangeProject}
        />
      )}
      {tab === 'lantern' && (
        <LanternScreen
          users={state.users}
          currentUser={currentUser}
          onLight={lightLantern}
          onToggleOptIn={toggleLanternOptIn}
        />
      )}
      {tab === 'profile' && <ProfileScreen state={state} myUserId={myUserId} onSaveProfile={updateProfile} />}

      <TabBar active={tab} onChange={setTab} />
    </div>
  )
}
