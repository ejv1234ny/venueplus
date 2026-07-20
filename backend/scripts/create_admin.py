"""Create or promote a VenuePlus ADMIN user.

Idempotent: if the email already exists, it's promoted to ADMIN (and, if a
password is given or generated, its password is reset). Otherwise a new active,
verified admin is created. Prints the credentials once.

Usage (from backend/), against whatever DATABASE_URL points at:
  python -m scripts.create_admin --email you@example.com
  python -m scripts.create_admin --email you@example.com --password 'S3cret!'
"""
from __future__ import annotations

import argparse
import os
import secrets
import string
import sys

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from database import Base, engine, SessionLocal  # noqa: E402
import models  # noqa: E402,F401
from models import User, UserRole  # noqa: E402
from auth import get_password_hash  # noqa: E402


def _gen_password(n: int = 16) -> str:
    alphabet = string.ascii_letters + string.digits + "!@#$%^&*"
    return "".join(secrets.choice(alphabet) for _ in range(n))


def main(argv=None):
    ap = argparse.ArgumentParser()
    ap.add_argument("--email", required=True)
    ap.add_argument("--password", default=None,
                    help="If omitted, a strong password is generated and printed.")
    ap.add_argument("--first", default="Admin")
    ap.add_argument("--last", default="User")
    args = ap.parse_args(argv)

    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        password = args.password or _gen_password()
        user = db.query(User).filter(User.email == args.email).first()
        if user:
            user.role = UserRole.ADMIN
            user.is_active = True
            user.is_verified = True
            if args.password or not user.hashed_password:
                user.hashed_password = get_password_hash(password)
                pw_note = password
            else:
                pw_note = "(unchanged — existing password kept)"
            action = "promoted existing user to ADMIN"
        else:
            user = User(email=args.email, hashed_password=get_password_hash(password),
                        first_name=args.first, last_name=args.last,
                        role=UserRole.ADMIN, is_active=True, is_verified=True)
            db.add(user)
            pw_note = password
            action = "created new ADMIN user"
        db.commit()
        print(f"OK: {action}")
        print(f"  email:    {args.email}")
        print(f"  password: {pw_note}")
        print("  -> change it after first login via the forgot-password flow.")
        return 0
    finally:
        db.close()


if __name__ == "__main__":
    raise SystemExit(main())
