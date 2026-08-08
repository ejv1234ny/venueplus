"""Inbound webhooks + unsubscribe — public endpoints, prefix ``/api/webhooks``.

``POST /resend``
    Resend delivery events (``email.delivered`` / ``email.bounced`` /
    ``email.complained``). Bounces and complaints write a suppression and can
    trip the autonomy circuit breaker (pause + Telegram alert). Optional auth:
    set ``RESEND_WEBHOOK_SECRET`` and register the webhook URL as
    ``/api/webhooks/resend?secret=<value>``.

``GET|POST /unsubscribe``
    One-click unsubscribe target embedded in every outreach email
    (HMAC-signed link — no login, no guessable enumeration). The POST verb
    supports RFC 8058 one-click (List-Unsubscribe-Post).
"""
from __future__ import annotations

import hashlib
import hmac
import os

from fastapi import APIRouter, Depends, Request
from fastapi.responses import HTMLResponse
from sqlalchemy.orm import Session

from database import get_db
from models_agents import OutreachLog, OutreachSuppression

router = APIRouter()


def _suppress(db: Session, email: str, reason: str) -> None:
    email = (email or "").strip().lower()
    if not email:
        return
    if not db.query(OutreachSuppression).filter(
            OutreachSuppression.email == email).first():
        db.add(OutreachSuppression(email=email, reason=reason))


def _mark(db: Session, email: str, status: str,
          message_id: str | None = None) -> None:
    """Update the matching outreach_log row's lifecycle status."""
    email = (email or "").strip().lower()
    row = None
    if message_id:
        row = db.query(OutreachLog).filter(
            OutreachLog.provider_message_id == message_id).first()
    if row is None and email:
        row = (db.query(OutreachLog).filter(OutreachLog.to_email == email)
               .order_by(OutreachLog.id.desc()).first())
    if row:
        row.status = status
        if message_id and not row.provider_message_id:
            row.provider_message_id = message_id


@router.post("/resend")
async def resend_webhook(request: Request, secret: str | None = None,
                         db: Session = Depends(get_db)):
    expected = os.getenv("RESEND_WEBHOOK_SECRET")
    if expected and secret != expected:
        return {"ok": True}          # silently drop spoofed calls
    try:
        payload = await request.json()
    except Exception:
        return {"ok": True}

    etype = str(payload.get("type", ""))
    data = payload.get("data") or {}
    to_list = data.get("to") or []
    if isinstance(to_list, str):
        to_list = [to_list]
    message_id = data.get("email_id") or data.get("id")

    status = {"email.delivered": "delivered",
              "email.bounced": "bounced",
              "email.complained": "complained"}.get(etype)
    if status:
        for to in to_list:
            _mark(db, to, status, message_id)
            if status in ("bounced", "complained"):
                _suppress(db, to, status)
        if status in ("bounced", "complained"):
            from agents import autonomy
            autonomy.trip_breaker_if_needed(db)
        db.commit()
    return {"ok": True}


# --------------------------------------------------------------------------- #
# Unsubscribe                                                                 #
# --------------------------------------------------------------------------- #
def _token_for(email: str) -> str:
    secret = os.getenv("SECRET_KEY", "dev")
    return hmac.new(secret.encode(), email.strip().lower().encode(),
                    hashlib.sha256).hexdigest()[:20]


def _do_unsubscribe(db: Session, email: str, token: str) -> bool:
    email = (email or "").strip().lower()
    if not email or not hmac.compare_digest(_token_for(email), token or ""):
        return False
    _suppress(db, email, "unsubscribed")
    db.commit()
    return True


@router.get("/unsubscribe", response_class=HTMLResponse)
def unsubscribe(email: str = "", token: str = "",
                db: Session = Depends(get_db)):
    if not _do_unsubscribe(db, email, token):
        return HTMLResponse("<p>Invalid unsubscribe link.</p>", status_code=400)
    return HTMLResponse(
        "<p>You're unsubscribed — VenuePlus won't email "
        f"<strong>{email.strip().lower()}</strong> again.</p>")


@router.post("/unsubscribe")
def unsubscribe_one_click(email: str = "", token: str = "",
                          db: Session = Depends(get_db)):
    """RFC 8058 one-click target (mail clients POST to the List-Unsubscribe
    URL). Same semantics as the GET."""
    return {"ok": _do_unsubscribe(db, email, token)}
