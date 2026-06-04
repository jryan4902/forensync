from datetime import datetime
from typing import Optional
from pydantic import BaseModel
from app.models import CaseStatus, CasePriority


class CaseCreate(BaseModel):
    title: str
    description: Optional[str] = None
    status: CaseStatus = CaseStatus.open
    priority: CasePriority = CasePriority.medium


class CaseUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    status: Optional[CaseStatus] = None
    priority: Optional[CasePriority] = None


class CaseResponse(BaseModel):
    id: int
    title: str
    description: Optional[str]
    status: CaseStatus
    priority: CasePriority
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}
