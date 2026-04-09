from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database import get_db
from models.user import User
from services.auth_service import get_current_user
from services.insights_service import get_insights

router = APIRouter(prefix="/api/insights", tags=["Insights"])


@router.get("/")
def insights(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return get_insights(db, current_user.id)
