"""Transactional email service.

Backends:
  - console (default): prints to stdout. Use in dev.
  - resend: real email via Resend API. Set RESEND_API_KEY + EMAIL_FROM.
"""
import json
import os
import urllib.parse
import urllib.request
from typing import Optional

EMAIL_FROM = os.getenv("EMAIL_FROM", "VenuePlus <no-reply@venueplus.local>")
# Where replies go. Sending is from a no-reply address, so without this any
# reply to an outreach/claim email is lost. Set to a monitored inbox.
EMAIL_REPLY_TO = os.getenv("EMAIL_REPLY_TO")


def _send_console(to: str, subject: str, html: str, text: Optional[str] = None,
                  headers: Optional[dict] = None) -> dict:
    print("=" * 60)
    print(f"[email:console] TO: {to}")
    if headers:
        print(f"[email:console] HEADERS: {headers}")
    print(f"[email:console] FROM: {EMAIL_FROM}")
    if EMAIL_REPLY_TO:
        print(f"[email:console] REPLY-TO: {EMAIL_REPLY_TO}")
    print(f"[email:console] SUBJECT: {subject}")
    print(f"[email:console] BODY:\n{text or html}")
    print("=" * 60)
    return {"backend": "console", "ok": True}


def _send_resend(to: str, subject: str, html: str, text: Optional[str] = None,
                 headers: Optional[dict] = None) -> dict:
    api_key = os.getenv("RESEND_API_KEY")
    body = {"from": EMAIL_FROM, "to": [to], "subject": subject, "html": html}
    if text:
        body["text"] = text
    if headers:
        body["headers"] = headers           # e.g. List-Unsubscribe
    if EMAIL_REPLY_TO:
        body["reply_to"] = EMAIL_REPLY_TO   # replies land in a real inbox
    req = urllib.request.Request(
        "https://api.resend.com/emails",
        data=json.dumps(body).encode("utf-8"),
        headers={
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json",
            # Resend's API is behind Cloudflare, which 403s (error 1010) the
            # default Python-urllib User-Agent. Without this, ALL email silently
            # fails. Do not remove.
            "User-Agent": "VenuePlus/1.0 (+https://venueplus.net)",
        },
    )
    try:
        with urllib.request.urlopen(req, timeout=10) as r:
            return {"backend": "resend", "ok": True, "id": json.loads(r.read()).get("id")}
    except Exception as e:
        print(f"[email:resend] FAILED: {e}")
        return {"backend": "resend", "ok": False, "error": str(e)}


def send(to: str, subject: str, html: str, text: Optional[str] = None,
         headers: Optional[dict] = None) -> dict:
    if os.getenv("RESEND_API_KEY"):
        return _send_resend(to, subject, html, text, headers)
    return _send_console(to, subject, html, text, headers)


# ---------- Outreach (cold email compliance) ----------
# All agent outreach goes through send_outreach(): suppression check +
# CAN-SPAM footer (physical address + working unsubscribe) + List-Unsubscribe
# headers. Transactional mail (verification, bookings, offers) keeps using
# send() and is intentionally footer-free.
PUBLIC_API_URL = os.getenv("PUBLIC_API_URL", "https://api.venueplus.net")
# CAN-SPAM requires a physical postal address on commercial email. Set
# POSTAL_ADDRESS in the environment to the real mailing address.
POSTAL_ADDRESS = os.getenv("POSTAL_ADDRESS", "VenuePlus, Austin, TX")


def unsubscribe_link(to: str) -> str:
    """HMAC-signed one-click unsubscribe URL (see routers/webhooks.py)."""
    import hashlib
    import hmac
    secret = os.getenv("SECRET_KEY", "dev")
    email = to.strip().lower()
    token = hmac.new(secret.encode(), email.encode(),
                     hashlib.sha256).hexdigest()[:20]
    q = urllib.parse.urlencode({"email": email, "token": token})
    return f"{PUBLIC_API_URL}/api/webhooks/unsubscribe?{q}"


def _is_suppressed(to: str) -> bool:
    """Best-effort do-not-contact check; never blocks on infra errors."""
    try:
        from database import SessionLocal
        from models_agents import OutreachSuppression
        db = SessionLocal()
        try:
            return db.query(OutreachSuppression).filter(
                OutreachSuppression.email == to.strip().lower()
            ).first() is not None
        finally:
            db.close()
    except Exception:
        return False


def send_outreach(to: str, subject: str, html: str,
                  text: Optional[str] = None) -> dict:
    """Cold/marketing email path: suppression check + compliance footer +
    List-Unsubscribe (incl. RFC 8058 one-click)."""
    if _is_suppressed(to):
        return {"backend": "suppressed", "ok": False, "suppressed": True,
                "skipped": "recipient is on the suppression list"}
    link = unsubscribe_link(to)
    footer = (
        '<hr style="border:none;border-top:1px solid #ddd;margin-top:24px">'
        '<p style="font-size:12px;color:#888">You\'re receiving this one-time '
        'note because your business is publicly listed. '
        f'{POSTAL_ADDRESS}. <a href="{link}">Unsubscribe</a> and we won\'t '
        'email you again.</p>')
    if text:
        text = f"{text}\n\n--\n{POSTAL_ADDRESS}. Unsubscribe: {link}"
    headers = {"List-Unsubscribe": f"<{link}>",
               "List-Unsubscribe-Post": "List-Unsubscribe=One-Click"}
    return send(to, subject, html + footer, text, headers=headers)


# ---------- Templates ----------
def render_verification(name: str, link: str) -> tuple[str, str, str]:
    subject = "Verify your VenuePlus email"
    text = f"Hi {name},\n\nVerify your email: {link}\n\nThis link expires in 24 hours."
    html = f"""
    <p>Hi {name},</p>
    <p>Welcome to VenuePlus. Please verify your email by clicking the link below:</p>
    <p><a href="{link}">Verify my email</a></p>
    <p>This link expires in 24 hours.</p>
    """
    return subject, html, text


def render_password_reset(name: str, link: str) -> tuple[str, str, str]:
    subject = "Reset your VenuePlus password"
    text = f"Hi {name},\n\nReset your password: {link}\n\nThis link expires in 1 hour."
    html = f"""
    <p>Hi {name},</p>
    <p>Click below to reset your password. If you didn't request this, ignore this email.</p>
    <p><a href="{link}">Reset my password</a></p>
    <p>This link expires in 1 hour.</p>
    """
    return subject, html, text


def render_booking_confirmed(name: str, venue_title: str, start: str, total: float) -> tuple[str, str, str]:
    subject = f"Your VenuePlus booking is confirmed: {venue_title}"
    text = f"Hi {name},\n\nYour booking at {venue_title} on {start} is confirmed.\nTotal: ${total:.2f}"
    html = f"""
    <p>Hi {name},</p>
    <p>Your booking at <strong>{venue_title}</strong> on <strong>{start}</strong> is confirmed.</p>
    <p>Total: <strong>${total:.2f}</strong></p>
    """
    return subject, html, text


def render_match_offer(name: str, venue_title: str, start: str, hours: int, payout: float, accept_link: str) -> tuple[str, str, str]:
    subject = f"New job offer: {venue_title}"
    text = (
        f"Hi {name},\n\n"
        f"You have a new job offer at {venue_title} on {start} for {hours}h.\n"
        f"Estimated payout: ${payout:.2f}\n"
        f"Accept: {accept_link}"
    )
    html = f"""
    <p>Hi {name},</p>
    <p>You have a new job offer at <strong>{venue_title}</strong>.</p>
    <ul>
      <li>When: {start}</li>
      <li>Hours: {hours}</li>
      <li>Estimated payout: ${payout:.2f}</li>
    </ul>
    <p><a href="{accept_link}">Accept this job</a></p>
    """
    return subject, html, text


def render_review_request(name: str, venue_title: str, link: str) -> tuple[str, str, str]:
    subject = f"How was {venue_title}?"
    text = f"Hi {name},\n\nLeave a review for {venue_title}: {link}"
    html = f"""
    <p>Hi {name},</p>
    <p>How was your event at <strong>{venue_title}</strong>?</p>
    <p><a href="{link}">Leave a review</a></p>
    """
    return subject, html, text
