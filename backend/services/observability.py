"""Sentry init (no-op if SENTRY_DSN not set)."""
import os


def init_sentry(app=None):
    dsn = os.getenv("SENTRY_DSN")
    if not dsn:
        return False
    try:
        import sentry_sdk
        from sentry_sdk.integrations.fastapi import FastApiIntegration
        sentry_sdk.init(
            dsn=dsn,
            integrations=[FastApiIntegration()],
            traces_sample_rate=float(os.getenv("SENTRY_TRACES_RATE", "0.1")),
            environment=os.getenv("ENVIRONMENT", "development"),
        )
        return True
    except ImportError:
        print("[sentry] sentry-sdk not installed; skipping")
        return False
