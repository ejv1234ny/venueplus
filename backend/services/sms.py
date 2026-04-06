"""SMS service.

Backends:
  - console (default): prints to stdout
  - twilio: set TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_FROM_NUMBER
"""
import os
import base64
import urllib.parse
import urllib.request


def _send_console(to: str, body: str) -> dict:
    print(f"[sms:console] TO: {to}\n[sms:console] BODY: {body}")
    return {"backend": "console", "ok": True}


def _send_twilio(to: str, body: str) -> dict:
    sid = os.getenv("TWILIO_ACCOUNT_SID")
    token = os.getenv("TWILIO_AUTH_TOKEN")
    from_number = os.getenv("TWILIO_FROM_NUMBER")
    if not (sid and token and from_number):
        return _send_console(to, body)
    url = f"https://api.twilio.com/2010-04-01/Accounts/{sid}/Messages.json"
    data = urllib.parse.urlencode({"To": to, "From": from_number, "Body": body}).encode("utf-8")
    creds = base64.b64encode(f"{sid}:{token}".encode()).decode()
    req = urllib.request.Request(url, data=data, headers={
        "Authorization": f"Basic {creds}",
        "Content-Type": "application/x-www-form-urlencoded",
    })
    try:
        with urllib.request.urlopen(req, timeout=10) as r:
            return {"backend": "twilio", "ok": True}
    except Exception as e:
        print(f"[sms:twilio] FAILED: {e}")
        return {"backend": "twilio", "ok": False, "error": str(e)}


def send(to: str, body: str) -> dict:
    if os.getenv("TWILIO_ACCOUNT_SID"):
        return _send_twilio(to, body)
    return _send_console(to, body)
