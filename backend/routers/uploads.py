"""File upload endpoints. Validates content type, persists via storage backend,
records FileUpload row, and (optionally) attaches to a venue or provider.
"""
import os
from datetime import datetime, timezone, timedelta
from typing import Optional

from fastapi import APIRouter, Depends, File, Form, HTTPException, Request, UploadFile, status
from sqlalchemy.orm import Session

from auth import get_current_active_user
from database import get_db
from models import FileUpload, User, Venue, ServiceProvider
from services import storage

router = APIRouter()


@router.post("/", status_code=status.HTTP_201_CREATED)
def upload(
    file: UploadFile = File(...),
    kind: str = Form("venue_photo"),
    venue_id: int | None = Form(None),
    provider_id: int | None = Form(None),
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    # Authorization checks
    if venue_id:
        venue = db.query(Venue).filter(Venue.id == venue_id).first()
        if not venue or venue.owner_id != current_user.id:
            raise HTTPException(403, "Not your venue")
    if provider_id:
        sp = db.query(ServiceProvider).filter(ServiceProvider.id == provider_id).first()
        if not sp or sp.user_id != current_user.id:
            raise HTTPException(403, "Not your provider profile")

    try:
        url, size, backend = storage.save(file.file, file.filename or "upload",
                                          file.content_type or "application/octet-stream")
    except ValueError as e:
        raise HTTPException(400, str(e))

    rec = FileUpload(
        uploader_id=current_user.id, kind=kind,
        filename=file.filename or "upload",
        content_type=file.content_type, size_bytes=size,
        backend=backend, url=url,
        venue_id=venue_id, provider_id=provider_id,
    )
    db.add(rec); db.commit(); db.refresh(rec)

    # Append to target images array
    if venue_id:
        venue = db.query(Venue).filter(Venue.id == venue_id).first()
        venue.images = (venue.images or []) + [url]
        db.commit()
    if provider_id:
        sp = db.query(ServiceProvider).filter(ServiceProvider.id == provider_id).first()
        sp.images = (sp.images or []) + [url]
        db.commit()

    return {"id": rec.id, "url": url, "backend": backend, "size": size}


@router.delete("/{file_id}", status_code=204)
def delete_upload(file_id: int, current_user: User = Depends(get_current_active_user),
                  db: Session = Depends(get_db)):
    rec = db.query(FileUpload).filter(FileUpload.id == file_id).first()
    if not rec:
        raise HTTPException(404, "Not found")
    if rec.uploader_id != current_user.id:
        raise HTTPException(403, "Not yours")
    # Detach from arrays
    if rec.venue_id:
        v = db.query(Venue).filter(Venue.id == rec.venue_id).first()
        if v and v.images:
            v.images = [u for u in v.images if u != rec.url]
    if rec.provider_id:
        p = db.query(ServiceProvider).filter(ServiceProvider.id == rec.provider_id).first()
        if p and p.images:
            p.images = [u for u in p.images if u != rec.url]
    db.delete(rec); db.commit()
    return None


@router.post("/cleanup-orphans/cron")
def cleanup_orphans_cron(request: Request, dry_run: bool = False,
                         ttl_days: Optional[int] = None,
                         db: Session = Depends(get_db)):
    """Sweep object storage of files that aren't referenced by any venue/provider
    image or user profile photo and are older than the TTL (default 7 days).

    "Accepted" photos (saved into a venue's images) are kept; uploaded-but-unused
    candidates (e.g. unaccepted "fetch photos" results, or photos removed from a
    listing) are deleted once past the grace window.

    Protected by CRON_SECRET (Bearer) when set; open in dev. Query params:
    ``dry_run=true`` (report only, delete nothing) and ``ttl_days=N`` (override TTL).
    """
    expected = os.getenv("CRON_SECRET")
    if expected and request.headers.get("authorization", "") != f"Bearer {expected}":
        raise HTTPException(401, "Invalid cron secret")
    if not storage.is_s3():
        return {"skipped": "object storage (S3/R2) not configured"}

    ttl = ttl_days if ttl_days is not None else int(os.getenv("ORPHAN_TTL_DAYS", "7"))
    cutoff = datetime.now(timezone.utc) - timedelta(days=ttl)

    # Referenced URLs = images currently in use ("accepted").
    referenced: set[str] = set()
    for (imgs,) in db.query(Venue.images).all():
        referenced.update(imgs or [])
    for (imgs,) in db.query(ServiceProvider.images).all():
        referenced.update(imgs or [])
    for (pic,) in db.query(User.profile_image).filter(User.profile_image.isnot(None)).all():
        referenced.add(pic)

    scanned = kept = deleted = recent = 0
    removed: list[str] = []
    for key, last_modified in storage.iter_objects():
        scanned += 1
        url = storage.public_url(key)
        if url in referenced:
            kept += 1
            continue
        if last_modified >= cutoff:
            recent += 1            # unreferenced, but still within the grace window
            continue
        deleted += 1
        if not dry_run:
            storage.delete_object(key)
            removed.append(url)

    if removed:
        db.query(FileUpload).filter(FileUpload.url.in_(removed)).delete(synchronize_session=False)
        db.commit()

    return {"scanned": scanned, "kept_referenced": kept, "kept_recent": recent,
            "deleted": deleted, "ttl_days": ttl, "dry_run": dry_run}
