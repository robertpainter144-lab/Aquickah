import json
import sqlite3
import time
import uuid
from pathlib import Path

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel

import seed_data

BASE_DIR = Path(__file__).parent
DB_PATH = BASE_DIR / "aquickah.db"
DIST_DIR = BASE_DIR.parent / "dist"

TIERS = [
    ("Spark", 0),
    ("Ember", 20),
    ("Hearthkeeper", 50),
    ("Lantern-bearer", 120),
    ("Elder Flame", 250),
]


def tier_for(points: int) -> str:
    current = TIERS[0][0]
    for name, minimum in TIERS:
        if points >= minimum:
            current = name
    return current


def stage_for_backers(count: int) -> str:
    if count >= 6:
        return "harvest"
    if count >= 3:
        return "rooted"
    if count >= 1:
        return "sprout"
    return "seed"


def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON")
    return conn


def init_db():
    fresh = not DB_PATH.exists()
    conn = get_db()
    conn.executescript((BASE_DIR / "schema.sql").read_text())
    if fresh:
        for u in seed_data.USERS:
            conn.execute(
                "INSERT INTO users (id, name, town, initials, hearth_points, lantern_opt_in, lantern_note, offerings, needs) "
                "VALUES (:id,:name,:town,:initials,:hearth_points,:lantern_opt_in,:lantern_note,:offerings,:needs)",
                u,
            )
        for r in seed_data.REQUESTS:
            conn.execute(
                "INSERT INTO requests (id,type,title,description,town,requester_id,status,claimed_by_id,hearth_value,urgent,created_at) "
                "VALUES (:id,:type,:title,:description,:town,:requester_id,:status,:claimed_by_id,:hearth_value,:urgent,:created_at)",
                r,
            )
        for p in seed_data.PROJECTS:
            row = dict(p)
            row["backers"] = json.dumps(row["backers"])
            row["skill_shares"] = json.dumps(row["skill_shares"])
            row["testimonials"] = json.dumps(row["testimonials"])
            conn.execute(
                "INSERT INTO projects (id,owner_id,title,description,help_wanted,is_venture,stage,backers,skill_shares,testimonials,created_at) "
                "VALUES (:id,:owner_id,:title,:description,:help_wanted,:is_venture,:stage,:backers,:skill_shares,:testimonials,:created_at)",
                row,
            )
        conn.commit()
    conn.close()


app = FastAPI(title="Aquickah API")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


def user_out(row) -> dict:
    return {
        "id": row["id"],
        "name": row["name"],
        "town": row["town"],
        "initials": row["initials"],
        "hearthPoints": row["hearth_points"],
        "tier": tier_for(row["hearth_points"]),
        "lanternOptIn": bool(row["lantern_opt_in"]),
        "lanternNote": row["lantern_note"],
        "offerings": row["offerings"],
        "needs": row["needs"],
    }


def request_out(row) -> dict:
    return {
        "id": row["id"],
        "type": row["type"],
        "title": row["title"],
        "description": row["description"],
        "town": row["town"],
        "requesterId": row["requester_id"],
        "status": row["status"],
        "claimedById": row["claimed_by_id"],
        "hearthValue": row["hearth_value"],
        "urgent": row["urgent"],
        "createdAt": row["created_at"],
    }


def project_out(row) -> dict:
    return {
        "id": row["id"],
        "ownerId": row["owner_id"],
        "title": row["title"],
        "description": row["description"],
        "helpWanted": row["help_wanted"],
        "isVenture": bool(row["is_venture"]),
        "stage": row["stage"],
        "backers": json.loads(row["backers"]),
        "skillShares": json.loads(row["skill_shares"]),
        "testimonials": json.loads(row["testimonials"]),
        "createdAt": row["created_at"],
    }


def lantern_out(row) -> dict:
    return {
        "id": row["id"],
        "fromUserId": row["from_user_id"],
        "toUserId": row["to_user_id"],
        "message": row["message"],
        "createdAt": row["created_at"],
    }


def award(conn, user_id: str, points: int):
    conn.execute("UPDATE users SET hearth_points = hearth_points + ? WHERE id = ?", (points, user_id))


def now_ms() -> int:
    return int(time.time() * 1000)


def new_id(prefix: str) -> str:
    return f"{prefix}-{now_ms()}-{uuid.uuid4().hex[:6]}"


@app.get("/api/state")
def get_state():
    conn = get_db()
    users = [user_out(r) for r in conn.execute("SELECT * FROM users")]
    requests_ = [request_out(r) for r in conn.execute("SELECT * FROM requests ORDER BY created_at DESC")]
    projects = [project_out(r) for r in conn.execute("SELECT * FROM projects ORDER BY created_at DESC")]
    lantern_actions = [lantern_out(r) for r in conn.execute("SELECT * FROM lantern_actions ORDER BY created_at DESC")]
    conn.close()
    return {"users": users, "requests": requests_, "projects": projects, "lanternActions": lantern_actions}


class CreateUser(BaseModel):
    name: str
    town: str


@app.post("/api/users")
def create_user(body: CreateUser):
    name = body.name.strip()
    if not name:
        raise HTTPException(400, "name required")
    initials = "".join(w[0] for w in name.split()[:2]).upper() or "NN"
    uid = new_id("u")
    conn = get_db()
    conn.execute(
        "INSERT INTO users (id,name,town,initials,hearth_points,lantern_opt_in,lantern_note,offerings,needs) "
        "VALUES (?,?,?,?,0,0,'','','')",
        (uid, name, body.town, initials),
    )
    conn.commit()
    row = conn.execute("SELECT * FROM users WHERE id=?", (uid,)).fetchone()
    conn.close()
    return user_out(row)


class CreateRequest(BaseModel):
    userId: str
    type: str
    title: str
    description: str
    town: str
    urgent: str | None = None


@app.post("/api/requests")
def create_request(body: CreateRequest):
    if body.type not in ("ride", "delivery", "favor"):
        raise HTTPException(400, "invalid type")
    hearth_value = 8 if body.type == "favor" else 5
    rid = new_id("r")
    conn = get_db()
    conn.execute(
        "INSERT INTO requests (id,type,title,description,town,requester_id,status,claimed_by_id,hearth_value,urgent,created_at) "
        "VALUES (?,?,?,?,?,?,'open',NULL,?,?,?)",
        (rid, body.type, body.title.strip(), body.description.strip(), body.town, body.userId, hearth_value, body.urgent, now_ms()),
    )
    conn.commit()
    conn.close()
    return {"ok": True}


class UserAction(BaseModel):
    userId: str


@app.post("/api/requests/{request_id}/claim")
def claim_request(request_id: str, body: UserAction):
    conn = get_db()
    row = conn.execute("SELECT * FROM requests WHERE id=?", (request_id,)).fetchone()
    if not row or row["status"] != "open":
        conn.close()
        raise HTTPException(409, "request not open")
    conn.execute("UPDATE requests SET status='claimed', claimed_by_id=? WHERE id=?", (body.userId, request_id))
    conn.commit()
    conn.close()
    return {"ok": True}


@app.post("/api/requests/{request_id}/complete")
def complete_request(request_id: str, body: UserAction):
    conn = get_db()
    row = conn.execute("SELECT * FROM requests WHERE id=?", (request_id,)).fetchone()
    if not row or row["status"] != "claimed" or not row["claimed_by_id"]:
        conn.close()
        raise HTTPException(409, "request not claimed")
    conn.execute("UPDATE requests SET status='done' WHERE id=?", (request_id,))
    award(conn, row["claimed_by_id"], row["hearth_value"])
    conn.commit()
    conn.close()
    return {"ok": True}


class CreateProject(BaseModel):
    userId: str
    title: str
    description: str
    helpWanted: str
    isVenture: bool


@app.post("/api/projects")
def create_project(body: CreateProject):
    pid = new_id("g")
    conn = get_db()
    conn.execute(
        "INSERT INTO projects (id,owner_id,title,description,help_wanted,is_venture,stage,backers,skill_shares,testimonials,created_at) "
        "VALUES (?,?,?,?,?,?,?,?,?,?,?)",
        (
            pid, body.userId, body.title.strip(), body.description.strip(), body.helpWanted.strip(),
            1 if body.isVenture else 0, "seed" if body.isVenture else None, "[]", "[]", "[]", now_ms(),
        ),
    )
    conn.commit()
    conn.close()
    return {"ok": True}


@app.post("/api/projects/{project_id}/back")
def back_project(project_id: str, body: UserAction):
    conn = get_db()
    row = conn.execute("SELECT * FROM projects WHERE id=?", (project_id,)).fetchone()
    if not row:
        conn.close()
        raise HTTPException(404, "not found")
    backers = json.loads(row["backers"])
    if body.userId in backers:
        conn.close()
        return {"ok": True}
    backers.append(body.userId)
    stage = stage_for_backers(len(backers)) if row["is_venture"] else row["stage"]
    conn.execute("UPDATE projects SET backers=?, stage=? WHERE id=?", (json.dumps(backers), stage, project_id))
    award(conn, body.userId, 6)
    award(conn, row["owner_id"], 6)
    conn.commit()
    conn.close()
    return {"ok": True}


class SkillShare(BaseModel):
    userId: str
    skill: str


@app.post("/api/projects/{project_id}/skill-share")
def skill_share_project(project_id: str, body: SkillShare):
    conn = get_db()
    row = conn.execute("SELECT * FROM projects WHERE id=?", (project_id,)).fetchone()
    if not row:
        conn.close()
        raise HTTPException(404, "not found")
    shares = json.loads(row["skill_shares"])
    shares.append({"userId": body.userId, "skill": body.skill.strip()})
    conn.execute("UPDATE projects SET skill_shares=? WHERE id=?", (json.dumps(shares), project_id))
    award(conn, body.userId, 8)
    award(conn, row["owner_id"], 4)
    conn.commit()
    conn.close()
    return {"ok": True}


class Testify(BaseModel):
    userId: str
    text: str


@app.post("/api/projects/{project_id}/testify")
def testify_project(project_id: str, body: Testify):
    conn = get_db()
    row = conn.execute("SELECT * FROM projects WHERE id=?", (project_id,)).fetchone()
    if not row:
        conn.close()
        raise HTTPException(404, "not found")
    backers = json.loads(row["backers"])
    shares = json.loads(row["skill_shares"])
    has_standing = body.userId in backers or any(s["userId"] == body.userId for s in shares)
    if not has_standing:
        conn.close()
        raise HTTPException(403, "must back or skill-share before testifying")
    testimonials = json.loads(row["testimonials"])
    testimonials.append({"userId": body.userId, "text": body.text.strip()})
    conn.execute("UPDATE projects SET testimonials=? WHERE id=?", (json.dumps(testimonials), project_id))
    award(conn, row["owner_id"], 5)
    conn.commit()
    conn.close()
    return {"ok": True}


class UpdateProfile(BaseModel):
    offerings: str
    needs: str


@app.post("/api/users/{user_id}/profile")
def update_profile(user_id: str, body: UpdateProfile):
    conn = get_db()
    row = conn.execute("SELECT * FROM users WHERE id=?", (user_id,)).fetchone()
    if not row:
        conn.close()
        raise HTTPException(404, "not found")
    conn.execute(
        "UPDATE users SET offerings=?, needs=? WHERE id=?",
        (body.offerings.strip(), body.needs.strip(), user_id),
    )
    conn.commit()
    conn.close()
    return {"ok": True}


class LanternOptIn(BaseModel):
    userId: str
    note: str


@app.post("/api/lantern/toggle")
def toggle_lantern(body: LanternOptIn):
    conn = get_db()
    row = conn.execute("SELECT * FROM users WHERE id=?", (body.userId,)).fetchone()
    if not row:
        conn.close()
        raise HTTPException(404, "not found")
    new_state = 0 if row["lantern_opt_in"] else 1
    conn.execute("UPDATE users SET lantern_opt_in=?, lantern_note=? WHERE id=?", (new_state, body.note.strip(), body.userId))
    conn.commit()
    conn.close()
    return {"ok": True}


class LightLantern(BaseModel):
    fromUserId: str
    toUserId: str
    message: str


@app.post("/api/lantern/light")
def light_lantern(body: LightLantern):
    conn = get_db()
    lid = new_id("l")
    conn.execute(
        "INSERT INTO lantern_actions (id, from_user_id, to_user_id, message, created_at) VALUES (?,?,?,?,?)",
        (lid, body.fromUserId, body.toUserId, body.message.strip(), now_ms()),
    )
    award(conn, body.fromUserId, 12)
    award(conn, body.toUserId, 12)
    conn.commit()
    conn.close()
    return {"ok": True}


init_db()

if DIST_DIR.exists():
    app.mount("/", StaticFiles(directory=str(DIST_DIR), html=True), name="static")
