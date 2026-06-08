"""Admin Mission Control dashboard — aggregate read endpoints.

Prefix ``/api/admin/dashboard``; every endpoint is ``Depends(require_admin)``.
This router only *reads* marketplace + agent state and reuses the existing
models/session — it owns no business logic and mutates nothing.
"""
from datetime import datetime, timedelta

from fastapi import APIRouter, Depends, Query
from sqlalchemy import func
from sqlalchemy.orm import Session

from auth import require_admin
from database import get_db
from models import (User, Venue, ServiceProvider, ServiceCategory, Booking,
                    BookingStatus, BookingService, VenueRequirement, Event,
                    Payment, PaymentStatus)
from models_agents import (AgentRun, AgentJob, AgentAction, AgentEscalation,
                           JobStatus, EscalationStatus)
from agents import orchestrator

router = APIRouter()

# Payment statuses where money was actually captured into the platform balance.
# Mirrors frontend/app/admin/payments accounting so GMV agrees across views.
CAPTURED_STATUSES = (PaymentStatus.CAPTURED, PaymentStatus.PARTIALLY_REFUNDED,
                     PaymentStatus.REFUNDED)


def _cents_to_usd(cents: int) -> float:
    return round((cents or 0) / 100, 2)


# --------------------------------------------------------------------------- #
# Liquidity helpers                                                           #
# --------------------------------------------------------------------------- #
def _serviceability(db: Session) -> tuple[int, int, int]:
    """Return (total_bookings, fully_serviced, unserviceable).

    A booking is *fully serviced* when every mandatory service category its
    venue requires is present in the booking's booked services.
    """
    # venue_id -> set of mandatory categories
    mandatory: dict[int, set] = {}
    for vid, cat in db.query(VenueRequirement.venue_id,
                             VenueRequirement.service_category).filter(
                                 VenueRequirement.is_mandatory == True).all():  # noqa: E712
        mandatory.setdefault(vid, set()).add(cat)

    # booking_id -> set of booked categories (via the assigned provider)
    booked: dict[int, set] = {}
    for bid, cat in db.query(BookingService.booking_id,
                             ServiceProvider.service_category).join(
                                 ServiceProvider,
                                 BookingService.service_provider_id == ServiceProvider.id).all():
        booked.setdefault(bid, set()).add(cat)

    total = 0
    fully = 0
    for b_id, venue_id in db.query(Booking.id, Booking.venue_id).all():
        total += 1
        required = mandatory.get(venue_id, set())
        if not required or required <= booked.get(b_id, set()):
            fully += 1
    return total, fully, total - fully


# --------------------------------------------------------------------------- #
# GET /metrics                                                                #
# --------------------------------------------------------------------------- #
@router.get("/metrics")
def metrics(admin: User = Depends(require_admin), db: Session = Depends(get_db)):
    """Headline marketplace + agent numbers in one call.

    Shape::

        {
          "supply": {
            "active_venues": int,
            "active_providers": int,
            "providers_by_category": {category: count},
            "providers_by_city": {city: count},
          },
          "demand": {
            "total_bookings": int,
            "bookings_30d": int,
            "gmv_cents": int, "gmv_usd": float,
            "platform_fees_cents": int, "platform_fees_usd": float,
            "events_total": int,
            "events_by_type": {type: count},   # Event has no status column;
                                               # event_type is the closest dim
          },
          "liquidity": {
            "search_to_book": null,            # search isn't logged yet
            "bookings_per_active_venue": float,
            "fully_serviced_bookings": int,
            "fully_serviced_pct": float,
            "unserviceable_bookings": int,
          },
          "agents": {
            "total_runs": int, "runs_7d": int,
            "open_escalations": int, "fleet_enabled": bool,
          },
        }
    """
    now = datetime.utcnow()
    d30 = now - timedelta(days=30)
    d7 = now - timedelta(days=7)

    # ---- Supply ----
    active_venues = db.query(Venue).filter(Venue.is_active == True).count()  # noqa: E712
    active_providers = db.query(ServiceProvider).filter(
        ServiceProvider.is_active == True).all()  # noqa: E712
    by_category: dict[str, int] = {}
    by_city: dict[str, int] = {}
    for p in active_providers:
        by_category[p.service_category.value] = by_category.get(
            p.service_category.value, 0) + 1
        for city in (p.service_area_cities or []):
            by_city[city] = by_city.get(city, 0) + 1

    # ---- Demand ----
    total_bookings = db.query(Booking).count()
    bookings_30d = db.query(Booking).filter(Booking.created_at >= d30).count()
    gmv_cents = db.query(func.coalesce(func.sum(Payment.total_charged_cents), 0)).filter(
        Payment.status.in_(CAPTURED_STATUSES)).scalar() or 0
    fees_cents = db.query(func.coalesce(func.sum(Payment.platform_fee_cents), 0)).filter(
        Payment.status.in_(CAPTURED_STATUSES)).scalar() or 0
    events_total = db.query(Event).count()
    events_by_type: dict[str, int] = {}
    for (etype,) in db.query(Event.event_type).all():
        events_by_type[etype] = events_by_type.get(etype, 0) + 1

    # ---- Liquidity ----
    total_b, fully, unserviceable = _serviceability(db)
    fully_pct = round(100 * fully / total_b, 1) if total_b else 0.0
    bpv = round(total_bookings / active_venues, 2) if active_venues else 0.0

    # ---- Agents ----
    total_runs = db.query(AgentRun).count()
    runs_7d = db.query(AgentRun).filter(AgentRun.created_at >= d7).count()
    open_esc = db.query(AgentEscalation).filter(
        AgentEscalation.status == EscalationStatus.OPEN).count()
    fleet_enabled = orchestrator.get_fleet_state(db).enabled

    return {
        "supply": {
            "active_venues": active_venues,
            "active_providers": len(active_providers),
            "providers_by_category": by_category,
            "providers_by_city": by_city,
        },
        "demand": {
            "total_bookings": total_bookings,
            "bookings_30d": bookings_30d,
            "gmv_cents": int(gmv_cents),
            "gmv_usd": _cents_to_usd(gmv_cents),
            "platform_fees_cents": int(fees_cents),
            "platform_fees_usd": _cents_to_usd(fees_cents),
            "events_total": events_total,
            "events_by_type": events_by_type,
        },
        "liquidity": {
            "search_to_book": None,  # search events are not logged yet
            "bookings_per_active_venue": bpv,
            "fully_serviced_bookings": fully,
            "fully_serviced_pct": fully_pct,
            "unserviceable_bookings": unserviceable,
        },
        "agents": {
            "total_runs": total_runs,
            "runs_7d": runs_7d,
            "open_escalations": open_esc,
            "fleet_enabled": fleet_enabled,
        },
    }


# --------------------------------------------------------------------------- #
# GET /agents/status                                                          #
# --------------------------------------------------------------------------- #
@router.get("/agents/status")
def agents_status(admin: User = Depends(require_admin),
                  db: Session = Depends(get_db)):
    """Per-agent fleet status. Returns a list including the COO orchestrator.

    Each entry: ``{agent, role, last_run, jobs_done, jobs_blocked,
    jobs_needs_approval, open_escalations}``.
    """
    from agents.types import AGENT_ROLES

    def _counts(agent: str) -> dict:
        base = db.query(AgentJob).filter(AgentJob.agent == agent)
        last_job = base.join(AgentRun, AgentJob.run_id == AgentRun.id).order_by(
            AgentRun.created_at.desc(), AgentRun.id.desc()).first()
        last_run = None
        if last_job:
            run = db.query(AgentRun).filter(AgentRun.id == last_job.run_id).first()
            last_run = run.created_at if run else None
        return {
            "agent": agent,
            "role": AGENT_ROLES[agent],
            "last_run": last_run,
            "jobs_done": base.filter(AgentJob.status == JobStatus.DONE).count(),
            "jobs_blocked": base.filter(AgentJob.status == JobStatus.BLOCKED).count(),
            "jobs_needs_approval": base.filter(
                AgentJob.status == JobStatus.NEEDS_APPROVAL).count(),
            "open_escalations": db.query(AgentEscalation).filter(
                AgentEscalation.agent == agent,
                AgentEscalation.status == EscalationStatus.OPEN).count(),
        }

    workers = [_counts(a) for a in ("venues", "providers", "marketing")]

    latest_run = db.query(AgentRun).order_by(
        AgentRun.created_at.desc(), AgentRun.id.desc()).first()
    coo = {
        "agent": "coo",
        "role": AGENT_ROLES["coo"],
        "last_run": latest_run.created_at if latest_run else None,
        "jobs_done": sum(w["jobs_done"] for w in workers),
        "jobs_blocked": sum(w["jobs_blocked"] for w in workers),
        "jobs_needs_approval": sum(w["jobs_needs_approval"] for w in workers),
        "open_escalations": db.query(AgentEscalation).filter(
            AgentEscalation.status == EscalationStatus.OPEN).count(),
    }
    return [coo, *workers]


# --------------------------------------------------------------------------- #
# GET /escalations                                                            #
# --------------------------------------------------------------------------- #
@router.get("/escalations")
def escalations(status: str = Query("open", pattern="^(open|all)$"),
                admin: User = Depends(require_admin),
                db: Session = Depends(get_db)):
    """Escalations joined to run/job/action context.

    ``status=open`` (default) returns only OPEN; ``status=all`` returns every
    escalation. Each row carries the originating run goal, job status, and the
    action's guardrail decision.
    """
    q = db.query(AgentEscalation)
    if status == "open":
        q = q.filter(AgentEscalation.status == EscalationStatus.OPEN)
    rows = q.order_by(AgentEscalation.created_at.desc()).all()

    out = []
    for e in rows:
        run = db.query(AgentRun).filter(AgentRun.id == e.run_id).first()
        job = db.query(AgentJob).filter(AgentJob.id == e.job_id).first()
        action = db.query(AgentAction).filter(
            AgentAction.id == e.action_id).first()
        out.append({
            "id": e.id,
            "agent": e.agent,
            "tool": e.tool,
            "risk": e.risk.value,
            "decision": action.decision.value if action else None,
            "args": e.args,
            "reason": e.reason,
            "status": e.status.value,
            "run_id": e.run_id,
            "run_goal": run.goal if run else None,
            "job_status": job.status.value if job else None,
            "created_at": e.created_at,
        })
    return out


# --------------------------------------------------------------------------- #
# GET /timeseries                                                             #
# --------------------------------------------------------------------------- #
@router.get("/timeseries")
def timeseries(metric: str = Query(..., pattern="^(bookings|gmv|new_venues|new_providers)$"),
               days: int = Query(30, ge=1, le=365),
               admin: User = Depends(require_admin),
               db: Session = Depends(get_db)):
    """Daily buckets for charts: ``{metric, days, points:[{date, value}]}``.

    ``gmv`` values are dollars (float, by capture date); the others are counts.
    """
    now = datetime.utcnow()
    start_day = (now - timedelta(days=days - 1)).date()
    buckets: dict = {(start_day + timedelta(days=i)).isoformat(): 0
                     for i in range(days)}

    def _bump(dt, amount=1):
        if dt is None:
            return
        key = (dt.date() if isinstance(dt, datetime) else dt).isoformat()
        if key in buckets:
            buckets[key] += amount

    if metric == "bookings":
        for (created,) in db.query(Booking.created_at).filter(
                Booking.created_at >= datetime.combine(start_day, datetime.min.time())).all():
            _bump(created)
    elif metric == "new_venues":
        for (created,) in db.query(Venue.created_at).filter(
                Venue.created_at >= datetime.combine(start_day, datetime.min.time())).all():
            _bump(created)
    elif metric == "new_providers":
        for (created,) in db.query(ServiceProvider.created_at).filter(
                ServiceProvider.created_at >= datetime.combine(start_day, datetime.min.time())).all():
            _bump(created)
    elif metric == "gmv":
        rows = db.query(Payment.total_charged_cents, Payment.captured_at,
                        Payment.created_at).filter(
                            Payment.status.in_(CAPTURED_STATUSES)).all()
        for cents, captured_at, created_at in rows:
            _bump(captured_at or created_at, (cents or 0) / 100)

    points = [{"date": d, "value": round(v, 2) if metric == "gmv" else v}
              for d, v in sorted(buckets.items())]
    return {"metric": metric, "days": days, "points": points}
