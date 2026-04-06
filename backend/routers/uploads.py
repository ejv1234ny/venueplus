"""File upload endpoints. Validates content type, persists via storage backend,
records FileUpload row, and (optionally) attaches to a venue or provider.
"""
from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile, status
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
