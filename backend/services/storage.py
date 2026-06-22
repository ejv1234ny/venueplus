"""File storage service.

Backends:
  - local (default): saves to ./uploads/ and serves via /static
  - s3: set S3_BUCKET, S3_REGION, AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, optional S3_ENDPOINT (R2/Spaces compatible),
        optional S3_PUBLIC_URL (public read base, e.g. an R2 r2.dev or custom domain)
"""
import os
import secrets
from pathlib import Path
from typing import BinaryIO, Optional

UPLOAD_DIR = Path(os.getenv("UPLOAD_DIR", "uploads"))
PUBLIC_BASE = os.getenv("PUBLIC_BASE_URL", "http://localhost:8000")
ALLOWED_IMAGE = {"image/jpeg", "image/png", "image/webp", "image/gif"}
MAX_BYTES = 10 * 1024 * 1024  # 10 MB


def _safe_name(filename: str) -> str:
    ext = Path(filename).suffix.lower()
    if len(ext) > 8:
        ext = ""
    return f"{secrets.token_urlsafe(16)}{ext}"


def _save_local(stream: BinaryIO, filename: str, content_type: str) -> tuple[str, int, str]:
    UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
    name = _safe_name(filename)
    dest = UPLOAD_DIR / name
    size = 0
    with open(dest, "wb") as f:
        while True:
            chunk = stream.read(64 * 1024)
            if not chunk:
                break
            size += len(chunk)
            if size > MAX_BYTES:
                f.close()
                dest.unlink(missing_ok=True)
                raise ValueError("file too large")
            f.write(chunk)
    url = f"{PUBLIC_BASE}/static/{name}"
    return url, size, "local"


def _save_s3(stream: BinaryIO, filename: str, content_type: str) -> tuple[str, int, str]:
    bucket = os.environ["S3_BUCKET"]
    s3 = _s3_client()
    name = _safe_name(filename)
    body = stream.read()
    if len(body) > MAX_BYTES:
        raise ValueError("file too large")
    s3.put_object(Bucket=bucket, Key=name, Body=body,
                  ContentType=content_type)
    return public_url(name), len(body), "s3"


def save(stream: BinaryIO, filename: str, content_type: str) -> tuple[str, int, str]:
    """Returns (url, size_bytes, backend)."""
    if content_type not in ALLOWED_IMAGE:
        raise ValueError(f"unsupported content type: {content_type}")
    if os.getenv("S3_BUCKET"):
        return _save_s3(stream, filename, content_type)
    return _save_local(stream, filename, content_type)


# --------------------------------------------------------------------------- #
# S3/R2 maintenance helpers (used by the orphan-cleanup cron)
# --------------------------------------------------------------------------- #
def is_s3() -> bool:
    return bool(os.getenv("S3_BUCKET"))


def _s3_client():
    try:
        import boto3  # optional dep, only when S3 is configured
    except ImportError:
        raise RuntimeError("boto3 not installed; pip install boto3")
    return boto3.client("s3", region_name=os.getenv("S3_REGION", "us-east-1"),
                        endpoint_url=os.getenv("S3_ENDPOINT"))


def public_url(key: str) -> str:
    """Public URL for a stored object key. MUST match what _save_s3 returns, so the
    cleanup cron can compare keys against the URLs persisted in venue/provider images."""
    public = os.getenv("S3_PUBLIC_URL")
    if public:
        return f"{public.rstrip('/')}/{key}"
    endpoint = os.getenv("S3_ENDPOINT")
    bucket = os.environ["S3_BUCKET"]
    region = os.getenv("S3_REGION", "us-east-1")
    if endpoint:
        return f"{endpoint.rstrip('/')}/{bucket}/{key}"
    return f"https://{bucket}.s3.{region}.amazonaws.com/{key}"


def iter_objects():
    """Yield (key, last_modified) for every object in the bucket."""
    bucket = os.environ["S3_BUCKET"]
    s3 = _s3_client()
    for page in s3.get_paginator("list_objects_v2").paginate(Bucket=bucket):
        for obj in page.get("Contents", []):
            yield obj["Key"], obj["LastModified"]


def delete_object(key: str) -> None:
    _s3_client().delete_object(Bucket=os.environ["S3_BUCKET"], Key=key)
