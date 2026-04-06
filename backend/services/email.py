"""Transactional email service.

Backends:
  - console (default): prints to stdout. Use in dev.
  - resend: real email via Resend API. Set RESEND_API_KEY + EMAIL_FROM.
"""
import json
import os
import urllib.request
from typing import Optional

EMAIL_FROM = os.getenv("EMAIL_FROM", "VenuePlus <no-reply@venueplus.local>")


def _send_console(to: str, subject: str, html: str, text: Optional[str] = None) -> dict:
    print("=" * 60)
    print(f"[email:console] TO: {to}")
    print(f"[email:console] FROM: {EMAIL_FROM}")
    print(f"[email:console] SUBJECT: {subject}")
    print(f"[email:console] BODY:\n{text or html}")
    print("=" * 60)
    return {"backend": "console", "ok": True}


def _send_resend(to: str, subject: str, html: str, text: Optional[str] = None) -> dict:
    api_key = os.getenv("RESEND_API_KEY")
    body = {"from": EMAIL_FROM, "to": [to], "subject": subject, "html": html}
    if text:
        body["text"] = text
    req = urllib.request.Request(
        "https://api.resend.com/emails",
        data=json.dumps(body).encode("utf-8"),
        headers={
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json",
        },
    )
    try:
        with urllib.request.urlopen(req, timeout=10) as r:
            return {"backend": "resend", "ok": True, "id": json.loads(r.read()).get("id")}
    except Exception as e:
        print(f"[email:resend] FAILED: {e}")
        return {"backend": "resend", "ok": False, "error": str(e)}


def send(to: str, subject: str, html: str, text: Optional[str] = None) -> dict:
    if os.getenv("RESEND_API_KEY"):
        return _send_resend(to, subject, html, text)
    return _send_console(to, subject, html, text)


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
