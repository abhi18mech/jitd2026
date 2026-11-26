
from datetime import datetime, timezone

from sqlalchemy import (
    Column,
    Integer,
    String,
    DateTime,
    ForeignKey,
    Text,
    Boolean,
    Float
)
from sqlalchemy.orm import relationship

from .connection import Base


# 1. User Model
class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(100), unique=True, nullable=False)
    email = Column(String(150), unique=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    role = Column(String(30), default="viewer", nullable=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(
        DateTime,
        default=lambda: datetime.now(timezone.utc)
    )


# 2. Identity Model
class Identity(Base):
    __tablename__ = "identities"

    id = Column(Integer, primary_key=True, index=True)
    argus_id = Column(String(100), unique=True, nullable=False)
    status = Column(String(30), default="NEW")
    first_seen = Column(DateTime)
    last_seen = Column(DateTime)
    appearance_count = Column(Integer, default=0)
    recovery_count = Column(Integer, default=0)
    camera_source = Column(String(100))
    created_at = Column(
        DateTime,
        default=lambda: datetime.now(timezone.utc)
    )


# 3. Recovery Event Model
class RecoveryEvent(Base):
    __tablename__ = "recovery_events"

    id = Column(Integer, primary_key=True, index=True)
    identity_id = Column(
        Integer,
        ForeignKey("identities.id"),
        nullable=False
    )
    previous_status = Column(String(30))
    new_status = Column(String(30))
    camera_source = Column(String(100))
    recovery_time = Column(
        DateTime,
        default=lambda: datetime.now(timezone.utc)
    )
    description = Column(Text)

    identity = relationship("Identity")


# 4. Camera Model
class Camera(Base):
    __tablename__ = "cameras"

    id = Column(Integer, primary_key=True, index=True)
    camera_name = Column(String(100), nullable=False)
    location = Column(String(200))
    source_url = Column(String(500))
    is_active = Column(Boolean, default=False)
    status = Column(String(30), default="DISCONNECTED")
    created_at = Column(
        DateTime,
        default=lambda: datetime.now(timezone.utc)
    )


# 5. Monitoring Log Model
class MonitoringLog(Base):
    __tablename__ = "monitoring_logs"

    id = Column(Integer, primary_key=True, index=True)
    event_type = Column(String(100), nullable=False)
    message = Column(Text)
    camera_source = Column(String(100))
    processing_fps = Column(Float)
    created_at = Column(
        DateTime,
        default=lambda: datetime.now(timezone.utc)
    )