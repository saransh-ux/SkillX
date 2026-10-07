"""Service handling Role taxonomy and role evolution over time."""
from typing import List, Optional
from sqlalchemy.orm import Session
from app.models.role import Role
from app.schemas.role import RoleResponse, RoleEvolutionResponse


class RoleService:
    @staticmethod
    def get_all_roles(db: Session, skip: int = 0, limit: int = 100) -> List[RoleResponse]:
        """Retrieves list of active roles."""
        if db is None:
            return []
        try:
            roles = db.query(Role).offset(skip).limit(limit).all()
            return [RoleResponse.model_validate(r) for r in roles]
        except Exception:
            return []

    @staticmethod
    def get_role_evolution(db: Session, role_name: str) -> RoleEvolutionResponse:
        """
        Retrieves role evolution data.
        Returns an unpopulated baseline with is_real_data=False until real job history is ingested.
        """
        if db is None:
            return RoleEvolutionResponse(role=role_name, is_real_data=False)

        try:
            role_obj = db.query(Role).filter(Role.name.ilike(role_name)).first()
            if not role_obj:
                return RoleEvolutionResponse(
                    role=role_name,
                    is_real_data=False
                )

            return RoleEvolutionResponse(
                role=role_obj.name,
                industry=role_obj.industry,
                historical_years=[],
                top_emerging_skills=[],
                declining_skills=[],
                stable_core_skills=[],
                skill_composition=[],
                is_real_data=False
            )
        except Exception:
            return RoleEvolutionResponse(role=role_name, is_real_data=False)
