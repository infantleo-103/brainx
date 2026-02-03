import uuid
from sqlalchemy import Column, Integer, String, Boolean, TIMESTAMP, Enum
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
from app.db.base import Base
import enum

class UserRole(str, enum.Enum):
    admin = "admin"
    student = "student"
    parent = "parent"
    teacher = "teacher"
    coordinator = "coordinator"
    counselor = "counselor"

class User(Base):
    __tablename__ = "users"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    full_name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    phone = Column(String, nullable=True)
    password_hash = Column(String, nullable=False)
    role = Column(Enum(UserRole), nullable=False)
    status = Column(Boolean, default=True)
    profile_image = Column(String, nullable=True)
    created_at = Column(TIMESTAMP, server_default=func.now())
