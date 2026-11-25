# Aquickah — Lovable build prompt

Paste everything in the fenced block below into Lovable (lovable.dev) as your
first message to generate the app. Lovable ships a responsive React app
(Vite + Tailwind + shadcn, Supabase backend) — on an iPhone it installs via
Safari's "Add to Home Screen," on Android via Chrome's "Add to Home Screen" /
install prompt. That's the real "quick working app for both iPhone and
Android": one codebase, no app-store review, live in minutes. If you later
want it listed in the App Store / Play Store, that's a separate step
(wrap with Capacitor + Apple/Google developer accounts) — skip it for the POC.

---

```
Build "Aquickah" — a private, invite-only neighbor-to-neighbor app for
Martha's Vineyard. It's an Uber-like app for RIDES, FOOD DELIVERY, and
NEIGHBORLY FAVORS, wrapped around a social merit system and a community
board for people's own projects. Tone: agrarian + future-tech-shaman — warm,
a little mystical, grounded in seasons and hearths, not corporate. Dark,
lantern-lit visual style by default: deep indigo/charcoal background, warm
amber/ember accent, subtle star-field texture, rounded warm cards, serif
display headers paired with a clean sans body. Avoid generic SaaS blue,
avoid rounded-everything flat-design clichés.

CORE PURPOSE
This is a winter-focused community tool for Martha's Vineyard. The island
empties out and gets quiet after summer; people who are single or
family-less feel that isolation most during the holidays. The app's real
job is to make it easy and low-stakes for neighbors to help each other
practically (rides, food, errands) AND to surface warm social connection on
purpose, especially in December.

FEATURE: THE FEED (home screen)
- Tabbed or filterable list: Rides ("Wagon Calls"), Food Deliveries ("Hearth
  Deliveries"), Favors ("Barnraising"), All.
- Each request card shows: type icon, title, short description, MV town
  (Edgartown, Oak Bluffs, Vineyard Haven/Tisbury, West Tisbury, Chilmark,
  Aquinnah, Menemsha), requester first name + avatar, time posted, status
  pill (Open / Claimed / Done), and a Hearth Point reward estimate.
- Floating "+" button opens the post flow.
- Tapping Open cards lets another user "Claim" it; claimed cards show who
  claimed them and let either side mark it Done.

FEATURE: POST A REQUEST
- Pick type (Ride / Delivery / Favor), write title + description, pick town,
  optional urgency flag ("before the storm," "today," "this week").
- App suggests a Hearth Point value based on type and effort (Favor > Ride >
  Delivery by default, editable).

FEATURE: THE GRANGE (community project board + "Island Ventures" track)
- A separate board from the favor economy: people post what they're
  building or working on for themselves (a solar dehydrator, a cookbook of
  island winter recipes, a modular synth EP, a greenhouse repair) and what
  kind of collaboration or company they'd want — not a task to complete,
  a project to be part of.
- Others can "pull up a chair" to a project — signals interest, starts a
  thread, doesn't require any Hearth Point exchange.
- GAMIFIED BUSINESS TRACK: any Grange project can be flagged "This is a
  budding business." Flagged projects get a visible stage pill the founder
  advances themselves as it's true: Seed (idea posted) → Sprout (first
  sale/first customer) → Rooted (recurring customers, 3+ months) → Harvest
  (profitable and/or hiring locally).
- Neighbors can take three actions on a venture, each earning both sides
  Hearth Points: "Back It" (pledge to be a first customer), "Skill-Share"
  (offer a specific skill the founder needs), "Testify" (leave a short
  testimonial after actually using it — Testify only unlocks after a Back
  It or Skill-Share from that same person, so testimonials stay honest).
- A separate badge track from Hearth tiers, earned by founders at each
  stage: Seed-sower → Sprout-tender → Root-setter → Harvest-keeper. This
  recognizes founders distinctly from helpful neighbors rather than
  conflating the two roles.
- A single collective counter on the Grange header — "X island ventures
  sprouted this season" — celebrates community momentum, not individual
  competition; no public leaderboard ranking people against each other.
- Lantern-bearer/Elder Flame tier users occasionally see a prompt to
  mentor a Seed-stage venture; a completed mentorship (founder confirms)
  earns bonus Hearth Points for the mentor.

FEATURE: THE LANTERN LIST (winter loneliness feature — this is the
emotional core of the app, do not treat as an afterthought)
- Opt-in only. A toggle in Profile: "I'd welcome company this season," with
  an optional short note (e.g., "First Christmas on-island without family,
  would love a dinner invite or just a porch visit").
- A browsable list (first name, town, note only — no exact address) of
  everyone currently opted in.
- A "Light a Lantern" action on any entry: sends that person a direct,
  low-pressure invite/check-in message. Completing a Lantern connection
  awards BOTH people bonus Hearth Points (more than a normal favor, since
  this is the thing the app most wants to encourage).
- Gets a visually distinct treatment on the home screen during
  Nov 15–Jan 15 (a literal lit-lantern visual motif, not just a banner) —
  make this feel ceremonial/seasonal, not like a notification badge.

FEATURE: MERIT SYSTEM — "Hearth Points"
- Points are earned only by action, never purchased:
  Ride = 5, Delivery = 5, Favor = 8, Lantern List connection = 12.
- Tiers, each with a name and a small badge/icon, shown on profile and next
  to a user's name app-wide:
  Spark (0–19) → Ember (20–49) → Hearthkeeper (50–119) →
  Lantern-bearer (120–249) → Elder Flame (250+).
- An "About Hearth Points" screen explaining the philosophy in plain
  language: this isn't currency, it's recognition for showing up; higher
  tiers surface you more prominently in The Grange and in Lantern List
  matches, nothing more.

FEATURE: PROFILE
- Avatar, name, town, current Hearth Point total + tier badge.
- Editable "What I can offer" / "What I could use" free-text fields.
- History list of favors/rides/deliveries given and received.
- Lantern List opt-in toggle + note (see above).

DATA MODEL (use Supabase)
- users: id, name, town, avatar_url, hearth_points, lantern_opt_in (bool),
  lantern_note, offerings (text), needs (text)
- requests: id, type (ride|delivery|favor), title, description, town,
  requester_id, status (open|claimed|done), claimed_by, hearth_point_value,
  created_at
- grange_projects: id, owner_id, title, description, help_wanted,
  created_at
- lantern_actions: id, from_user_id, to_user_id, message, created_at

MOBILE UX
- Bottom tab bar: Feed / Grange / Lantern / Profile.
- Single floating action button on Feed for posting a request.
- Thumb-reachable primary actions (Claim, Light a Lantern) near the bottom
  of each card, not top-right.
- Fully responsive — this must look and work well as an installed
  home-screen app on both iPhone Safari and Android Chrome.

SEED DATA
Populate with ~10 realistic Martha's Vineyard winter requests across all
three types and ~4 Grange projects and ~3 Lantern List entries so the app
feels alive on first load, not empty.

Do NOT add payment processing, real-time chat infra, or push notifications
in this first pass — this is a proof of concept to validate the concept and
flows, not a production backend.
```
