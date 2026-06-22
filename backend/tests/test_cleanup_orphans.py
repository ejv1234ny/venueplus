"""Orphan-upload cleanup cron: keep referenced/recent objects, delete old orphans."""
from datetime import datetime, timezone, timedelta

from models import User, UserRole, Venue
from services import storage as storage_mod


def _owner_venue(session, images):
    u = User(email="o@t.test", hashed_password="x", first_name="O", last_name="W",
             role=UserRole.VENUE_OWNER, is_active=True, is_verified=True)
    session.add(u); session.commit(); session.refresh(u)
    v = Venue(owner_id=u.id, title="V", description="d", venue_type="rooftop",
              address="a", city="C", state="S", zip_code="z", capacity=10,
              price_per_hour=5.0, minimum_hours=1, images=images, is_active=True)
    session.add(v); session.commit()
    return v


def _mock_storage(monkeypatch, objs, base="https://pub.example/"):
    deleted = []
    monkeypatch.setattr(storage_mod, "is_s3", lambda: True)
    monkeypatch.setattr(storage_mod, "public_url", lambda k: base + k)
    monkeypatch.setattr(storage_mod, "iter_objects", lambda: iter(list(objs)))
    monkeypatch.setattr(storage_mod, "delete_object", lambda k: deleted.append(k))
    return deleted


def test_cleanup_deletes_old_orphans_only(client, session, monkeypatch):
    now = datetime.now(timezone.utc)
    _owner_venue(session, ["https://pub.example/kept.png"])  # accepted -> referenced
    objs = [
        ("kept.png", now - timedelta(days=30)),        # referenced -> keep
        ("orphan_old.png", now - timedelta(days=30)),  # unreferenced + old -> delete
        ("orphan_new.png", now - timedelta(hours=2)),  # unreferenced + recent -> keep (grace)
    ]
    deleted = _mock_storage(monkeypatch, objs)

    r = client.post("/api/uploads/cleanup-orphans/cron")  # ttl=7 default, no CRON_SECRET
    assert r.status_code == 200, r.text
    body = r.json()
    assert body == {"scanned": 3, "kept_referenced": 1, "kept_recent": 1,
                    "deleted": 1, "ttl_days": 7, "dry_run": False}
    assert deleted == ["orphan_old.png"]


def test_cleanup_dry_run_reports_but_deletes_nothing(client, session, monkeypatch):
    now = datetime.now(timezone.utc)
    _owner_venue(session, [])
    deleted = _mock_storage(monkeypatch, [("orphan.png", now - timedelta(days=30))])

    r = client.post("/api/uploads/cleanup-orphans/cron?dry_run=true")
    assert r.status_code == 200
    assert r.json()["deleted"] == 1 and r.json()["dry_run"] is True
    assert deleted == []  # nothing actually removed
