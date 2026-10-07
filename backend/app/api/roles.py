"""Roles API router for role taxonomy and role evolution."""
from typing import List
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.schemas.role import RoleResponse, RoleEvolutionResponse
from app.services.role_service import RoleService

router = APIRouter(prefix="/roles", tags=["Roles"])


@router.get("", response_model=List[RoleResponse])
def get_roles(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
    db: Session = Depends(get_db),
):
    """Retrieves list of active workforce roles."""
    return RoleService.get_all_roles(db=db, skip=skip, limit=limit)


@router.get("/{role}/evolution", response_model=RoleEvolutionResponse)
def get_role_evolution(
    role: str,
    db: Session = Depends(get_db),
):
    """Retrieves role composition shift, emerging skills, and declining skills."""
    return RoleService.get_role_evolution(db=db, role_name=role)
