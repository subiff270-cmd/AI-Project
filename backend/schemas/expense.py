from pydantic import BaseModel
from datetime import date
from typing import Optional


class ExpenseCreate(BaseModel):
    amount: float
    category: str
    date: date
    description: Optional[str] = None


class ExpenseUpdate(BaseModel):
    amount: Optional[float] = None
    category: Optional[str] = None
    date: Optional[date] = None
    description: Optional[str] = None


class ExpenseResponse(BaseModel):
    id: int
    amount: float
    category: str
    date: date
    description: Optional[str] = None

    class Config:
        from_attributes = True
