from sqlalchemy import create_engine, event
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os

# Database URL - can be configured via environment variable
DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "sqlite:///./venueplus.db"
)

# Railway/Heroku give postgres:// but SQLAlchemy 2.x needs postgresql://
if DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)

# Schema (used when on Postgres so we don't collide with other products in
# a shared Supabase project). Defaults to venueplus.
DB_SCHEMA = os.getenv("DB_SCHEMA", "venueplus")

# Create engine
connect_args = {}
engine_kwargs = {}
if DATABASE_URL.startswith("sqlite"):
    connect_args["check_same_thread"] = False
else:
    engine_kwargs["pool_pre_ping"] = True
    # Force every connection to look in our schema first
    connect_args["options"] = f"-c search_path={DB_SCHEMA},public"

engine = create_engine(DATABASE_URL, connect_args=connect_args, **engine_kwargs)

# Enable foreign keys for SQLite
if DATABASE_URL.startswith("sqlite"):
    @event.listens_for(engine, "connect")
    def set_sqlite_pragma(dbapi_connection, connection_record):
        cursor = dbapi_connection.cursor()
        cursor.execute("PRAGMA foreign_keys=ON")
        cursor.close()

# Create session
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base class for models
Base = declarative_base()

# Dependency to get database session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
