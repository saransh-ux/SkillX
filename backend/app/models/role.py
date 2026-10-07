"""Role taxonomy model."""
from sqlalchemy import Column, Integer, String, Index
from app.core.database import Base


class Role(Base):
    __tablename__ = "roles"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(128), nullable=False, unique=True, index=True)
    industry = Column(String(128), nullable=False, index=True)

    __table_args__ = (
        Index("ix_roles_name_industry", "name", "industry"),
    )
