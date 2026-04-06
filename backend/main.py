from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from contextlib import asynccontextmanager
from pathlib import Path
import os
import uvicorn

from database import engine, Base
from services.observability import init_sentry

ALLOWED_ORIGINS = [
    o.strip() for o in os.getenv(
        "ALLOWED_ORIGINS",
        "http://localhost:3000,http://localhost:3001,http://localhost:19006"
    ).split(",") if o.strip()
]

UPLOAD_DIR = Path(os.getenv("UPLOAD_DIR", "uploads"))
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)


@asynccontextmanager
async def lifespan(app: FastAPI):
    Base.metadata.create_all(bind=engine)
    UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
    yield


init_sentry()

app = FastAPI(
    title="VenuePlus API",
    description="API for VenuePlus - Event venue and service marketplace",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Static for local-backend uploads
app.mount("/static", StaticFiles(directory=str(UPLOAD_DIR)), name="static")

# Routers
from routers import (auth, venues, services, bookings, users, events,
                     uploads, search, matching, messaging, reviews,
                     notifications, admin, providers)

app.include_router(auth.router,          prefix="/api/auth",          tags=["Auth"])
app.include_router(users.router,         prefix="/api/users",         tags=["Users"])
app.include_router(venues.router,        prefix="/api/venues",        tags=["Venues"])
app.include_router(services.router,      prefix="/api/services",      tags=["Services"])
app.include_router(providers.router,     prefix="/api/providers",     tags=["Providers"])
app.include_router(bookings.router,      prefix="/api/bookings",      tags=["Bookings"])
app.include_router(events.router,        prefix="/api/events",        tags=["Events"])
app.include_router(uploads.router,       prefix="/api/uploads",       tags=["Uploads"])
app.include_router(search.router,        prefix="/api/search",        tags=["Search"])
app.include_router(matching.router,      prefix="/api/matching",      tags=["Matching"])
app.include_router(messaging.router,     prefix="/api/messages",      tags=["Messaging"])
app.include_router(reviews.router,       prefix="/api/reviews",       tags=["Reviews"])
app.include_router(notifications.router, prefix="/api/notifications", tags=["Notifications"])
app.include_router(admin.router,         prefix="/api/admin",         tags=["Admin"])


@app.get("/")
def read_root():
    return {"message": "Welcome to VenuePlus API", "docs": "/docs", "version": "1.0.0"}


@app.get("/health")
def health_check():
    return {"status": "healthy"}


if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=int(os.getenv("PORT", "8000")), reload=True)
