"""File storage service.

Backends:
  - local (default): saves to ./uploads/ and serves via /static
  - s3: set S3_BUCKET, S3_REGION, AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, optional S3_ENDPOINT (R2/Spaces compatible)
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
    try:
        import boto3  # optional dep, only when S3 is configured
    except ImportError:
        raise RuntimeError("boto3 not installed; pip install boto3")

    bucket = os.environ["S3_BUCKET"]
    region = os.getenv("S3_REGION", "us-east-1")
    endpoint = os.getenv("S3_ENDPOINT")
    s3 = boto3.client("s3", region_name=region, endpoint_url=endpoint)
    name = _safe_name(filename)
    body = stream.read()
    if len(body) > MAX_BYTES:
        raise ValueError("file too large")
    s3.put_object(Bucket=bucket, Key=name, Body=body,
                  ContentType=content_type, ACL="public-read")
    if endpoint:
        url = f"{endpoint.rstrip('/')}/{bucket}/{name}"
    else:
        url = f"https://{bucket}.s3.{region}.amazonaws.com/{name}"
    return url, len(body), "s3"


def save(stream: BinaryIO, filename: str, content_type: str) -> tuple[str, int, str]:
    """Returns (url, size_bytes, backend)."""
    if content_type not in ALLOWED_IMAGE:
        raise ValueError(f"unsupported content type: {content_type}")
    if os.getenv("S3_BUCKET"):
        return _save_s3(stream, filename, content_type)
    return _save_local(stream, filename, content_type)
